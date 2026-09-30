import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db.js";
import jobsRouter from "./routes/jobs.js"

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/jobs",jobsRouter);
app.get("/", (req, res) => {
  res.json({
    message: "JobRadar API is running 🚀",
  });
});

app.get("/api", (req, res) => {
  res.json({
    status: "OK",
    message: "Backend is healthy",
  });
});

app.get("/api/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      status: "OK",
      message: "PostgreSQL connected successfully 🚀",
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error("Database error:", error);

    res.status(500).json({
      status: "ERROR",
      message: "Database connection failed",
    });
  }
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});