/**
 * Express server Supabase client wrapper
 * 
 * This file provides Supabase client access for Express.js routes.
 * It uses the service role key for server-side operations.
 * 
 * IMPORTANT: Never import this file in client-side code.
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../packages/types/src/supabase";

// Load environment variables
import "../env";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Missing env: SUPABASE_URL");
}

if (!supabaseServiceRoleKey) {
  throw new Error("Missing env: SUPABASE_SERVICE_ROLE_KEY");
}

if (!supabaseAnonKey) {
  throw new Error("Missing env: SUPABASE_ANON_KEY");
}

// Verify service role key format
// Service role keys are JWT tokens (200+ chars) that start with "eyJ"
// They don't contain "service_role" as plain text (it's in the decoded payload)
if (supabaseServiceRoleKey.length < 100 || !supabaseServiceRoleKey.startsWith("eyJ")) {
  throw new Error(
    "SECURITY ERROR: Invalid service role key format. Expected JWT token (200+ chars starting with 'eyJ')."
  );
}

/**
 * Server-side Supabase client with service role key
 * Bypasses RLS - use with caution
 */
export const supabaseServer = createClient<Database>(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * Create a Supabase client scoped to a specific user
 * This respects RLS policies for that user
 * 
 * @param accessToken - User's JWT access token from Supabase Auth
 * @returns Supabase client scoped to the user
 */
export function createUserClient(accessToken: string) {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Get Supabase client for anonymous operations
 * Uses anon key - RLS policies will be enforced
 */
export const supabaseAnon = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

