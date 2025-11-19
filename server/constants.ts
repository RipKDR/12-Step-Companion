/**
 * Server-side constants
 * Centralized configuration values for maintainability
 */

// AI Configuration
export const MAX_CONTEXT_LENGTH = 500;
export const MAX_TRIGGERS = 50;
export const MAX_JOURNALS = 3;
export const MAX_OUTPUT_TOKENS = 2048;
export const AI_TEMPERATURE = 0.8;
export const MAX_MESSAGE_LENGTH = 5000;

// Cache Configuration
export const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// Rate Limiting Configuration
export const RATE_LIMIT_UNAUTHENTICATED = 10; // requests per minute
export const RATE_LIMIT_AUTHENTICATED = 30; // requests per minute
export const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

// Request Timeout Configuration
export const REQUEST_TIMEOUT_MS = 30000; // 30 seconds

