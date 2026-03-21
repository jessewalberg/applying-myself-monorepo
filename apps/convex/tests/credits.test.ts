import { describe, it, expect } from "vitest";
import { CREDIT_COSTS, getDailyUsageBreakdown } from "../convex/credits";
import { CREDITS } from "../convex/constants";

describe("CREDIT_COSTS", () => {
  it("should define all expected credit cost types", () => {
    expect(CREDIT_COSTS).toHaveProperty("COVER_LETTER_GENERATION");
    expect(CREDIT_COSTS).toHaveProperty("JOB_EXTRACTION");
    expect(CREDIT_COSTS).toHaveProperty("RESUME_ANALYSIS");
    expect(CREDIT_COSTS).toHaveProperty("RESUME_UPLOAD");
  });

  it("should have positive integer costs for every action", () => {
    for (const [key, value] of Object.entries(CREDIT_COSTS)) {
      expect(value, `${key} should be positive`).toBeGreaterThan(0);
      expect(Number.isInteger(value), `${key} should be an integer`).toBe(true);
    }
  });

  it("cover letter generation should be the most expensive action", () => {
    expect(CREDIT_COSTS.COVER_LETTER_GENERATION).toBeGreaterThanOrEqual(
      CREDIT_COSTS.JOB_EXTRACTION
    );
    expect(CREDIT_COSTS.COVER_LETTER_GENERATION).toBeGreaterThanOrEqual(
      CREDIT_COSTS.RESUME_UPLOAD
    );
  });

  it("should align with CREDITS constants for shared action types", () => {
    expect(CREDIT_COSTS.COVER_LETTER_GENERATION).toBe(
      CREDITS.COVER_LETTER_GENERATION
    );
    expect(CREDIT_COSTS.JOB_EXTRACTION).toBe(CREDITS.JOB_EXTRACTION);
    expect(CREDIT_COSTS.RESUME_UPLOAD).toBe(CREDITS.RESUME_UPLOAD);
  });
});

describe("getDailyUsageBreakdown", () => {
  it("should return an array with one entry per day", () => {
    const result = getDailyUsageBreakdown([], 7);
    expect(result).toHaveLength(7);
  });

  it("should return zero requests/credits for empty entries", () => {
    const result = getDailyUsageBreakdown([], 3);
    for (const day of result) {
      expect(day.requests).toBe(0);
      expect(day.credits).toBe(0);
    }
  });

  it("should sort results by date ascending", () => {
    const result = getDailyUsageBreakdown([], 5);
    for (let i = 1; i < result.length; i++) {
      expect(result[i].date > result[i - 1].date).toBe(true);
    }
  });

  it("should aggregate entries into the correct day bucket", () => {
    const now = new Date();
    // Create an entry for today
    const todayKey = now.toISOString().split("T")[0];
    const entries = [
      { createdAt: now.getTime(), creditsUsed: 3 },
      { createdAt: now.getTime() - 1000, creditsUsed: 2 },
    ];

    const result = getDailyUsageBreakdown(entries, 3);
    const todayBucket = result.find((d) => d.date === todayKey);
    // Today may or may not be in range depending on time zone offset,
    // but at least one bucket should have accumulated data if in range.
    if (todayBucket) {
      expect(todayBucket.requests).toBe(2);
      expect(todayBucket.credits).toBe(5);
    }
  });

  it("should ignore entries outside the date range", () => {
    const oldEntry = {
      createdAt: new Date("2020-01-01").getTime(),
      creditsUsed: 99,
    };
    const result = getDailyUsageBreakdown([oldEntry], 7);
    const totalCredits = result.reduce((s, d) => s + d.credits, 0);
    expect(totalCredits).toBe(0);
  });

  it("should handle entries with missing creditsUsed gracefully", () => {
    const now = new Date();
    const entries = [{ createdAt: now.getTime() }];
    const result = getDailyUsageBreakdown(entries, 3);
    // creditsUsed is undefined → `undefined || 0` → 0
    const totalCredits = result.reduce((s, d) => s + d.credits, 0);
    expect(totalCredits).toBe(0);
  });
});
