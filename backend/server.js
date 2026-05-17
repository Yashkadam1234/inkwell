// server.js — Inkwell Backend
import dotenv from "dotenv";
dotenv.config();
console.log("JWT_SECRET loaded:", !!process.env.JWT_SECRET);

import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { initDb } from "./db/init.js";
import authRoutes from "./routes/auth.js";
import notesRoutes from "./routes/notes.js";
import aiRoutes from "./routes/ai.js";
import insightsRoutes from "./routes/insights.js";

// Initialise DB on startup (async)
await initDb();

const app = express();
const PORT = process.env.PORT || 4000;

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json({ limit: "2mb" }));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true });
const aiLimiter = rateLimit({ windowMs: 60 * 1000, max: 10, message: { error: "Too many AI requests, slow down" } });
app.use(limiter);

// ── Routes ───────────────────────────────────────────────────────────────────
app.use("/auth", authRoutes);
app.use("/notes", notesRoutes);
app.use("/ai", aiLimiter, aiRoutes);
app.use("/insights", insightsRoutes);

// Health check
app.get("/health", (_, res) => res.json({ status: "ok", service: "Inkwell API", ts: new Date().toISOString() }));

// 404
app.use((_, res) => res.status(404).json({ error: "Route not found" }));

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`✦ Inkwell API running on http://localhost:${PORT}`);
});
