import { Document } from "mongoose";

declare global {

  interface Config {
    manageDomain: string;
    env: string;
    root: string;
    port: number;
    ip: string;
    defaultEmail: string;
    sendgridKey: string;
    apiKey: string;
    jwtSecret: string;
    mongo: {
      uri: string;
      options: {
        [key: string]: object | string | number | boolean,
      }
    }
  }

  interface Error {
    StatusCode?: number;
  }
}
