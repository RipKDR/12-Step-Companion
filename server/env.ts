// This file must be imported FIRST before any other server files
// It ensures environment variables are loaded before db.ts is evaluated
import "dotenv/config";

// Verify DATABASE_URL is loaded (for debugging)
if (!process.env.DATABASE_URL) {
  console.warn("⚠️  WARNING: DATABASE_URL is not set. Database features will not work.");
}

