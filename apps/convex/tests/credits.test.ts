import { describe, expect, it } from "vitest";
import {
  AI_LIMITS,
  CREDIT_TRANSACTION_TYPES,
  CREDITS,
} from "../convex/constants";
import {
  CREDIT_COSTS,
  addCreditsToBalance,
  calculateApiUsageStats,
  calculateCreditStats,
  deductCreditsFromBalance,
  getCreditAvailability,
  getDailyUsageBreakdown,
  getSubscriptionLimitSnapshot,
} from "../lib/credits";

const REFERENCE_NOW = new Date("2026-03-23T12:00:00Z").getTime();

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
    const result = getDailyUsageBreakdown([], 7, REFERENCE_NOW);
    expect(result).toHaveLength(7);
  });

  it("should return zero requests/credits for empty entries", () => {
    const result = getDailyUsageBreakdown([], 3, REFERENCE_NOW);
    for (const day of result) {
      expect(day.requests).toBe(0);
      expect(day.credits).toBe(0);
    }
  });

  it("should sort results by date ascending", () => {
    const result = getDailyUsageBreakdown([], 5, REFERENCE_NOW);
    for (let i = 1; i < result.length; i++) {
      expect(result[i].date > result[i - 1].date).toBe(true);
    }
  });

  it("should aggregate entries into the correct day bucket", () => {
    const todayKey = "2026-03-23";
    const entries = [
      { createdAt: new Date("2026-03-23T03:00:00Z").getTime(), creditsUsed: 3 },
      { createdAt: new Date("2026-03-23T20:00:00Z").getTime(), creditsUsed: 2 },
    ];

    const result = getDailyUsageBreakdown(entries, 3, REFERENCE_NOW);
    const todayBucket = result.find((d) => d.date === todayKey);
    expect(todayBucket).toEqual({ date: todayKey, requests: 2, credits: 5 });
  });

  it("should ignore entries outside the date range", () => {
    const oldEntry = {
      createdAt: new Date("2020-01-01").getTime(),
      creditsUsed: 99,
    };
    const result = getDailyUsageBreakdown([oldEntry], 7, REFERENCE_NOW);
    const totalCredits = result.reduce((s, d) => s + d.credits, 0);
    expect(totalCredits).toBe(0);
  });

  it("should handle entries with missing creditsUsed gracefully", () => {
    const entries = [{ createdAt: REFERENCE_NOW }];
    const result = getDailyUsageBreakdown(entries, 3, REFERENCE_NOW);
    const totalCredits = result.reduce((s, d) => s + d.credits, 0);
    expect(totalCredits).toBe(0);
  });
});

describe("getCreditAvailability", () => {
  it("should report when a balance can cover the requested credits", () => {
    expect(getCreditAvailability(12, 5)).toEqual({
      hasCredits: true,
      currentCredits: 12,
      requiredCredits: 5,
      shortfall: 0,
    });
  });

  it("should report the shortfall when credits are insufficient", () => {
    expect(getCreditAvailability(2, 5)).toEqual({
      hasCredits: false,
      currentCredits: 2,
      requiredCredits: 5,
      shortfall: 3,
    });
  });
});

describe("balance helpers", () => {
  it("should add credits to a balance", () => {
    expect(addCreditsToBalance(10, 25)).toEqual({
      previousBalance: 10,
      creditsAdded: 25,
      newBalance: 35,
    });
  });

  it("should deduct credits from a balance", () => {
    expect(deductCreditsFromBalance(10, 4)).toEqual({
      previousBalance: 10,
      creditsDeducted: 4,
      newBalance: 6,
    });
  });
});

describe("calculateCreditStats", () => {
  it("should aggregate lifetime and current-month totals", () => {
    const transactions = [
      {
        type: CREDIT_TRANSACTION_TYPES.EARNED,
        amount: 20,
        createdAt: new Date("2026-03-05T10:00:00Z").getTime(),
      },
      {
        type: CREDIT_TRANSACTION_TYPES.SPENT,
        amount: 6,
        createdAt: new Date("2026-03-10T10:00:00Z").getTime(),
      },
      {
        type: CREDIT_TRANSACTION_TYPES.REFUNDED,
        amount: 2,
        createdAt: new Date("2026-02-28T10:00:00Z").getTime(),
      },
      {
        type: CREDIT_TRANSACTION_TYPES.SPENT,
        amount: 3,
        createdAt: new Date("2026-02-20T10:00:00Z").getTime(),
      },
    ];

    expect(calculateCreditStats(transactions, 13, REFERENCE_NOW)).toEqual({
      currentBalance: 13,
      totalEarned: 20,
      totalSpent: 9,
      totalRefunded: 2,
      thisMonthSpent: 6,
      thisMonthEarned: 20,
      lifetimeNet: 13,
      transactionCount: 4,
    });
  });
});

describe("getSubscriptionLimitSnapshot", () => {
  it("should normalize the plan and total this month usage", () => {
    const snapshot = getSubscriptionLimitSnapshot(
      {
        plan: "enterprise",
        subscriptionStatus: "active",
        credits: 0,
      },
      [
        {
          type: CREDIT_TRANSACTION_TYPES.SPENT,
          amount: 3,
          createdAt: new Date("2026-03-06T10:00:00Z").getTime(),
        },
        {
          type: CREDIT_TRANSACTION_TYPES.SPENT,
          amount: 2,
          createdAt: new Date("2026-02-06T10:00:00Z").getTime(),
        },
      ],
      REFERENCE_NOW
    );

    expect(snapshot).toEqual({
      hasActiveSubscription: true,
      currentPlan: "none",
      planLimit: AI_LIMITS.none,
      currentCredits: 0,
      monthlyCreditsUsed: 3,
      canUseCredits: true,
      subscriptionStatus: "active",
    });
  });

  it("should allow pay-as-you-go usage when credits remain", () => {
    const snapshot = getSubscriptionLimitSnapshot(
      {
        plan: "starter",
        subscriptionStatus: "canceled",
        credits: 4,
      },
      [],
      REFERENCE_NOW
    );

    expect(snapshot.canUseCredits).toBe(true);
    expect(snapshot.hasActiveSubscription).toBe(false);
    expect(snapshot.planLimit).toBe(AI_LIMITS.starter);
  });
});

describe("calculateApiUsageStats", () => {
  it("should aggregate endpoint usage totals and success rate", () => {
    const stats = calculateApiUsageStats(
      [
        {
          endpoint: "/cover-letters",
          success: true,
          creditsUsed: 3,
          createdAt: new Date("2026-03-22T10:00:00Z").getTime(),
        },
        {
          endpoint: "/cover-letters",
          success: false,
          creditsUsed: 0,
          createdAt: new Date("2026-03-22T12:00:00Z").getTime(),
        },
        {
          endpoint: "/jobs/extract",
          success: true,
          creditsUsed: 1,
          createdAt: new Date("2026-03-23T08:00:00Z").getTime(),
        },
      ],
      3,
      REFERENCE_NOW
    );

    expect(stats.totalRequests).toBe(3);
    expect(stats.totalCredits).toBe(4);
    expect(stats.successRate).toBeCloseTo(66.67, 1);
    expect(stats.endpointStats["/cover-letters"]).toEqual({
      totalRequests: 2,
      totalCredits: 3,
      successfulRequests: 1,
      failedRequests: 1,
      averageResponseTime: 0,
    });
    expect(stats.dailyUsage).toHaveLength(3);
    expect(stats.periodDays).toBe(3);
  });
});
