/**
 * Example Test Suite
 *
 * Tests for streak calculation logic
 */

import { describe, it, expect } from "vitest";

describe("Streak Calculations", () => {
  it("should calculate current streak correctly", () => {
    // Example: Calculate streak from consecutive dates
    const dates = [
      new Date("2024-01-05"),
      new Date("2024-01-04"),
      new Date("2024-01-03"),
      new Date("2024-01-02"),
    ];

    // Simple streak calculation
    let streak = 0;
    let expectedDate = new Date();
    expectedDate.setHours(0, 0, 0, 0);

    for (const date of dates.sort((a, b) => b.getTime() - a.getTime())) {
      const dateOnly = new Date(date);
      dateOnly.setHours(0, 0, 0, 0);

      if (dateOnly.getTime() === expectedDate.getTime()) {
        streak++;
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else {
        break;
      }
    }

    expect(streak).toBeGreaterThan(0);
  });

  it("should handle missing dates in streak", () => {
    const dates = [
      new Date("2024-01-05"),
      new Date("2024-01-03"), // Missing 2024-01-04
      new Date("2024-01-02"),
    ];

    let streak = 0;
    let expectedDate = new Date();
    expectedDate.setHours(0, 0, 0, 0);

    for (const date of dates.sort((a, b) => b.getTime() - a.getTime())) {
      const dateOnly = new Date(date);
      dateOnly.setHours(0, 0, 0, 0);

      if (dateOnly.getTime() === expectedDate.getTime()) {
        streak++;
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else {
        break; // Streak broken
      }
    }

    // Streak should be 1 (only today)
    expect(streak).toBe(1);
  });
});

