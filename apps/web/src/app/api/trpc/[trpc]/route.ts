/**
 * tRPC API Route Handler for Next.js App Router
 * 
 * Handles all tRPC requests from the Next.js web app
 */

import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@12-step-companion/api/routers/_app";
import { createContextNextJS } from "@12-step-companion/api/context-nextjs";
import type { NextRequest } from "next/server";

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req: req as any, // Type assertion to handle monorepo Next.js type version mismatch
    router: appRouter,
    createContext: async () => await createContextNextJS({ req: req as any }), // Type assertion for monorepo compatibility
    onError:
      process.env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`
            );
          }
        : undefined,
  });

export { handler as GET, handler as POST };

