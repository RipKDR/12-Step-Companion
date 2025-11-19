/**
 * Server-side Supabase client
 * 
 * IMPORTANT: This file uses the service role key and MUST NEVER be imported in client code.
 * Only use this in server-side code (Node.js, tRPC context, API routes).
 * 
 * Security: This bypasses RLS policies. Use with extreme caution.
 * Always prefer using the client-side supabase.ts with RLS when possible.
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../types/src/supabase";

// Environment check - ensure this is server-side only
if (typeof window !== "undefined") {
  throw new Error(
    "supabase-server.ts is server-side only. Use supabase.ts for client-side operations."
  );
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("Missing env: SUPABASE_URL");
}

if (!supabaseServiceRoleKey) {
  throw new Error("Missing env: SUPABASE_SERVICE_ROLE_KEY");
}

// Verify we're using service role key
// Service role keys are JWT tokens (200+ chars) that start with "eyJ"
// They don't contain "service_role" as plain text (it's in the decoded payload)
if (supabaseServiceRoleKey.length < 100 || !supabaseServiceRoleKey.startsWith("eyJ")) {
  throw new Error(
    "SECURITY ERROR: Invalid service role key format. Expected JWT token (200+ chars starting with 'eyJ')."
  );
}

/**
 * Server-side Supabase client with service role key
 * 
 * WARNING: This client bypasses Row Level Security (RLS) policies.
 * Only use when:
 * 1. You need to perform admin operations
 * 2. You're setting up RLS policies
 * 3. You're running migrations
 * 
 * For normal operations, use the client-side supabase.ts with RLS.
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

// Get anon key for createUserClient (but don't expose service role key)
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
if (!supabaseAnonKey) {
  throw new Error("Missing env: SUPABASE_ANON_KEY");
}

/**
 * Create a Supabase client with a user's access token
 * This respects RLS policies for that specific user
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

