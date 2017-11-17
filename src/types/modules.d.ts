import * as supertest from "supertest";

declare module "supertest" {
  function supertest(app: any, domain: string): supertest.SuperTest<supertest.Test>;
}

import * as express from "express";

declare module "express" {
  interface Request {
    bodymen: {
      body: any,
    },
    querymen: {
      query: any,
      select: any,
      cursor: any,
    },
    domain: string,
  }
}
