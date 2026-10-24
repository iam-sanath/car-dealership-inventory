import express from "express";
import request from "supertest";
import { createAuthRouter } from "./auth";
import { errorHandler } from "../middleware/errorHandler";
import { AuthService } from "../services/authService";
import { FakeUserRepository } from "../testing/fakeUserRepository";

function buildApp() {
  const service = new AuthService(new FakeUserRepository(), "test-secret");
  const app = express();
  app.use(express.json());
  app.use("/api/auth", createAuthRouter(service));
  app.use(errorHandler);
  return app;
}

const valid = { name: "Asha", email: "asha@example.com", password: "password123" };

describe("POST /api/auth/register", () => {
  it("returns 201 and the new user without a password hash", async () => {
    const res = await request(buildApp()).post("/api/auth/register").send(valid);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ email: "asha@example.com", role: "USER" });
    expect(res.body).not.toHaveProperty("passwordHash");
  });

  it("returns 400 for invalid input", async () => {
    const res = await request(buildApp()).post("/api/auth/register").send({ ...valid, password: "short" });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("password");
  });

  it("returns 409 when the email is already registered", async () => {
    const app = buildApp();
    await request(app).post("/api/auth/register").send(valid);
    const res = await request(app).post("/api/auth/register").send(valid);

    expect(res.status).toBe(409);
  });
});

describe("POST /api/auth/login", () => {
  it("returns 200 and a token for valid credentials", async () => {
    const app = buildApp();
    await request(app).post("/api/auth/register").send(valid);
    const res = await request(app).post("/api/auth/login").send({ email: valid.email, password: valid.password });

    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe("string");
    expect(res.body.user.email).toBe(valid.email);
  });

  it("returns 401 for a wrong password", async () => {
    const app = buildApp();
    await request(app).post("/api/auth/register").send(valid);
    const res = await request(app).post("/api/auth/login").send({ email: valid.email, password: "wrong-password" });

    expect(res.status).toBe(401);
  });
});