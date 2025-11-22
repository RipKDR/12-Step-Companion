/**
 * Request Logging Middleware for tRPC
 *
 * Logs API requests for monitoring and debugging
 */

import type { Context } from "../context";

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
 * Simple logger (can be replaced with proper logging service)
 */
function logRequest(entry: LogEntry) {
  const logLevel = entry.error ? "error" : "info";
  const message = `[${entry.timestamp}] ${entry.method} ${entry.path} - User: ${entry.userId || "anonymous"} - IP: ${entry.ip}${entry.duration ? ` - Duration: ${entry.duration}ms` : ""}${entry.error ? ` - Error: ${entry.error}` : ""}`;

  if (logLevel === "error") {
    console.error(message);
  } else if (process.env.NODE_ENV === "development") {
    console.log(message);
  }
  // In production, send to logging service (Sentry, DataDog, etc.)
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

