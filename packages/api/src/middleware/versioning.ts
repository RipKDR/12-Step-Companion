/**
 * API Versioning Middleware for tRPC
 *
 * Adds API version headers to responses
 */

import type { Context } from "../context";
import { readFileSync } from "fs";
import { join } from "path";

// Get version from package.json
let apiVersion = "1.0.0";
try {
  const packageJsonPath = join(process.cwd(), "package.json");
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
  apiVersion = packageJson.version || "1.0.0";
} catch {
  // Fallback if package.json not found
  apiVersion = "1.0.0";
}

/**
 * API versioning middleware for tRPC procedures
 */
export function versioningMiddleware() {
  return async ({ ctx, next }: { ctx: Context; next: () => Promise<any> }) => {
    // Add version headers to response
    if (ctx.res) {
      ctx.res.setHeader("X-API-Version", apiVersion);
      ctx.res.setHeader("X-API-Deprecated", "false"); // Set to true when deprecating
    }

    return next();
  };
}

