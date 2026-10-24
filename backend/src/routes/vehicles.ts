import { Request, RequestHandler, Response, Router } from "express";
import { HttpError } from "../errors";
import { authenticate, requireAdmin } from "../middleware/auth";
import { VehicleService } from "../services/vehicleService";

function parseId(raw: unknown): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id < 1) throw new HttpError(400, "invalid vehicle id");
  return id;
}

/** Wraps an async handler so that any thrown error reaches the error handler. */
const handle =
  (fn: (req: Request, res: Response) => Promise<void>): RequestHandler =>
  (req, res, next) => {
    fn(req, res).catch(next);
  };

export function createVehicleRouter(vehicles: VehicleService, jwtSecret: string): Router {
  const router = Router();
  router.use(authenticate(jwtSecret)); // every vehicle route needs a valid token

  const list = handle(async (req, res) => {
    res.json(await vehicles.list(req.query));
  });
  router.get("/", list);
  router.get("/search", list);

  router.post("/", handle(async (req, res) => {
    res.status(201).json(await vehicles.create(req.body ?? {}));
  }));

  router.put("/:id", handle(async (req, res) => {
    res.json(await vehicles.update(parseId(req.params.id), req.body ?? {}));
  }));

  router.delete("/:id", requireAdmin, handle(async (req, res) => {
    await vehicles.delete(parseId(req.params.id));
    res.status(204).end();
  }));

  router.post("/:id/purchase", handle(async (req, res) => {
    res.json(await vehicles.purchase(parseId(req.params.id), req.body?.quantity));
  }));

  router.post("/:id/restock", requireAdmin, handle(async (req, res) => {
    res.json(await vehicles.restock(parseId(req.params.id), req.body?.quantity));
  }));

  return router;
}