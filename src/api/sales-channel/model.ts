import { Schema, model } from "mongoose";
import * as validate from "mongoose-validator";
import { MongoError } from "mongodb";
import { User } from "../user/model";
import { ISalesChannel, ISalesChannelModel } from "./interfaces";

// TODO: make use of discriminator schemas (mongoose) when there
// are other SC types
export const salesChannelTypes = [
  "ecommerce"
];

const salesChannelSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    index: true,
    required: true,
    validate: {
      isAsync: true,
      validator(v: string, done: Function) {
        User.findById(v, (err: MongoError, doc) => {
          if (err) return done(false, err + "");
          if (!doc) return done(false, "User not found.");
          if (doc.role !== "store_admin")
            return done(false, "User can only be of role store_admin");
          done(true);
        });
      },
    }
  },
  domain: {
    type: String,
    unique: true,
    // TODO: domain is required until we have multiple SCtypes
    required: true,
    validate: [
      validate({
        validator: "isFQDN",
        message: "Is not a FQDN"
      })
    ]
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: salesChannelTypes,
    required: true
  },
  siteData: {
    type: Schema.Types.Mixed
  },
  emailTemplates: {
    type: Schema.Types.Mixed
  },
  easyShip: {
    type: Schema.Types.Mixed
  },
  facebook: {
    type: Schema.Types.Mixed
  },
  sendGrid: {
    type: Schema.Types.Mixed
  }
}, {
  timestamps: true
});

salesChannelSchema.methods = {
  view (full?: boolean) {
    const view = {
      // simple view
      id: this.id,
      owner: this.owner,
      domain: this.domain,
      name: this.name,
      type: this.type,
      siteData: this.siteData,
      emailTemplates: this.emailTemplates,
      easyShip: this.easyShip,
      facebook: this.facebook,
      sendGrid: this.sendGrid,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };

    return full ? {
      ...view
      // add properties for a full view
    } : view;
  }
};

export const SalesChannel = model<ISalesChannel, ISalesChannelModel>("SalesChannel", salesChannelSchema);
export const schema = SalesChannel.schema;