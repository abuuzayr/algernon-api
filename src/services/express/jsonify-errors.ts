import { Request, Response, NextFunction } from "express";
import { DomainError } from "../../error";
import C from "../../config";

export const jsonifyErrors = () =>
  (err: Error, req: Request, res: Response, next: NextFunction) => {
    let statusCode = err.StatusCode || 500;

    if (C.env !== "development") {
      delete err.stack;
    }

    if (err.name === "ValidationError") {
      statusCode = 400;
    }

    if (err instanceof DomainError) {
      statusCode = 404;
    }

    res.status(statusCode).json(err);
  };