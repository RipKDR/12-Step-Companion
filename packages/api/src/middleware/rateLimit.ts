/**
 * Rate Limiting Middleware for tRPC
 *
 * Implements rate limiting using in-memory store (for single-instance deployments)
 * For multi-instance deployments, use Redis by setting REDIS_URL environment variable
 */

import { TRPCError } from "@trpc/server";
import type { Context } from "../context";

// Optional Redis import - only used if REDIS_URL is set
let Redis: typeof import("ioredis").default | null = null;
let redisClient: import("ioredis").Redis | null = null;

// Initialize Redis if REDIS_URL is available
if (process.env.REDIS_URL) {
  try {
    // Dynamic import to avoid requiring ioredis if not using Redis
    import("ioredis").then((module) => {
      Redis = module.default;
      redisClient = new Redis(process.env.REDIS_URL!);
      redisClient.on("error", (err) => {
        console.error("Redis connection error:", err);
        redisClient = null; // Fall back to in-memory
      });
    }).catch(() => {
      console.warn("Redis not available, falling back to in-memory rate limiting");
    });
  } catch {
    // Redis not available, will use in-memory fallback
  }
}

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
 * Check rate limit using Redis (if available)
 */
async function checkRateLimitRedis(
  key: string,
  isAuthenticated: boolean
): Promise<{
  allowed: boolean;
  remaining: number;
  resetAt: number;
}> {
  if (!redisClient) {
    // Fall back to in-memory
    return checkRateLimitMemory(key, isAuthenticated);
  }

  const limits = isAuthenticated
    ? RATE_LIMITS.authenticated
    : RATE_LIMITS.unauthenticated;

  try {
    const windowSeconds = Math.floor(limits.windowMs / 1000);
    const count = await redisClient.incr(key);

    if (count === 1) {
      // First request in window, set expiration
      await redisClient.expire(key, windowSeconds);
    }

    const ttl = await redisClient.ttl(key);
    const resetAt = Date.now() + (ttl * 1000);

    return {
      allowed: count <= limits.max,
      remaining: Math.max(0, limits.max - count),
      resetAt,
    };
  } catch (error) {
    // Redis error, fall back to in-memory
    console.warn("Redis rate limit error, falling back to in-memory:", error);
    return checkRateLimitMemory(key, isAuthenticated);
  }
}

/**
 * Check rate limit using in-memory store
 */
function checkRateLimitMemory(key: string, isAuthenticated: boolean): {
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

    // Use Redis if available, otherwise fall back to in-memory
    const result = redisClient
      ? await checkRateLimitRedis(key, isAuthenticated)
      : checkRateLimitMemory(key, isAuthenticated);

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

