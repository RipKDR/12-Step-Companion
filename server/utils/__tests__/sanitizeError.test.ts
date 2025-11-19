import { describe, it, expect } from "vitest";
import { sanitizeError } from "../sanitizeError";

describe("sanitizeError", () => {
  it("should sanitize error messages with sensitive information", () => {
    const error = new Error("API key abc123 is invalid");
    const result = sanitizeError(error);

    expect(result.message).not.toContain("abc123");
    expect(result.message).toContain("[REDACTED]");
  });

  it("should remove stack traces", () => {
    const error = new Error("Test error");
    error.stack = "Error: Test error\n    at file.ts:10:5";
    const result = sanitizeError(error);

    expect(result.message).not.toContain("at file.ts");
  });

  it("should map error types to user-friendly messages", () => {
    const error = { message: "timeout", status: 504 };
    const result = sanitizeError(error, 504);

    expect(result.message).toContain("timeout");
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

