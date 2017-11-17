import { Request, Response, NextFunction } from "express";

export const domainFromHost = (h: string | string[]) => {
  if (Array.isArray(h)) {
    h = h[0];
  }
  if (h.indexOf(":") > 0) {
    return h.split(":")[0];
  }
  return h;
};

export const domainTools = () =>
  (err: Error, req: Request, res: Response, next: NextFunction) => {
    req.domain = domainFromHost(req.headers.host);
  };