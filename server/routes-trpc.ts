/**
 * tRPC Express Handler
 * 
 * Mounts tRPC router at /api/trpc
 */

import type { Express } from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../packages/api/src/routers/_app";
import { createContext } from "../packages/api/src/context";

/**
 * Mount tRPC router at /api/trpc
 */
export function mountTRPC(app: Express) {
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext: async ({ req, res }) => {
        return createContext({ req, res });
      },
    })
  );
}

