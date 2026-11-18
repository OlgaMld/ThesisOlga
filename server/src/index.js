import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "path";
import { pool } from "./config/db.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import cvRoutes from "./routes/cvRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import { getProviderHealthStatus } from "./services/llmService.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 5000);

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true
  })
);
app.use(express.json());
app.use("/uploads", express.static(path.resolve("uploads")));

app.get("/api/health", async (_req, res) => {
  const [rows] = await pool.query("SELECT 1 AS ok");
  res.json({ ok: Boolean(rows[0]?.ok) });
});

app.get("/api/llm-status", (_req, res) => {
  const providers = [
    { key: "mock", enabled: true, label: "Mock" },
    { key: "openai", enabled: Boolean(process.env.OPENAI_API_KEY), label: "OpenAI" },
    { key: "gemini", enabled: Boolean(process.env.GEMINI_API_KEY), label: "Gemini" },
    { key: "claude", enabled: Boolean(process.env.ANTHROPIC_API_KEY), label: "Claude" },
    { key: "mistral", enabled: Boolean(process.env.MISTRAL_API_KEY), label: "Mistral" }
  ];

  res.json({ providers });
});

app.get("/api/llm-health", async (_req, res) => {
  try {
    const providers = await getProviderHealthStatus();
    res.json({ providers });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to check provider health." });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/cvs", cvRoutes);
app.use("/api/applications", applicationRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: err.message || "Κάτι πήγε στραβά." });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

