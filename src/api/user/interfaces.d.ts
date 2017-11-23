import { Document, Model } from "mongoose";
import { ISalesChannel } from "../sales-channel/interfaces";

export interface IDeliveryDetails {
  firstName: string,
  lastName: string,
  phone: string,
  address: string,
  postalCode: string,
  country: string,
  default: boolean,
}

export interface IUserDocument extends Document {
  id: string;
  role: string;
  email: string;
  password: string;
  salesChannel: ISalesChannel;
  createdAt: string;
  profile: {
    firstName: string,
    lastName: string,
    dob: string,
    phone: string,
    picture: string,
    delivery: IDeliveryDetails[];
    billing: {
      address: string,
      postalCode: string,
      country: string,
    },
  }
  services: {
    [service: string]: string;
  };
}

export interface IUser extends IUserDocument {
  view(full?: boolean): IUser;
  authenticate(password: string): Promise<IUser>;
}

export interface IUserModel extends Model<IUser> {
  createFromService(user: IUserDocument): IUser;
}