/**
 * Client-side logging utility
 * Provides structured logging with appropriate log levels
 * Info logs are disabled in production to reduce noise
 */

const isDevelopment = import.meta.env.DEV;

export const logger = {
  /**
   * Log informational messages (development only)
   * @param message - Message to log
   */
  info: (message: string): void => {
    if (isDevelopment) {
      console.log(`[INFO] ${message}`);
    }
  },

  /**
   * Log warning messages
   * @param message - Warning message to log
   */
  warn: (message: string): void => {
    console.warn(`[WARN] ${message}`);
  },

  /**
   * Log error messages
   * @param message - Error message to log
   * @param error - Optional error object to log
   */
  error: (message: string, error?: unknown): void => {
    if (error) {
      console.error(`[ERROR] ${message}`, error);
    } else {
      console.error(`[ERROR] ${message}`);
    }
  },
};

