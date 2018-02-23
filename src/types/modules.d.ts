import * as supertest from "supertest";

declare module "supertest" {
  function supertest(app: any, domain: string): supertest.SuperTest<supertest.Test>;
}

import * as express from "express";

declare module "express" {
  interface Request {
    domain: string,
    mongoose: {
      query?: any,
      body?: any,
    },
  }
}
