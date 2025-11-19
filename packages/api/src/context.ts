/**
 * tRPC Context for Express
 * 
 * Creates the context for tRPC requests in Express server, including:
 * - Supabase auth session
 * - Database access (via Supabase client)
 * - User information
 * 
 * NOTE: For Next.js App Router, use context-nextjs.ts instead
 */

import type { inferAsyncReturnType } from "@trpc/server";
import { supabaseServer, createUserClient } from "./lib/supabase-server";
import type { Request, Response } from "express";

/**
 * Create tRPC context from Express request/response
 * 
 * @param opts - Express request and response objects
 * @returns tRPC context with auth and db access
 */
export async function createContext(opts: { req: Request; res: Response }) {
  const { req } = opts;

  // Get auth token from request (could be in header, cookie, etc.)
  const authHeader = req.headers.authorization;
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
    res: opts.res,
    userId,
    supabase,
    // Helper to check if user is authenticated
    isAuthenticated: () => userId !== null,
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;

