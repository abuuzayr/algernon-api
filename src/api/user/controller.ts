import * as _ from "lodash";
import { Request, Response, NextFunction } from "express";
import { MongoError } from "mongodb";
import { success, notFound } from "../../services/response/";
import { User } from "./model";

export const index = (
  { querymen: { query, select, cursor } }: Request,
  res: Response,
  next: NextFunction
) =>
  User.find(query, select, cursor)
    .then((users) => users.map((user) => user.view()))
    .then(success(res))
    .catch(next);

export const show = (
  { params }: Request,
  res: Response,
  next: NextFunction
) =>
  User.findById(params.id)
    .then(notFound(res))
    .then((user) => user ? user.view() : undefined)
    .then(success(res))
    .catch(next);

export const showMe = (
  { user }: Request, res: Response) =>
  res.json(user.view(true));

export const create = (
  { bodymen: { body } }: Request,
  res: Response,
  next: NextFunction
) => {
  const u = new User(body);
  u.save()
    .then((user) => user.view(true))
    .then(success(res, 201))
    .catch((err: MongoError) => {
      if (err.name === "MongoError" && err.code === 11000) {
        res.status(409).json({
          valid: false,
          param: "email",
          message: "email already registered"
        });
      } else {
        next(err);
      }
    });
};

export const updateMe = (
  { bodymen: { body }, user }: Request,
  res: Response,
  next: NextFunction
) =>
  User.findById(user.id)
    .then(notFound(res))
    .then((result) => {
      if (!result) return undefined;
      if (user.id !== result.id) {
        res.status(401).json({
          valid: false,
          message: "You can't change other user's data"
        });
        return undefined;
      }
      return result;
    })
    .then((user) => user ? _.merge(user, body).save() : undefined)
    .then((user) => user ? user.view(true) : undefined)
    .then(success(res))
    .catch(next);

export const update = (
  { bodymen: { body }, params, user }: Request,
  res: Response,
  next: NextFunction) =>
  User.findById(params.id)
    .then(notFound(res))
    .then((user) => user ? _.merge(user, body).save() : undefined)
    .then((user) => user ? user.view(true) : undefined)
    .then(success(res))
    .catch(next);

export const updatePassword = (
  { bodymen: { body }, params, user }: Request,
  res: Response,
  next: NextFunction
) =>
  User.findById(params.id === "me" ? user.id : params.id)
    .then(notFound(res))
    .then((result) => {
      if (!result) return undefined;
      const isSelfUpdate = user.id === result.id;
      if (!isSelfUpdate) {
        res.status(401).json({
          valid: false,
          param: "password",
          message: "You can\"t change other user\"s password"
        });
        return undefined;
      }
      return result;
    })
    .then((user) => user ? user.set({ password: body.password }).save() : undefined)
    .then((user) => user ? user.view(true) : undefined)
    .then(success(res))
    .catch(next);

export const destroy = (
  { params }: Request, res: Response, next: NextFunction) =>
  User.findById(params.id)
    .then(notFound(res))
    .then((user) => user ? user.remove() : undefined)
    .then(success(res, 204))
    .catch(next);
