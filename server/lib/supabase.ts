/**
 * Express server Supabase client wrapper
 *
 * This file re-exports Supabase clients from the shared API package.
 * All Supabase client logic is centralized in packages/api/src/lib/supabase-server.ts
 *
 * IMPORTANT: Never import this file in client-side code.
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@12-step-companion/types";

// Load environment variables
import "../env";
import { env } from "../env";

// Re-export centralized Supabase clients from API package
export { supabaseServer, createUserClient } from "@12-step-companion/api/lib/supabase-server";

/**
 * Get Supabase client for anonymous operations
 * Uses anon key - RLS policies will be enforced
 */
const supabaseUrl = env.SUPABASE_URL;
const supabaseAnonKey = env.SUPABASE_ANON_KEY;

export const supabaseAnon = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

