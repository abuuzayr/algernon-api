import * as validate from "validate.js";
import { IPasswordReset } from "./interfaces";
import { Request, Response, NextFunction } from "express";
import {
  createValidator,
  createBodyValidateMiddleware,
  emailConstraint,
  passwordConstraint
} from "../../util/validator";

export const validateCreate = createValidator<IPasswordReset>({
    email: emailConstraint,
    link: {
      presence: true,
      url: {
        schemes: ["http", "https"],
      },
    },
});

export const validateUpdate = createValidator<IPasswordReset>({
    password: passwordConstraint,
});

export const validateRequest = (type: string) => {
  if (type === "POST /") {
    return createBodyValidateMiddleware(validateCreate);
  }
  if (type === "PUT /:token") {
    return createBodyValidateMiddleware(validateUpdate);
  }
};