/**
 * tRPC Express Handler
 * 
 * Mounts tRPC router at /api/trpc
 */

import type { Express, Request, Response } from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "@12-step-companion/api/routers/_app";
import { createContext } from "@12-step-companion/api/context";

/**
 * Mount tRPC router at /api/trpc
 */
export function mountTRPC(app: Express) {
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext: async ({ req, res }: { req: Request; res: Response }) =>
        createContext({ req, res }),
    })
  );
}

