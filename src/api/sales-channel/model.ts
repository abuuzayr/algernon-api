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
  userRef: {
    type: Schema.Types.ObjectId,
    required: true,
    validate: {
      isAsync: true,
      validator (v: string, done: Function) {
        User.findById(v, (err: MongoError, doc) => {
          if (err) {
            done(false, `SalesChannel validation failed: ${err}`);
          }
          if (!doc) {
            done(false, "User not found.");
            return;
          }
          if (doc.role !== "store_admin") {
            done(false, "User can only be of role store_admin");
            return;
          }
          done(true);
        });
      }
    }
  },
  domain: {
    type: String,
    unique: true,
    // TODO: domain is required until we have multiple SCtypes
    required: true,
    validate: [
      {
        validator (v: string) {
          if (salesChannelTypes.indexOf(v) > -1) return false;
          return true;
        },
        message: "Not a valid SalesChannel"
      },
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
      userRef: this.userRef,
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