import { Request, Response, NextFunction } from "express";
import { domainFromHost } from "../../../util/domain";

export const domainFilter = () =>
  (err: Error, req: Request, res: Response, next: NextFunction) => {
    req.domain = domainFromHost(req.headers.host);
  };