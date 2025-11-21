/**
 * Shared authentication helper for tRPC context
 *
 * Extracts common auth logic used across different tRPC context implementations
 */

import { supabaseServer, createUserClient } from "./supabase-server";

export interface AuthResult {
  userId: string | null;
  supabase: ReturnType<typeof createUserClient> | typeof supabaseServer;
}

/**
 * Authenticate user from bearer token and return user-scoped Supabase client
 *
 * @param token - Bearer token from Authorization header
 * @returns Object with userId and appropriate Supabase client (user-scoped or server)
 */
export async function authenticateFromToken(
  token: string | null | undefined
): Promise<AuthResult> {
  let userId: string | null = null;
  let supabase = supabaseServer; // Default to server client (bypasses RLS)

  // If token provided, create user-scoped client (respects RLS)
  if (token) {
    try {
      const userClient = createUserClient(token);
      const {
        data: { user },
        error,
      } = await userClient.auth.getUser();

      if (!error && user) {
        userId = user.id;
        supabase = userClient as any; // Use user-scoped client for RLS (type assertion for compatibility)
      }
    } catch (error) {
      // Invalid token - continue with server client
      // Only log in development to avoid exposing PII
      if (process.env.NODE_ENV === "development") {
        console.warn("Failed to get user from token");
      }
    }
  }

  return { userId, supabase };
}
