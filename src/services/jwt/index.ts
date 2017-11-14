import * as jwt from "jsonwebtoken";
import {
  SignOptions,
  VerifyOptions
} from "jsonwebtoken";
import config from "../../config";

const jwtSign = (
  payload: string | Buffer | object,
  secretOrPrivateKey: string,
  options?: SignOptions
) =>
  new Promise((resolve, reject) =>
    jwt.sign(payload, secretOrPrivateKey, (err, token) => {
      if (err) return reject(err);
      return resolve(token);
    })
  );

const jwtVerify = (
  token: string,
  secretOrPrivateKey: string,
  options?: VerifyOptions
) =>
  new Promise((resolve, reject) =>
    jwt.verify(token, secretOrPrivateKey, options, (err, decoded) => {
      if (err) return reject(err);
      return resolve(decoded);
    })
  );

export const sign = (id: string, options?: SignOptions) =>
  jwtSign({id}, config.jwtSecret, options);

export const signSync = (id: string, options?: SignOptions) =>
  jwt.sign({id}, config.jwtSecret, options);

export const verify = (token: string, options?: VerifyOptions) =>
  jwtVerify(token, config.jwtSecret, options);
