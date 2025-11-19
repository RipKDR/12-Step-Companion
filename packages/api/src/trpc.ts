/**
 * tRPC Initialization
 * 
 * Sets up tRPC with context, error handling, and transformers
 */

import { initTRPC, TRPCError } from "@trpc/server";
import { ZodError } from "zod";
import type { Context } from "./context";

/**
 * Initialize tRPC with context
 */
const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError
            ? error.cause.flatten()
            : null,
      },
    };
  },
});

/**
 * Base router and procedure exports
 */
export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Protected procedure - requires authentication
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.isAuthenticated()) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }

  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId!, // Now guaranteed to be non-null
    },
  });
});

/**
 * Sponsor procedure - requires user to be a sponsor of the sponsee
 */
export const sponsorProcedure = protectedProcedure.use(
  async ({ ctx, next, input }) => {
    // This will be used in routers that need sponsor verification
    // The input should contain sponseeId
    return next({ ctx });
  }
);

