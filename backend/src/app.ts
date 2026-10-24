import express from "express";
import { errorHandler } from "./middleware/errorHandler";
import { createAuthRouter } from "./routes/auth";
import { createVehicleRouter } from "./routes/vehicles";
import { AuthService } from "./services/authService";
import { VehicleService } from "./services/vehicleService";

/** Everything the app needs, passed in so tests can use fakes (dependency injection). */
export interface AppDeps {
  authService: AuthService;
  vehicleService: VehicleService;
  jwtSecret: string;
}

export function createApp(deps: AppDeps) {
  const app = express();
  app.use(express.json()); // lets Express read JSON request bodies

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });
  app.use("/api/auth", createAuthRouter(deps.authService));
  app.use("/api/vehicles", createVehicleRouter(deps.vehicleService, deps.jwtSecret));

  app.use(errorHandler); // must come last
  return app;
}