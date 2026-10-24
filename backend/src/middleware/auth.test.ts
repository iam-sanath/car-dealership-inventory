import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { authenticate, requireAdmin } from "./auth";
import { errorHandler } from "./errorHandler";

const SECRET = "test-secret";
const tokenFor = (role: "USER" | "ADMIN", id = 1) => jwt.sign({ role }, SECRET, { subject: String(id) });

function buildApp() {
  const app = express();
  app.get("/protected", authenticate(SECRET), (req, res) => {
    res.json({ user: req.user });
  });
  app.get("/admin", authenticate(SECRET), requireAdmin, (_req, res) => {
    res.json({ ok: true });
  });
  app.use(errorHandler);
  return app;
}

describe("authenticate", () => {
  it("returns 401 without a token", async () => {
    const res = await request(buildApp()).get("/protected");
    expect(res.status).toBe(401);
  });

  it("returns 401 for an invalid token", async () => {
    const res = await request(buildApp()).get("/protected").set("Authorization", "Bearer not-a-real-token");
    expect(res.status).toBe(401);
  });

  it("attaches the user from a valid token", async () => {
    const res = await request(buildApp()).get("/protected").set("Authorization", `Bearer ${tokenFor("USER", 7)}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ user: { id: 7, role: "USER" } });
  });
});

describe("requireAdmin", () => {
  it("returns 403 for a normal user", async () => {
    const res = await request(buildApp()).get("/admin").set("Authorization", `Bearer ${tokenFor("USER")}`);
    expect(res.status).toBe(403);
  });

  it("allows an admin", async () => {
    const res = await request(buildApp()).get("/admin").set("Authorization", `Bearer ${tokenFor("ADMIN")}`);
    expect(res.status).toBe(200);
  });
});