// Simplified auth module - no Replit dependencies
// Auth is disabled by default for standalone operation
import type { Express, RequestHandler } from "express";

// No-op setup function - auth is disabled
export async function setupAuth(app: Express) {
  console.log("ℹ️  Running in standalone mode - authentication disabled");
  // No setup needed - app works without auth
}

// Middleware that always allows requests (no auth required)
export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // Always allow requests - no authentication required
  return next();
};
