import "dotenv/config";
import express from "express";
import path from "path";
import { createApp } from "./app";
import { PrismaUserRepository } from "./repositories/prismaUserRepository";
import { PrismaVehicleRepository } from "./repositories/prismaVehicleRepository";
import { AuthService } from "./services/authService";
import { VehicleService } from "./services/vehicleService";

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) throw new Error("JWT_SECRET must be set");

const app = createApp({
  authService: new AuthService(new PrismaUserRepository(), jwtSecret),
  vehicleService: new VehicleService(new PrismaVehicleRepository()),
  jwtSecret,
});

// In production this same server also serves the built React app.
const clientDir = path.resolve(__dirname, "../../frontend/dist");
app.use(express.static(clientDir));
app.use((req, res, next) => {
  if (req.method === "GET" && !req.path.startsWith("/api")) {
    res.sendFile(path.join(clientDir, "index.html"));
    return;
  }
  next();
});

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => console.log(`API listening on port ${PORT}`));