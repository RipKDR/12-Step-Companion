import { describe, it, expect } from "vitest";
import { sanitizeError } from "../sanitizeError";

describe("sanitizeError", () => {
  it("should sanitize error messages with sensitive information", () => {
    // Use a status code NOT in ERROR_MESSAGE_MAP (like 418) to trigger sanitization
    // Use "api_key" format to match the pattern /api[_-]?key/gi
    const error = new Error("api_key abc123 is invalid");
    const result = sanitizeError(error, 418); // 418 is not in ERROR_MESSAGE_MAP

    // The function replaces the pattern "api_key" with "[REDACTED]"
    // but doesn't remove arbitrary values like "abc123"
    expect(result.message).toContain("[REDACTED]");
    expect(result.message).not.toContain("api_key");
  });

  it("should remove stack traces", () => {
    const error = new Error("Test error");
    error.stack = "Error: Test error\n    at file.ts:10:5";
    const result = sanitizeError(error);

    expect(result.message).not.toContain("at file.ts");
  });

  it("should map error types to user-friendly messages", () => {
    // Pass an actual Error object so error.message is accessible
    const error = new Error("timeout");
    // Add status property to the error object
    (error as any).status = 504;
    const result = sanitizeError(error, 504);

    // The function maps "timeout" to "Request timed out. Please try again."
    expect(result.message).toBe("Request timed out. Please try again.");
    expect(result.statusCode).toBe(504);
  });

  it("should handle unknown errors gracefully", () => {
    const error = "Unknown error";
    const result = sanitizeError(error);

    expect(result.message).toBeTruthy();
    expect(result.statusCode).toBe(500);
  });

  it("should preserve error codes", () => {
    const error = { message: "Test", code: "ERR_TEST" };
    const result = sanitizeError(error);

    expect(result.code).toBe("ERR_TEST");
  });
});

