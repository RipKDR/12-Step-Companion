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
import type { Request, Response } from "express";
import { authenticateFromToken } from "./lib/auth-helper";

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

  // Authenticate and get user-scoped client
  const { userId, supabase } = await authenticateFromToken(token);

  return {
    req,
    res: opts.res,
    userId,
    supabase, // Can be null for unauthenticated requests
    // Helper to check if user is authenticated
    isAuthenticated: () => userId !== null && supabase !== null,
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;

