/**
 * Request Logging Middleware for tRPC
 *
 * Logs API requests for monitoring and debugging
 */

import type { Context } from "../context";

// Optional Sentry import - only used if SENTRY_DSN is set
let Sentry: typeof import("@sentry/node") | null = null;

// Initialize Sentry if available
if (process.env.SENTRY_DSN) {
  try {
    import("@sentry/node").then((module) => {
      Sentry = module;
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV || "development",
        tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
      });
    }).catch(() => {
      // Sentry not available, will use console logging
    });
  } catch {
    // Sentry not available, will use console logging
  }
}

interface LogEntry {
  timestamp: string;
  userId: string | null;
  ip: string;
  path: string;
  method: string;
  duration?: number;
  error?: string;
}

/**
 * Simple logger with Sentry integration
 */
function logRequest(entry: LogEntry) {
  const logLevel = entry.error ? "error" : "info";
  const message = `[${entry.timestamp}] ${entry.method} ${entry.path} - User: ${entry.userId || "anonymous"} - IP: ${entry.ip}${entry.duration ? ` - Duration: ${entry.duration}ms` : ""}${entry.error ? ` - Error: ${entry.error}` : ""}`;

  if (logLevel === "error") {
    console.error(message);

    // Send to Sentry if available
    if (Sentry && entry.error) {
      Sentry.captureException(new Error(entry.error), {
        tags: {
          userId: entry.userId || "anonymous",
          path: entry.path,
          method: entry.method,
        },
        extra: {
          ip: entry.ip,
          duration: entry.duration,
        },
      });
    }
  } else if (process.env.NODE_ENV === "development") {
    console.log(message);
  } else if (process.env.NODE_ENV === "production") {
    // In production, log structured JSON for log aggregation services
    console.log(JSON.stringify({
      timestamp: entry.timestamp,
      level: logLevel,
      method: entry.method,
      path: entry.path,
      userId: entry.userId,
      ip: entry.ip,
      duration: entry.duration,
    }));
  }
}

/**
 * Request logging middleware for tRPC procedures
 */
export function loggerMiddleware() {
  return async ({ ctx, path, type, next }: { ctx: Context; path: string; type: string; next: () => Promise<any> }) => {
    const startTime = Date.now();
    const userId = ctx.userId || null;
    // Get IP from request, handling various Express configurations
    const ip = ctx.req?.ip ||
               ctx.req?.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() ||
               ctx.req?.socket.remoteAddress ||
               "unknown";
    const method = ctx.req?.method || "TRPC";
    const fullPath = `/api/trpc/${path}`;

    try {
      const result = await next();
      const duration = Date.now() - startTime;

      logRequest({
        timestamp: new Date().toISOString(),
        userId,
        ip: String(ip),
        path: fullPath,
        method,
        duration,
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      logRequest({
        timestamp: new Date().toISOString(),
        userId,
        ip: String(ip),
        path: fullPath,
        method,
        duration,
        error: errorMessage,
      });

      throw error;
    }
  };
}

