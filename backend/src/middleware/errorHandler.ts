import { NextFunction, Request, Response } from "express";
import { HttpError } from "../errors";

/** Turns thrown errors into JSON responses. Register it after all routes. */
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  console.error(err);
  res.status(500).json({ error: "internal server error" });
}