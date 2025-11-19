/**
 * Client-side Supabase client
 * 
 * IMPORTANT: This file MUST ONLY use the anon key.
 * Never import this file in server-side code.
 * For server-side operations, use supabase-server.ts instead.
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../types/src/supabase";

// Environment check - ensure this is client-side only
if (typeof window === "undefined" && typeof process !== "undefined" && process.env.NODE_ENV !== "test") {
  throw new Error(
    "supabase.ts is client-side only. Use supabase-server.ts for server-side operations."
  );
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Missing env: VITE_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL");
}

if (!supabaseAnonKey) {
  throw new Error("Missing env: VITE_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

// Verify we're using anon key, not service role key
if (supabaseAnonKey.includes("service_role") || supabaseAnonKey.length > 200) {
  throw new Error(
    "SECURITY ERROR: Service role key detected in client code. This is a critical security violation."
  );
}

/**
 * Client-side Supabase client
 * Uses anon key only - RLS policies enforce access control
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

