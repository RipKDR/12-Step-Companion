/**
 * Client-side Supabase client
 *
 * IMPORTANT: This file is for client-side use (API routes, server components).
 * It uses the anon key and respects RLS policies.
 *
 * For server-side operations that need to bypass RLS, use supabase-server.ts instead.
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@12-step-companion/types";

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Missing env: SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL");
}

if (!supabaseAnonKey) {
  throw new Error("Missing env: SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

/**
 * Client-side Supabase client
 * Uses anon key - RLS policies will be enforced
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
