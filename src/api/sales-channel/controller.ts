import * as _ from "lodash";
import { success, notFound } from "../../services/response/";
import { SalesChannel } from "./model";
import { Request, Response, NextFunction } from "express";

export const create = (
  { bodymen: { body }, user }: Request,
  res: Response,
  next: NextFunction
) => {
  const msg = "You are not allowed to create SalesChannels for other users";
  if (user.role === "store_admin" && user.id !== body.owner) {
    res.status(401).json({
      valid: false,
      message: msg
    });
  }
  const sc = new SalesChannel(body);
  return sc.save()
    .then((salesChannel) => salesChannel.view(true))
    .then(success(res, 201))
    .catch(next);
};

export const index = (
  { querymen: { query, select, cursor }, user }: Request,
  res: Response,
  next: NextFunction
) =>
  SalesChannel.find(query, select, cursor)
    .then((salesChannels) => salesChannels.filter((sc) => sc.owner.id + "" === user.id))
    .then((salesChannels) => salesChannels.map((salesChannel) => salesChannel.view()))
    .then(success(res))
    .catch(next);

export const show = (
  { params, user }: Request,
  res: Response,
  next: NextFunction
) =>
  SalesChannel.findById(params.id)
    .then(notFound(res))
    .then((result) => {
      if (!result) return undefined;
      if (user.role === "super_admin" ||
        (user.role === "store_admin" && (result.owner + "") === user.id)) {
        return result;
      }
      res.status(401).json({
        valid: false,
        message: "You do not have access to this data."
      });
      return undefined;
    })
    .then((salesChannel) => salesChannel ? salesChannel.view() : undefined)
    .then(success(res))
    .catch(next);

export const update = (
  { bodymen: { body }, params, user }: Request,
  res: Response,
  next: NextFunction
) =>
  SalesChannel.findById(params.id)
    .then(notFound(res))
    .then((result) => {
      if (!result) return undefined;
      if (body.hasOwnProperty("type") && body.type !== result.type) {
        res.status(401).json({
          valid: false,
          message: "SalesChannelType is not allowed to be modified by anyone."
        });
        return undefined;
      }
      if (user.role === "super_admin") {
        return result;
      }
      if (user.role === "store_admin" && (result.owner + "") === user.id) {
        if (body.hasOwnProperty("owner") && body.owner !== user.id) {
          res.status(401).json({
            valid: false,
            message: "You have no rights to modify this data."
          });
          return undefined;
        }
        return result;
      }
      res.status(401).json({
        valid: false,
        message: "You have no rights to modify this data."
      });
      return undefined;
    })
    .then((salesChannel) => salesChannel ? _.merge(salesChannel, body).save() : undefined)
    .then((salesChannel) => salesChannel ? salesChannel.view(true) : undefined)
    .then(success(res))
    .catch(next);

export const destroy = (
  { params, user }: Request,
  res: Response,
  next: NextFunction
) =>
  SalesChannel.findById(params.id)
    .then(notFound(res))
    .then((sc) => {
      if (user.role === "super_admin" ||
        (user.role === "store_admin" && (sc.owner + "") === user.id)) {
        return sc;
      }
      res.status(401).json({
        valid: false,
        message: "You have no rights to delete this data."
      });
      return undefined;
    })
    .then((salesChannel) => salesChannel ? salesChannel.remove() : undefined)
    .then(success(res, 204))
    .catch(next);
