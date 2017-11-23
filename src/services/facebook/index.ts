import * as request from "request-promise";
import { IFacebookUser } from "./interfaces";
import { IUserDocument } from "../../api/user/interfaces";
import { RecursivePartial } from "../../types";

export const getUser = (accessToken: string) =>
  request({
    uri: "https://graph.facebook.com/me",
    json: true,
    qs: {
      access_token: accessToken,
      fields: "id, first_name, last_name, email, picture"
    }
  }).then(({ id, email, first_name, last_name, picture }: IFacebookUser) => {
    const u: RecursivePartial<IUserDocument> = {
      email,
      services: {
        facebook: id
      },
      profile: {
        picture: picture.data.url,
        firstName: first_name,
        lastName: last_name,
      }
    };
    return u;
  });
