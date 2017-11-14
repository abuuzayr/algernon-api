import * as crypto from "crypto";
import * as bcrypt from "bcrypt";
import * as randtoken from "rand-token";
import { Schema, model } from "mongoose";
import * as validate from "mongoose-validator";
import * as mongooseKeywords from "mongoose-keywords";
import config from "../../config";
import { SalesChannel, salesChannelTypes } from "../sales-channel/model";
import { IUserModel, IUser } from "./interfaces";

const roles = ["store_admin", "super_admin", "customer"];

const userSchema = new Schema({
  email: {
    type: String,
    match: /^\S+@\S+\.\S+$/,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    index: true,
    trim: true
  },
  services: {
    facebook: String
  },
  role: {
    type: String,
    enum: roles,
    required: true
  },
  picture: {
    type: String,
    trim: true
  },
  domain: {
    type: String,
    validate: validate({
      validator: "isFQDN",
      message: "Is not a FQDN"
    })
  },
  salesChannelType: {
    type: String,
    enum: salesChannelTypes
  }
}, {
  timestamps: true
});

userSchema.path("email").set(function (email: string) {
  if (!this.picture || this.picture.indexOf("https://gravatar.com") === 0) {
    const hash = crypto.createHash("md5").update(email).digest("hex");
    this.picture = `https://gravatar.com/avatar/${hash}?d=identicon`;
  }

  if (!this.name) {
    this.name = email.replace(/^(.+)@.+$/, "$1");
  }

  return email;
});

userSchema.pre("validate", function (next) {
  if (this.role === "customer") {
    if (!this.domain) {
      next(new Error("Domain must be provided if role is customer."));
      return;
    }

    if (!this.salesChannelType) {
      next(new Error("salesChannelType must be provided if role is customer."));
      return;
    }
  }
  next();
});

userSchema.pre("validate", function (next) {
  SalesChannel.findOne({
    domain: this.domain,
    type: this.salesChannelType
  }).exec().then((doc) => {
    if (!doc) {
      next(new Error("Creation of this customer is blocked because the targeted salesChannel does not exist."));
    }
  });
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();

  /* istanbul ignore next */
  const rounds = config.env === "test" ? 1 : 9;

  bcrypt.hash(this.password, rounds).then((hash) => {
    this.password = hash;
    next();
  }).catch(next);
});

userSchema.methods = {
  view (full?: boolean) {
    const view: any = {};
    const fields = ["id", "name", "picture", "email", "createdAt", "role"];

    fields.forEach((field) => { view[field] = this[field]; });

    return view;
  },

  authenticate (password: string) {
    return bcrypt.compare(password, this.password).then((valid) => valid ? this : false);
  }
};

userSchema.statics = {
  roles,

  createFromService (service: string, {
    id, email, name, picture, domain, salesChannelType }: IUser) {
    return this.findOne({
      $or: [{ [`services.${service}`]: id }, { email }]
    }).then((user: IUser) => {
      if (user) {
        user.services[service] = id;
        user.name = name;
        user.picture = picture;
        return user.save();
      } else {
        const password = randtoken.generate(16);
        return this.create({
          services: { [service]: id },
          email,
          password,
          name,
          picture,
          domain,
          salesChannelType,
          role: "customer"
        });
      }
    });
  }
};

userSchema.plugin(mongooseKeywords, { paths: ["email", "name"] });

export const User = model<IUser, IUserModel>("User", userSchema);
export const schema = User.schema;