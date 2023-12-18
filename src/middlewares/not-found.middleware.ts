import { NextFunction, Request, Response } from "express";

export function notFound(req: Request, res: Response, next: NextFunction) {
  res.status(404);

  // Do not log favicon 404
  if (req.originalUrl.includes("icon")) {
    next();
    return;
  }

  const error = new Error(`Resource not found - ${req.originalUrl}`);
  next(error);
}
