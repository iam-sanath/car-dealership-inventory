import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { HttpError } from "../errors";
import { Role } from "../repositories/userRepository";

export interface AuthUser {
  id: number;
  role: Role;
}

// Lets TypeScript know that req.user exists after authenticate() runs.
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/** Requires "Authorization: Bearer <jwt>" and attaches req.user. */
export function authenticate(jwtSecret: string) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const [scheme, token] = (req.headers.authorization ?? "").split(" ");
    if (scheme !== "Bearer" || !token) {
      return next(new HttpError(401, "authentication required"));
    }

    try {
      const payload = jwt.verify(token, jwtSecret) as jwt.JwtPayload;
      req.user = { id: Number(payload.sub), role: payload.role as Role };
      next();
    } catch {
      next(new HttpError(401, "invalid or expired token"));
    }
  };
}

/** Allows only ADMIN users. Use it after authenticate(). */
export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (req.user?.role !== "ADMIN") {
    return next(new HttpError(403, "admin access required"));
  }
  next();
}