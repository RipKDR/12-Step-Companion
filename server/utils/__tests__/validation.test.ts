import { describe, it, expect } from "vitest";
import {
  validatePastDate,
  validateArrayLength,
  validateStringLength,
} from "../validation";

describe("Validation Utilities", () => {
  describe("validatePastDate", () => {
    it("should validate past dates", () => {
      const pastDate = new Date();
      pastDate.setFullYear(pastDate.getFullYear() - 1);
      const result = validatePastDate(pastDate.toISOString());

      expect(result.valid).toBe(true);
    });

    it("should reject future dates", () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const result = validatePastDate(futureDate.toISOString());

      expect(result.valid).toBe(false);
      expect(result.error).toContain("future");
    });

    it("should reject invalid date strings", () => {
      const result = validatePastDate("not a date");

      expect(result.valid).toBe(false);
      expect(result.error).toContain("Invalid");
    });
  });

  describe("validateArrayLength", () => {
    it("should validate arrays within max length", () => {
      const result = validateArrayLength([1, 2, 3], 5, "items");

      expect(result.valid).toBe(true);
    });

    it("should reject arrays exceeding max length", () => {
      const result = validateArrayLength([1, 2, 3, 4, 5, 6], 5, "items");

      expect(result.valid).toBe(false);
      expect(result.error).toContain("Maximum");
    });

    it("should reject non-arrays", () => {
      const result = validateArrayLength("not an array" as unknown as [], 5);

      expect(result.valid).toBe(false);
      expect(result.error).toContain("array");
    });
  });

  describe("validateStringLength", () => {
    it("should validate strings within max length", () => {
      const result = validateStringLength("short", 10);

      expect(result.valid).toBe(true);
    });

    it("should reject strings exceeding max length", () => {
      const result = validateStringLength("this is a very long string", 10);

      expect(result.valid).toBe(false);
      expect(result.error).toContain("characters");
    });

    it("should reject non-strings", () => {
      const result = validateStringLength(123 as unknown as string, 10);

      expect(result.valid).toBe(false);
      expect(result.error).toContain("string");
    });
  });
});

