/**
 * tRPC Client Setup for React Native
 */

import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@12-step-companion/api/routers/_app";
import { getAccessToken } from "./secure-store";

export const trpc = createTRPCReact<AppRouter>();

/**
 * Get tRPC client configuration
 */
export function getTRPCClient() {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

  return trpc.createClient({
    links: [
      httpBatchLink({
        url: `${apiUrl}/api/trpc`,
        async headers() {
          // Get auth token from secure storage
          const token = await getAccessToken();

          return {
            ...(token && { authorization: `Bearer ${token}` }),
          };
        },
      }),
    ],
  });
}

