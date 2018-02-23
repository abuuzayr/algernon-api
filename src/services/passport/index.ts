import * as passport from "passport";
import {
  BasicStrategy as _BasicStrategy,
  BasicVerifyFunctionWithRequest,
  BasicStrategyOptions,
  BasicVerifyFunction
} from "passport-http";
import { Strategy as BearerStrategy } from "passport-http-bearer";
import {
  Strategy as JwtStrategy,
  ExtractJwt, VerifiedCallback
} from "passport-jwt";
import * as validate from "validate.js";
import C from "../../config";
import * as facebookService from "../facebook";
import { User, schema } from "../../api/user/model";
import { IUser } from "../../api/user/interfaces";
import { Request, Response, NextFunction } from "express";
import { createValidator, passwordConstraint, emailConstraint } from "../../util/validator";

export const password = () => (req: Request, res: Response, next: NextFunction) =>
  passport.authenticate("password", { session: false }, (err: any, user: IUser, info: any) => {
    if (err && err.errors) {
      return res.status(400).json(err);
    } else if (err || !user) {
      return res.status(401).end();
    }
    req.logIn(user, { session: false }, (err) => {
      if (err) return res.status(401).end();
      next();
    });
  })(req, res, next);

export const facebook = () =>
  passport.authenticate("facebook", { session: false });

export const token = ({ required, roles }: { required: boolean, roles: string[]}) =>
  (req: Request, res: Response, next: NextFunction) =>
    passport.authenticate("token", { session: false }, (err: Error, user: IUser, info: any) => {
      if (err || (required && !user) || (required && !~roles.indexOf(user.role))) {
        return res.status(401).end();
      }
      req.logIn(user, { session: false }, (err) => {
        if (err) return res.status(401).end();
        next();
      });
    })(req, res, next);

// Workaround for https://typescript.codeplex.com/workitem/917
// Related: https://stackoverflow.com/questions/23217334/how-do-i-extend-a-typescript-class-definition-in-a-separate-definition-file
class BasicStrategy extends _BasicStrategy {
  constructor(options: BasicStrategyOptions, verify: BasicVerifyFunction | BasicVerifyFunctionWithRequest) {
    super(options, <BasicVerifyFunction>verify);
  }
}

passport.use("password", new BasicStrategy(
  { passReqToCallback: true },
  (req: Request, email: string, password: string, done: VerifiedCallback) => {
    const err = validate({ email, password }, {
      email: emailConstraint,
      password: passwordConstraint,
    });
    if (err) {
      return done({ errors: err });
    }
    User.findOne({ email, "salesChannel.domain": req.domain }).then((user: IUser) => {
      if (!user) {
        return done(true);
      }
      return user.authenticate(password).then((user: IUser) => {
        done(undefined, user);
      }).catch(done);
    });
  }
));

passport.use("facebook", new BearerStrategy(
  { passReqToCallback: true, scope: undefined, realm: undefined },
  (req: Request, token: string, done: VerifiedCallback) => {
    facebookService.getUser(token).then((user) => {
      return User.createFromService(user);
    }).then((user) => {
      done(undefined, user);
      return undefined;
    }).catch(done);
  }
));

passport.use("token", new JwtStrategy({
  secretOrKey: C.jwtSecret,
  jwtFromRequest: ExtractJwt.fromExtractors([
    ExtractJwt.fromUrlQueryParameter("access_token"),
    ExtractJwt.fromBodyField("access_token"),
    ExtractJwt.fromAuthHeaderWithScheme("Bearer")
  ]),
  passReqToCallback: true
}, (req: Request, { id }: IUser, done: VerifiedCallback) => {
  User.findOne({ _id: id, "salesChannel.domain": req.domain }).then((user) => {
    done(undefined, user);
    return undefined;
  }).catch(done);
}));
