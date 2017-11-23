import * as _ from "lodash";
import * as crypto from "crypto";
import * as bcrypt from "bcrypt";
import * as randtoken from "rand-token";
import { Schema, model } from "mongoose";
import * as mongooseKeywords from "mongoose-keywords";
import C from "../../config";
import { IUserModel, IUser, IUserDocument } from "./interfaces";

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
  role: {
    type: String,
    enum: roles,
    required: true
  },
  profile: {
    firstName: {
      type: String,
      trim: true,
      required: true,
    },
    lastName: {
      type: String,
      trim: true,
      required: true,
    },
    dob: Date,
    phone: String,
    picture: {
      type: String,
      trim: true
    },
    delivery: [{
      default: Boolean,
      firstName: {
        type: String,
        required: true,
      },
      lastName: {
        type: String,
        required: true,
      },
      dob: String,
      phone: String,
      address: String,
      postalCode: String,
      country: String,
    }],
    billing: {
      address: String,
      postalCode: String,
      country: String,
    }
  },
  services: {
    facebook: String
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
  if (!this.profile.picture || this.profile.picture.indexOf("https://gravatar.com") === 0) {
    const hash = crypto.createHash("md5").update(email).digest("hex");
    this.profile.picture = `https://gravatar.com/avatar/${hash}?d=identicon`;
  }

  return email;
});

userSchema.pre("validate", function (next) {
  if (this.role === "customer") {
    if (!this.salesChannel) {
      next(new Error("SalesChannel must be provided if role is customer."));
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
    const fields = ["id", "email", "createdAt", "role", "profile"];

    fields.forEach((field) => { view[field] = this[field]; });

    return view;
  },

  authenticate (password: string) {
    return <Promise<IUser>>bcrypt.compare(password, this.password).then((valid) => valid ? this : false);
  }
};

userSchema.statics = {
  roles,

  createFromService (u: IUserDocument) {
    const service = Object.keys(u.services)[0];
    return this.findOne({
      $or: [{ [`services.${service}`]: u.id }, { email: u.email }]
    }).then((user: IUser) => {
      if (user) {
        user = _.merge(user, u);
        return user.save();
      } else {
        const password = randtoken.generate(16);
        return this.create({
          ...u,
          password,
          role: "customer",
        });
      }
    });
  }
};

userSchema.plugin(mongooseKeywords, { paths: ["email", "profile.firstName", "profile.lastName"] });

export const User = model<IUser, IUserModel>("User", userSchema);
export const schema = User.schema;