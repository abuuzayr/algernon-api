import { sign } from "../../services/jwt";
import * as express from "express";
import { success } from "../../services/response/";
import config from "../../config";
import { NextFunction } from "express";

export const login = (
  { user }: express.Request,
  res: express.Response,
  next: NextFunction
 ) =>
  sign(user.id)
    .then((token: string) => ({ token, user: user.view(true) }))
    .then(success(res, 201))
    .catch(next);
