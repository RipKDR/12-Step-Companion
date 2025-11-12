import { defineConfig } from "drizzle-kit";
// Load environment variables first
import "dotenv/config";

// For Neon compatibility, use the "postgres" dialect and ensure the connection string uses sslmode=require.
if (!process.env.DATABASE_URL) {
  throw new Error("Missing DATABASE_URL for Neon database connection");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql", // "postgresql" is the recommended dialect for Neon
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
