import { Document, Model } from "mongoose";

export interface ISalesChannelDocument extends Document {
  userRef: string;
}

export interface ISalesChannel extends ISalesChannelDocument {
  view(full?: boolean): ISalesChannel;
}

export interface ISalesChannelModel extends Model<ISalesChannel> {
}
