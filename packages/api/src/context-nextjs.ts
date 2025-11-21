/**
 * tRPC Context for Next.js App Router
 *
 * Creates the context for tRPC requests in Next.js API routes
 */

import type { inferAsyncReturnType } from "@trpc/server";
import type { NextRequest } from "next/server";
import { authenticateFromToken } from "./lib/auth-helper";

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

  // Authenticate and get user-scoped client
  const { userId, supabase } = await authenticateFromToken(token);

  return {
    req: req as any, // NextRequest is compatible with Express Request for tRPC
    res: undefined as any, // Not used in Next.js App Router, but required by Context type
    userId,
    supabase,
    // Helper to check if user is authenticated
    isAuthenticated: () => userId !== null,
  };
}

export type ContextNextJS = inferAsyncReturnType<typeof createContextNextJS>;

