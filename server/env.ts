/**
 * Environment Variable Validation
 *
 * Validates and exports environment variables with proper types
 */

import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().default("5000"),

  // Supabase (Required)
  SUPABASE_URL: z.string().url("SUPABASE_URL must be a valid URL"),
  SUPABASE_ANON_KEY: z.string().min(100, "SUPABASE_ANON_KEY appears invalid"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(200, "SUPABASE_SERVICE_ROLE_KEY appears invalid"),

  // Database (Optional - for direct Postgres access)
  DATABASE_URL: z.string().url().optional(),

  // Optional Services
  GEMINI_API_KEY: z.string().optional(),
  SESSION_SECRET: z.string().optional(),

  // Next.js (Optional - for web app)
  NEXTAUTH_SECRET: z.string().optional(),
  NEXTAUTH_URL: z.string().url().optional(),

  // Observability (Optional)
  SENTRY_DSN: z.string().url().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
  POSTHOG_API_KEY: z.string().optional(),
  POSTHOG_HOST: z.string().url().optional(),

  // Feature Flags
  ENABLE_GEOFENCING: z.string().transform(val => val === "true").optional(),
  ENABLE_SPONSOR_SHARING: z.string().transform(val => val === "true").optional(),

  // Redis (Optional - for rate limiting)
  REDIS_URL: z.string().url().optional(),
});

let env: z.infer<typeof envSchema>;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error("❌ Environment variable validation failed:");
    error.errors.forEach((err) => {
      const path = err.path.join(".");
      console.error(`  - ${path}: ${err.message}`);
    });
    console.error("\nPlease check your .env file and ensure all required variables are set.");
    process.exit(1);
  }
  throw error;
}

// Verify Supabase URL format
if (env.SUPABASE_URL && !env.SUPABASE_URL.includes("supabase.co")) {
  console.warn("⚠️  SUPABASE_URL doesn't look like a Supabase URL");
}

// Verify service role key format (should be JWT)
if (env.SUPABASE_SERVICE_ROLE_KEY && !env.SUPABASE_SERVICE_ROLE_KEY.startsWith("eyJ")) {
  console.warn("⚠️  SUPABASE_SERVICE_ROLE_KEY doesn't look like a JWT token");
}

export { env };
