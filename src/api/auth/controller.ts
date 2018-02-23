import { Request, Response, NextFunction } from "express";
import { sign } from "../../services/jwt";
import { success } from "../../services/response/";

export const login = (
  { user }: Request,
  res: Response,
  next: NextFunction
 ) =>
  sign(user.id)
    .then((token: string) => ({ token, user: user.view(true) }))
    .then(success(res, 201))
    .catch(next);
