import rateLimit from "express-rate-limit";
import type { Request, Response } from "express";
import { log } from "../lib/logger";

/**
 * Rate limiting middleware for API endpoints
 * Different limits for authenticated vs unauthenticated users
 */

/**
 * Rate limiter for unauthenticated users
 * 10 requests per minute
 */
export const unauthenticatedRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: {
    message: "Too many requests",
    response: "Please slow down. You're making requests too quickly. Wait a moment and try again.",
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  handler: (req: Request, res: Response) => {
    log(`Rate limit exceeded for ${req.ip}`, "rateLimit");
    res.status(429).json({
      message: "Too many requests",
      response: "Please slow down. You're making requests too quickly. Wait a moment and try again.",
    });
  },
});

/**
 * Rate limiter for authenticated users
 * 30 requests per minute
 */
export const authenticatedRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: {
    message: "Too many requests",
    response: "Please slow down. You're making requests too quickly. Wait a moment and try again.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    log(`Rate limit exceeded for authenticated user ${req.ip}`, "rateLimit");
    res.status(429).json({
      message: "Too many requests",
      response: "Please slow down. You're making requests too quickly. Wait a moment and try again.",
    });
  },
});
