import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { createVehicleRouter } from "./vehicles";
import { errorHandler } from "../middleware/errorHandler";
import { VehicleService } from "../services/vehicleService";
import { FakeVehicleRepository } from "../testing/fakeVehicleRepository";

const SECRET = "test-secret";
const tokenFor = (role: "USER" | "ADMIN") => `Bearer ${jwt.sign({ role }, SECRET, { subject: "1" })}`;
const camry = { make: "Toyota", model: "Camry", category: "Sedan", price: 25000, quantity: 5 };

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/vehicles", createVehicleRouter(new VehicleService(new FakeVehicleRepository()), SECRET));
  app.use(errorHandler);
  return app;
}

const addCamry = (app: express.Express, quantity = 5) =>
  request(app).post("/api/vehicles").set("Authorization", tokenFor("USER")).send({ ...camry, quantity });

describe("vehicle routes", () => {
  it("requires authentication", async () => {
    const res = await request(buildApp()).get("/api/vehicles");
    expect(res.status).toBe(401);
  });

  it("creates a vehicle", async () => {
    const res = await addCamry(buildApp());
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id: 1, ...camry });
  });

  it("returns 400 for an invalid vehicle", async () => {
    const res = await request(buildApp()).post("/api/vehicles").set("Authorization", tokenFor("USER")).send({ ...camry, price: 0 });
    expect(res.status).toBe(400);
  });

  it("lists vehicles with pagination", async () => {
    const app = buildApp();
    await addCamry(app);
    await addCamry(app);
    await addCamry(app);

    const res = await request(app).get("/api/vehicles?limit=2").set("Authorization", tokenFor("USER"));

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body).toMatchObject({ page: 1, limit: 2, total: 3, totalPages: 2 });
  });

  it("searches by make, category and price", async () => {
    const app = buildApp();
    await addCamry(app);
    await request(app).post("/api/vehicles").set("Authorization", tokenFor("USER"))
      .send({ make: "Ford", model: "F-150", category: "Truck", price: 45000, quantity: 2 });

    const res = await request(app)
      .get("/api/vehicles/search?make=ford&category=truck&minPrice=40000")
      .set("Authorization", tokenFor("USER"));

    expect(res.body.data.map((v: { model: string }) => v.model)).toEqual(["F-150"]);
  });

  it("updates a vehicle and returns 404 for an unknown one", async () => {
    const app = buildApp();
    await addCamry(app);

    const ok = await request(app).put("/api/vehicles/1").set("Authorization", tokenFor("USER")).send({ ...camry, price: 24000 });
    const missing = await request(app).put("/api/vehicles/99").set("Authorization", tokenFor("USER")).send(camry);

    expect(ok.status).toBe(200);
    expect(ok.body.price).toBe(24000);
    expect(missing.status).toBe(404);
  });

  it("only lets admins delete", async () => {
    const app = buildApp();
    await addCamry(app);

    const forbidden = await request(app).delete("/api/vehicles/1").set("Authorization", tokenFor("USER"));
    const ok = await request(app).delete("/api/vehicles/1").set("Authorization", tokenFor("ADMIN"));

    expect(forbidden.status).toBe(403);
    expect(ok.status).toBe(204);
  });

  it("purchases a vehicle and refuses when out of stock", async () => {
    const app = buildApp();
    await addCamry(app, 1);

    const first = await request(app).post("/api/vehicles/1/purchase").set("Authorization", tokenFor("USER"));
    const second = await request(app).post("/api/vehicles/1/purchase").set("Authorization", tokenFor("USER"));

    expect(first.status).toBe(200);
    expect(first.body.quantity).toBe(0);
    expect(second.status).toBe(409);
  });

  it("only lets admins restock", async () => {
    const app = buildApp();
    await addCamry(app, 0);

    const forbidden = await request(app).post("/api/vehicles/1/restock").set("Authorization", tokenFor("USER")).send({ quantity: 5 });
    const ok = await request(app).post("/api/vehicles/1/restock").set("Authorization", tokenFor("ADMIN")).send({ quantity: 5 });

    expect(forbidden.status).toBe(403);
    expect(ok.body.quantity).toBe(5);
  });

  it("returns 400 for a non-numeric id", async () => {
    const res = await request(buildApp()).put("/api/vehicles/abc").set("Authorization", tokenFor("USER")).send(camry);
    expect(res.status).toBe(400);
  });
});