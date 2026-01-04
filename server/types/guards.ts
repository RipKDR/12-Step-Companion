/**
 * Type guard to check if value is a string array
 */
export function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

/**
 * Type guard to check if value is a number array
 */
export function isNumberArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((item) => typeof item === "number");
}

/**
 * Type guard to check if value is a valid ContextWindow object
 */
export function isValidContextWindow(value: unknown): value is {
  recentStepWork?: string[];
  recentJournals?: string[];
  activeScenes?: string[];
  currentStreaks?: Record<string, number>;
  recentMoodTrend?: number[];
  recentCravingsTrend?: number[];
} {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const ctx = value as Record<string, unknown>;

  // Check optional arrays
  if (ctx.recentStepWork !== undefined && !isStringArray(ctx.recentStepWork)) {
    return false;
  }
  if (ctx.recentJournals !== undefined && !isStringArray(ctx.recentJournals)) {
    return false;
  }
  if (ctx.activeScenes !== undefined && !isStringArray(ctx.activeScenes)) {
    return false;
  }
  if (ctx.recentMoodTrend !== undefined && !isNumberArray(ctx.recentMoodTrend)) {
    return false;
  }
  if (ctx.recentCravingsTrend !== undefined && !isNumberArray(ctx.recentCravingsTrend)) {
    return false;
  }

  // Check currentStreaks if present
  if (
    ctx.currentStreaks !== undefined &&
    (typeof ctx.currentStreaks !== "object" ||
      ctx.currentStreaks === null ||
      !Object.values(ctx.currentStreaks).every((v) => typeof v === "number"))
  ) {
    return false;
  }

  return true;
}

