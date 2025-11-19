// This file must be imported FIRST before any other server files
// It ensures environment variables are loaded before db.ts is evaluated
import "dotenv/config";

// Verify DATABASE_URL is loaded (for legacy Neon database - optional if using Supabase only)
// Note: Supabase uses SUPABASE_URL, not DATABASE_URL
if (!process.env.DATABASE_URL && !process.env.SUPABASE_URL) {
  console.warn("⚠️  WARNING: Neither DATABASE_URL nor SUPABASE_URL is set. Database features will not work.");
} else if (!process.env.DATABASE_URL && process.env.SUPABASE_URL) {
  // Using Supabase only - DATABASE_URL not needed
  // This is fine, suppress the warning
}

