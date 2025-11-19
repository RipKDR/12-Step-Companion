/**
 * tRPC Client Setup
 * 
 * Creates tRPC client for React app with React Query integration
 */

import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../../packages/api/src/routers/_app";
import { httpBatchLink } from "@trpc/client";

// Dynamically import supabase to avoid server-side import issues
async function getAuthToken(): Promise<string | undefined> {
  try {
    // Use dynamic import to avoid bundling server code in client
    const { supabase } = await import("../../packages/api/src/lib/supabase");
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  } catch (error) {
    // Supabase not configured or not available
    return undefined;
  }
}

/**
 * Create tRPC React client
 */
export const trpc = createTRPCReact<AppRouter>();

/**
 * Get tRPC client configuration
 */
export function getTRPCClient() {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: "/api/trpc",
        async headers() {
          // Get auth token from Supabase session
          const token = await getAuthToken();

          return {
            ...(token && { authorization: `Bearer ${token}` }),
          };
        },
      }),
    ],
  });
}

