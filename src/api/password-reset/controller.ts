import { Request, Response, NextFunction } from "express";
import { success, notFound } from "../../services/response/";
import { sendMail } from "../../services/sendgrid";
import { PasswordReset } from "./model";
import { User } from "../user/model";
import { validateCreate } from "./validator";

export const create = (
  { mongoose: { body: { email, link } } }: Request,
  res: Response,
  next: NextFunction
) => {
  return User.findOne({ email: email })
    .then(notFound(res))
    .then((user) => user ? PasswordReset.create({ user }) : undefined)
    .then((reset) => {
      if (!reset) return undefined;
      const { user, token } = reset;
      link = `${link.replace(/\/$/, "")}/${token}`;
      const content = `
        Hey, ${user.profile.firstName}.<br><br>
        You requested a new password for your api account.<br>
        Please use the following link to set a new password. It will expire in 1 hour.<br><br>
        <a href="${link}">${link}</a><br><br>
        If you didn"t make this request then you can safely ignore this email. :)<br><br>
        &mdash; api Team
      `;
      return sendMail({ toEmail: email, subject: "api - Password Reset", content });
    })
    .then((response: any) => response ? res.status(response.statusCode).end() : undefined)
    .catch(next);
};

export const show = (
  { params: { token } }: Request,
  res: Response,
  next: NextFunction
) =>
  PasswordReset.findOne({ token })
    .populate("user")
    .then(notFound(res))
    .then((reset) => reset ? reset.view(true) : undefined)
    .then(success(res))
    .catch(next);

export const update = (
  { params: { token }, mongoose: { body: { password } } }: Request,
  res: Response,
  next: NextFunction
) => {
  return PasswordReset.findOne({ token })
    .populate("user")
    .then(notFound(res))
    .then((reset) => {
      if (!reset) return undefined;
      const { user } = reset;
      return user.set({ password }).save()
        .then(() => PasswordReset.remove({ user }))
        .then(() => user.view(true));
    })
    .then(success(res))
    .catch(next);
};
