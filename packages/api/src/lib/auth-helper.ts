/**
 * Shared authentication helper for tRPC context
 *
 * Extracts common auth logic used across different tRPC context implementations
 */

import { supabaseServer, createUserClient } from "./supabase-server";

export interface AuthResult {
  userId: string | null;
  supabase: ReturnType<typeof createUserClient> | null;
}

/**
 * Authenticate user from bearer token and return user-scoped Supabase client
 *
 * @param token - Bearer token from Authorization header
 * @returns Object with userId and user-scoped Supabase client (null if not authenticated)
 */
export async function authenticateFromToken(
  token: string | null | undefined
): Promise<AuthResult> {
  let userId: string | null = null;
  let supabase: ReturnType<typeof createUserClient> | null = null;

  // If no token provided, return null - force authentication
  if (!token) {
    return { userId: null, supabase: null };
  }

  // If token provided, create user-scoped client (respects RLS)
  try {
    const userClient = createUserClient(token);
    const {
      data: { user },
      error,
    } = await userClient.auth.getUser();

    if (!error && user) {
      userId = user.id;
      supabase = userClient;
    }
  } catch (error) {
    // Log but don't expose details
    if (process.env.NODE_ENV === "development") {
      console.warn("Failed to authenticate token:", error instanceof Error ? error.message : String(error));
    }
  }

  return { userId, supabase };
}
