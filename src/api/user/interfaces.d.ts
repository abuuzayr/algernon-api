import { Document, Model } from "mongoose";
import { ISalesChannel } from "../sales-channel/interfaces";

export interface IUserDocument extends Document {
  id: string;
  email: string;
  picture: string;
  domain: string;
  salesChannel: ISalesChannel;
  name: string;
  password: string;
  role: string;
  authenticate: Function;
  services: {
    [service: string]: string;
  };
}

export interface IUser extends IUserDocument {
  view(full?: boolean): IUser;
}

export interface IUserModel extends Model<IUser> {
  createFromService(service: string, user: IUser): IUser;
}