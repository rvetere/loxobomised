import { Response, Request } from "express";
import { ErrorResponseContract } from "../contracts";

export function errorHandler(err: Error, req: Request, res: Response<ErrorResponseContract>) {
  if (typeof res.status === "function" && !res.headersSent) {
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
    res.status(statusCode);
    res.json({
      message: err.message,
      stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack,
    });
  }
}
