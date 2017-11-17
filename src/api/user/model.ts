import * as crypto from "crypto";
import * as bcrypt from "bcrypt";
import * as randtoken from "rand-token";
import { Schema, model } from "mongoose";
import * as mongooseKeywords from "mongoose-keywords";
import C from "../../config";
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
  salesChannel: {
    type: Schema.Types.ObjectId,
    ref: "SalesChannel",
    index: true
  },
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
    if (!this.salesChannel) {
      next(new Error("SalesChannel must be provided if role is customer or store_admin."));
      return;
    }
  }
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();

  const rounds = C.env === "test" ? 1 : 9;

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
    id, email, name, picture, domain, salesChannel }: IUser) {
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
          salesChannel,
          role: "customer"
        });
      }
    });
  }
};

userSchema.plugin(mongooseKeywords, { paths: ["email", "name"] });

export const User = model<IUser, IUserModel>("User", userSchema);
export const schema = User.schema;