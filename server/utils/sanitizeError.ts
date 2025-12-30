/**
 * Error sanitization utility
 * Strips sensitive information from error messages before sending to client
 */

interface SanitizedError {
  message: string;
  code?: string;
  statusCode: number;
}

/**
 * Patterns that indicate sensitive information
 */
const SENSITIVE_PATTERNS = [
  /api[_-]?key/gi,
  /secret/gi,
  /password/gi,
  /token/gi,
  /credential/gi,
  /\.env/gi,
  /\/[a-z0-9/\\-]+\.(ts|js|tsx|jsx)/gi, // File paths
  /at\s+[^\s]+\s+\([^)]+\)/g, // Stack trace lines
  /Error:\s*/gi,
];

/**
 * Sanitize error message by removing sensitive information
 * @param errorMessage - Raw error message
 * @returns Sanitized error message
 */
function sanitizeErrorMessage(errorMessage: string): string {
  let sanitized = errorMessage;

  // Remove sensitive patterns
  for (const pattern of SENSITIVE_PATTERNS) {
    sanitized = sanitized.replace(pattern, "[REDACTED]");
  }

  // Remove stack traces (lines starting with "at" or containing file paths)
  sanitized = sanitized
    .split("\n")
    .filter((line) => {
      const trimmed = line.trim();
      return (
        !trimmed.startsWith("at ") &&
        !trimmed.match(/^\w+:\/\//) && // URLs
        !trimmed.match(/\/[a-z0-9/\\-]+\.(ts|js|tsx|jsx)/i) // File paths
      );
    })
    .join("\n");

  return sanitized.trim() || "An error occurred";
}

/**
 * Map error types to user-friendly messages
 */
const ERROR_MESSAGE_MAP: Record<string, string> = {
  "429": "Too many requests. Please wait a moment and try again.",
  "503": "Service temporarily unavailable. Please try again later.",
  "500": "Something went wrong. Please try again or contact support if the problem persists.",
  "400": "Invalid request. Please check your input and try again.",
  "401": "Authentication required. Please sign in and try again.",
  "403": "Access denied. You don't have permission to perform this action.",
  "404": "Resource not found.",
  timeout: "Request timed out. Please try again.",
  network: "Network error. Please check your connection and try again.",
  quota: "Rate limit exceeded. Please wait a moment and try again.",
};

/**
 * Sanitize error for client response
 * @param error - Error object or unknown
 * @param defaultStatusCode - Default status code if not found in error
 * @returns Sanitized error object safe to send to client
 */
export function sanitizeError(
  error: unknown,
  defaultStatusCode: number = 500
): SanitizedError {
  const errorMessage =
    error instanceof Error ? error.message : String(error);

  // Extract status code if available
  let statusCode = defaultStatusCode;
  if (
    error &&
    typeof error === "object" &&
    ("status" in error || "statusCode" in error)
  ) {
    const status =
      ("status" in error ? error.status : error.statusCode) as number;
    if (typeof status === "number" && status >= 100 && status < 600) {
      statusCode = status;
    }
  }

  // Check for specific error types
  const lowerMessage = errorMessage.toLowerCase();
  let userMessage: string;

  if (lowerMessage.includes("timeout")) {
    userMessage = ERROR_MESSAGE_MAP.timeout;
  } else if (lowerMessage.includes("network") || lowerMessage.includes("fetch")) {
    userMessage = ERROR_MESSAGE_MAP.network;
  } else if (lowerMessage.includes("quota") || statusCode === 429) {
    userMessage = ERROR_MESSAGE_MAP.quota;
  } else if (ERROR_MESSAGE_MAP[String(statusCode)]) {
    userMessage = ERROR_MESSAGE_MAP[String(statusCode)];
  } else {
    // Sanitize generic error message
    userMessage = sanitizeErrorMessage(errorMessage);
  }

  // Extract error code if available (for debugging)
  let errorCode: string | undefined;
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    errorCode = error.code;
  }

  return {
    message: userMessage,
    code: errorCode,
    statusCode,
  };
}

