/**
 * tRPC Client for Next.js
 */

"use client";

import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@12-step-companion/api/routers/_app";
import { getSession } from "next-auth/react";

export const trpc = createTRPCReact<AppRouter>();

export function getTRPCClient() {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/trpc`,
        async headers() {
          const session = await getSession();
          const accessToken = (session as any)?.accessToken;
          return {
            ...(accessToken && { authorization: `Bearer ${accessToken}` }),
          };
        },
      }),
    ],
  });
}

