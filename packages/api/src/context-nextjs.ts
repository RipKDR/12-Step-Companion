/**
 * tRPC Context for Next.js App Router
 * 
 * Creates the context for tRPC requests in Next.js API routes
 */

import type { inferAsyncReturnType } from "@trpc/server";
import { supabaseServer, createUserClient } from "./lib/supabase-server";
import type { NextRequest } from "next/server";

/**
 * Create tRPC context from Next.js request
 * 
 * @param opts - Next.js request object
 * @returns tRPC context with auth and db access
 */
export async function createContextNextJS(opts: { req: NextRequest }) {
  const { req } = opts;

  // Get auth token from request headers
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  let userId: string | null = null;
  let supabase = supabaseServer; // Default to server client (bypasses RLS)

  // If token provided, create user-scoped client (respects RLS)
  if (token) {
    try {
      const userClient = createUserClient(token);
      const { data: { user }, error } = await userClient.auth.getUser();
      
      if (!error && user) {
        userId = user.id;
        supabase = userClient; // Use user-scoped client for RLS
      }
    } catch (error) {
      // Invalid token - continue with server client
      console.warn("Failed to get user from token:", error);
    }
  }

  return {
    req,
    userId,
    supabase,
    // Helper to check if user is authenticated
    isAuthenticated: () => userId !== null,
  };
}

export type ContextNextJS = inferAsyncReturnType<typeof createContextNextJS>;

