/**
 * Rate Limiting Middleware for tRPC
 *
 * Implements rate limiting using in-memory store (for single-instance deployments)
 * For multi-instance, consider Redis-based rate limiting
 */

import { TRPCError } from "@trpc/server";
import type { Context } from "../context";

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetAt: number;
  };
}

// In-memory store (clears on server restart)
// For production multi-instance, use Redis or similar
const rateLimitStore: RateLimitStore = {};

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const key in rateLimitStore) {
    if (rateLimitStore[key].resetAt < now) {
      delete rateLimitStore[key];
    }
  }
}, 5 * 60 * 1000);

/**
 * Rate limit configuration
 */
const RATE_LIMITS = {
  authenticated: {
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
  },
  unauthenticated: {
    windowMs: 60 * 1000, // 1 minute
    max: 20, // 20 requests per minute
  },
} as const;

/**
 * Get rate limit key from context
 */
function getRateLimitKey(ctx: Context): string {
  if (ctx.userId) {
    return `user:${ctx.userId}`;
  }
  // Use IP address for unauthenticated users
  const ip = ctx.req?.ip || ctx.req?.socket.remoteAddress || "unknown";
  return `ip:${ip}`;
}

/**
 * Check if request should be rate limited
 */
function checkRateLimit(key: string, isAuthenticated: boolean): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
} {
  const limits = isAuthenticated
    ? RATE_LIMITS.authenticated
    : RATE_LIMITS.unauthenticated;

  const now = Date.now();
  const entry = rateLimitStore[key];

  if (!entry || entry.resetAt < now) {
    // New window or expired entry
    rateLimitStore[key] = {
      count: 1,
      resetAt: now + limits.windowMs,
    };
    return {
      allowed: true,
      remaining: limits.max - 1,
      resetAt: now + limits.windowMs,
    };
  }

  if (entry.count >= limits.max) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: limits.max - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Rate limiting middleware for tRPC procedures
 */
export function rateLimitMiddleware() {
  return async ({ ctx, next }: { ctx: Context; next: () => Promise<any> }) => {
    const isAuthenticated = ctx.isAuthenticated();
    const key = getRateLimitKey(ctx);
    const result = checkRateLimit(key, isAuthenticated);

    if (!result.allowed) {
      const resetSeconds = Math.ceil((result.resetAt - Date.now()) / 1000);
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: `Rate limit exceeded. Please try again in ${resetSeconds} seconds.`,
      });
    }

    // Add rate limit headers to response
    if (ctx.res) {
      ctx.res.setHeader("X-RateLimit-Limit", isAuthenticated ? RATE_LIMITS.authenticated.max : RATE_LIMITS.unauthenticated.max);
      ctx.res.setHeader("X-RateLimit-Remaining", result.remaining.toString());
      ctx.res.setHeader("X-RateLimit-Reset", new Date(result.resetAt).toISOString());
    }

    return next();
  };
}

