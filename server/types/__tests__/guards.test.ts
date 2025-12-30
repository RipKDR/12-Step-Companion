import { describe, it, expect } from "vitest";
import { isStringArray, isNumberArray, isValidContextWindow } from "../guards";

describe("Type Guards", () => {
  describe("isStringArray", () => {
    it("should return true for string arrays", () => {
      expect(isStringArray(["a", "b", "c"])).toBe(true);
    });

    it("should return false for non-string arrays", () => {
      expect(isStringArray([1, 2, 3])).toBe(false);
      expect(isStringArray(["a", 1, "b"])).toBe(false);
    });

    it("should return false for non-arrays", () => {
      expect(isStringArray("not an array")).toBe(false);
      expect(isStringArray(null)).toBe(false);
      expect(isStringArray(undefined)).toBe(false);
    });
  });

  describe("isNumberArray", () => {
    it("should return true for number arrays", () => {
      expect(isNumberArray([1, 2, 3])).toBe(true);
    });

    it("should return false for non-number arrays", () => {
      expect(isNumberArray(["a", "b"])).toBe(false);
      expect(isNumberArray([1, "a", 2])).toBe(false);
    });
  });

  describe("isValidContextWindow", () => {
    it("should return true for valid context window", () => {
      const valid = {
        recentStepWork: ["step1", "step2"],
        recentJournals: ["journal1"],
        currentStreaks: { daily: 5 },
      };
      expect(isValidContextWindow(valid)).toBe(true);
    });

    it("should return false for invalid context window", () => {
      expect(isValidContextWindow(null)).toBe(false);
      expect(isValidContextWindow("not an object")).toBe(false);
      expect(isValidContextWindow({ recentStepWork: [1, 2] })).toBe(false); // numbers instead of strings
    });
  });
});

