import * as validate from "validate.js";
import { Request, Response, NextFunction } from "express";

export const emailConstraint = {
    email: true,
    presence: true,
};

export const passwordConstraint = {
  presence: true,
  length: {
    minimum: 4,
    message: "must be at least 4 characters."
  }
};

export function createValidator<T> (spec: object) {
  return (doc: T) => {
    return validate(doc, spec);
  };
}

export function createBodyValidateMiddleware(validator: Function) {
  return ({ body }: Request, res: Response, next: NextFunction) => {
    const err = validator(body);
    if (err) {
      return res.status(400).json({ errors: err });
    }
    next();
  };
}