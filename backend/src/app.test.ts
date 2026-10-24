import request from "supertest";
import { createApp } from "./app";
import { AuthService } from "./services/authService";
import { VehicleService } from "./services/vehicleService";
import { FakeUserRepository } from "./testing/fakeUserRepository";
import { FakeVehicleRepository } from "./testing/fakeVehicleRepository";

const SECRET = "test-secret";

function buildApp() {
  return createApp({
    authService: new AuthService(new FakeUserRepository(), SECRET),
    vehicleService: new VehicleService(new FakeVehicleRepository()),
    jwtSecret: SECRET,
  });
}

describe("GET /api/health", () => {
  it("responds with status ok", async () => {
    const res = await request(buildApp()).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});

describe("app wiring", () => {
  it("protects vehicle routes", async () => {
    const res = await request(buildApp()).get("/api/vehicles");
    expect(res.status).toBe(401);
  });

  it("lets a user register, log in and list vehicles with the token", async () => {
    const app = buildApp();
    await request(app).post("/api/auth/register").send({ name: "Asha", email: "asha@example.com", password: "password123" });
    const login = await request(app).post("/api/auth/login").send({ email: "asha@example.com", password: "password123" });

    const res = await request(app).get("/api/vehicles").set("Authorization", `Bearer ${login.body.token}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ data: [], total: 0 });
  });
});