import { describe, it, expect } from "vitest";
import {
  AI_LIMITS,
  CREDITS,
  PLANS,
  CREDIT_TRANSACTION_TYPES,
  PAGINATION,
  SUBSCRIPTION_STATUS,
  COVER_LETTER_PREFERENCES,
} from "../convex/constants";

describe("AI_LIMITS plan tiers", () => {
  const planKeys: Array<keyof typeof PLANS> = ["NONE", "STARTER", "PRO", "HIRED"];

  it("should have a tier object for every plan in PLANS", () => {
    for (const key of planKeys) {
      const planId = PLANS[key];
      expect(AI_LIMITS).toHaveProperty(planId);
    }
  });

  it("credits and monthlyCredits should match within each tier", () => {
    for (const key of planKeys) {
      const planId = PLANS[key] as keyof typeof AI_LIMITS;
      const tier = AI_LIMITS[planId];
      if (
        typeof tier === "object" &&
        tier !== null &&
        "credits" in tier &&
        "monthlyCredits" in tier
      ) {
        expect(tier.credits, `${planId} credits ≠ monthlyCredits`).toBe(
          tier.monthlyCredits
        );
      }
    }
  });

  it("higher plans should have equal or more monthly credits", () => {
    const ordered = [
      AI_LIMITS.none,
      AI_LIMITS.starter,
      AI_LIMITS.pro,
      AI_LIMITS.hired,
    ];
    for (let i = 1; i < ordered.length; i++) {
      expect(ordered[i].monthlyCredits).toBeGreaterThanOrEqual(
        ordered[i - 1].monthlyCredits
      );
    }
  });

  it("higher plans should have equal or more maxCoverLetters", () => {
    const ordered = [
      AI_LIMITS.none,
      AI_LIMITS.starter,
      AI_LIMITS.pro,
      AI_LIMITS.hired,
    ];
    for (let i = 1; i < ordered.length; i++) {
      expect(ordered[i].maxCoverLetters).toBeGreaterThanOrEqual(
        ordered[i - 1].maxCoverLetters
      );
    }
  });
});

describe("CREDIT_TRANSACTION_TYPES", () => {
  it("should include earned, spent, refunded, expired", () => {
    expect(CREDIT_TRANSACTION_TYPES.EARNED).toBe("earned");
    expect(CREDIT_TRANSACTION_TYPES.SPENT).toBe("spent");
    expect(CREDIT_TRANSACTION_TYPES.REFUNDED).toBe("refunded");
    expect(CREDIT_TRANSACTION_TYPES.EXPIRED).toBe("expired");
  });

  it("should have exactly 4 transaction types", () => {
    expect(Object.keys(CREDIT_TRANSACTION_TYPES)).toHaveLength(4);
  });
});

describe("PAGINATION", () => {
  it("MIN_LIMIT should be ≥ 1", () => {
    expect(PAGINATION.MIN_LIMIT).toBeGreaterThanOrEqual(1);
  });

  it("MAX_LIMIT should be > DEFAULT_LIMIT", () => {
    expect(PAGINATION.MAX_LIMIT).toBeGreaterThan(PAGINATION.DEFAULT_LIMIT);
  });

  it("DEFAULT_LIMIT should be within bounds", () => {
    expect(PAGINATION.DEFAULT_LIMIT).toBeGreaterThanOrEqual(PAGINATION.MIN_LIMIT);
    expect(PAGINATION.DEFAULT_LIMIT).toBeLessThanOrEqual(PAGINATION.MAX_LIMIT);
  });
});

describe("CREDITS action costs", () => {
  it("all action costs should be positive integers", () => {
    const actionKeys = [
      "JOB_EXTRACTION",
      "RESUME_UPLOAD",
      "COVER_LETTER_GENERATION",
      "RESUME_TEXT_EXTRACTION",
    ] as const;

    for (const key of actionKeys) {
      const val = CREDITS[key];
      expect(val, `${key} should be positive`).toBeGreaterThan(0);
      expect(Number.isInteger(val), `${key} should be integer`).toBe(true);
    }
  });
});

describe("SUBSCRIPTION_STATUS", () => {
  it("should include all standard Stripe statuses", () => {
    const expected = [
      "active",
      "canceled",
      "incomplete",
      "incomplete_expired",
      "past_due",
      "trialing",
      "unpaid",
    ];
    const actual = Object.values(SUBSCRIPTION_STATUS);
    for (const status of expected) {
      expect(actual).toContain(status);
    }
  });
});

describe("COVER_LETTER_PREFERENCES", () => {
  it("should have tone, focus, and length groups", () => {
    expect(COVER_LETTER_PREFERENCES).toHaveProperty("TONE");
    expect(COVER_LETTER_PREFERENCES).toHaveProperty("FOCUS");
    expect(COVER_LETTER_PREFERENCES).toHaveProperty("LENGTH");
  });
});
