import { Document, Model } from "mongoose";
import { IUserDocument } from "../user/interfaces";

export interface IPasswordResetDocument extends Document {
  user: IUserDocument;
  token: string;
}

export interface IPasswordReset extends IPasswordResetDocument {
  view(full?: boolean): IPasswordReset;
}

export interface IPasswordResetModel extends Model<IPasswordReset> {
}