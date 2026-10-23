import express from "express";

export function createApp() {
  const app = express();
  app.use(express.json()); // lets Express read JSON request bodies

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  return app;
}