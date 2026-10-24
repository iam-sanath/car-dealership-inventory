import { NextFunction, Request, Response, Router } from "express";
import { AuthService } from "../services/authService";

export function createAuthRouter(auth: AuthService): Router {
  const router = Router();

  router.post("/register", async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(201).json(await auth.register(req.body ?? {}));
    } catch (err) {
      next(err);
    }
  });

  router.post("/login", async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(await auth.login(req.body ?? {}));
    } catch (err) {
      next(err);
    }
  });

  return router;
}