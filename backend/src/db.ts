import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();

console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Loaded" : "Missing");

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on("connect", () => {
  console.log("✅ PostgreSQL connected");
});

pool.on("error", (error) => {
  console.error("❌ Unexpected PostgreSQL error:", error);
});