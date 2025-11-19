/**
 * tRPC API Route Handler for Next.js App Router
 * 
 * Handles all tRPC requests from the Next.js web app
 */

import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "../../../../../../packages/api/src/routers/_app";
import { createContextNextJS } from "../../../../../../packages/api/src/context-nextjs";
import type { NextRequest } from "next/server";

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createContextNextJS({ req }),
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

