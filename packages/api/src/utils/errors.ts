/**
 * Standardized Error Handling
 *
 * Provides AppError class for consistent error handling across the API
 */

import { TRPCError } from "@trpc/server";

/**
 * Application Error Class
 *
 * Extends Error with additional metadata for better error handling
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public userMessage?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

/**
 * Convert AppError to TRPCError
 */
export function toTRPCError(error: unknown): TRPCError {
  if (error instanceof AppError) {
    return new TRPCError({
      code: error.code as any,
      message: error.userMessage || error.message,
    });
  }

  if (error instanceof TRPCError) {
    return error;
  }

  // Log unexpected errors
  console.error("Unexpected error:", error);

  return new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "An unexpected error occurred",
  });
}

/**
 * Handle error and return user-friendly message
 */
export function handleError(error: unknown): {
  message: string;
  code: string;
  statusCode: number;
} {
  if (error instanceof AppError) {
    return {
      message: error.userMessage || error.message,
      code: error.code,
      statusCode: error.statusCode,
    };
  }

  if (error instanceof TRPCError) {
    return {
      message: error.message,
      code: error.code,
      statusCode: error.code === "UNAUTHORIZED" ? 401 :
                  error.code === "FORBIDDEN" ? 403 :
                  error.code === "NOT_FOUND" ? 404 :
                  error.code === "TOO_MANY_REQUESTS" ? 429 :
                  500,
    };
  }

  // Log unexpected errors
  console.error("Unexpected error:", error);

  return {
    message: "An unexpected error occurred",
    code: "INTERNAL_SERVER_ERROR",
    statusCode: 500,
  };
}

