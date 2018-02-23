import { Document, Model } from "mongoose";
import { IUserDocument } from "../user/interfaces";

export interface ISalesChannelDocument extends Document {
  owner: IUserDocument,
}

export interface ISalesChannel extends ISalesChannelDocument {
  view(full?: boolean): ISalesChannel;
}

export interface ISalesChannelModel extends Model<ISalesChannel> {
}
