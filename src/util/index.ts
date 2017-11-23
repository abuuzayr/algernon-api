import { Request, Response, NextFunction } from "express";

export function createDebugMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log("The debug middleware is called.");
    next();
  };
}