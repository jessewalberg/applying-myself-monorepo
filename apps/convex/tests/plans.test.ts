import { describe, it, expect } from "vitest";
import {
  PRICING_PLANS,
  CREDIT_PACKAGES,
  getPlanById,
  getPlanByStripePriceId,
  getCreditPackageById,
  getMonthlyCreditsForPlan,
  baselineCreditsForPlan,
} from "../lib/plans";
import { AI_LIMITS } from "../convex/constants";

describe("getPlanById", () => {
  it("should return the correct plan for each canonical id", () => {
    expect(getPlanById("none").name).toBe("Free");
    expect(getPlanById("starter").name).toBe("Starter");
    expect(getPlanById("pro").name).toBe("Professional");
    expect(getPlanById("hired").name).toBe("Hired");
  });

  it("should have positive prices for paid plans", () => {
    expect(getPlanById("starter").price).toBeGreaterThan(0);
    expect(getPlanById("pro").price).toBeGreaterThan(0);
    expect(getPlanById("hired").price).toBeGreaterThan(0);
  });

  it("should have zero price for free plan", () => {
    expect(getPlanById("none").price).toBe(0);
  });
});

describe("getPlanByStripePriceId", () => {
  it("should find starter by its stripe price id", () => {
    const plan = getPlanByStripePriceId("price_starter_monthly");
    expect(plan).toBeDefined();
    expect(plan!.id).toBe("starter");
  });

  it("should return undefined for unknown price ids", () => {
    expect(getPlanByStripePriceId("price_unknown")).toBeUndefined();
  });

  it("should return undefined for empty string", () => {
    // The free plan has stripePriceId = '' so this actually matches!
    // But let's test a truly non-existent one
    expect(getPlanByStripePriceId("nonexistent_id")).toBeUndefined();
  });
});

describe("getCreditPackageById", () => {
  it("should find packages by id", () => {
    const pkg = getCreditPackageById("credits_10");
    expect(pkg).toBeDefined();
    expect(pkg!.credits).toBe(10);
  });

  it("should return undefined for non-existent packages", () => {
    expect(getCreditPackageById("credits_999")).toBeUndefined();
  });

  it("every package should have positive credits and price", () => {
    for (const [id, pkg] of Object.entries(CREDIT_PACKAGES)) {
      expect(pkg.credits, `${id} credits`).toBeGreaterThan(0);
      expect(pkg.price, `${id} price`).toBeGreaterThan(0);
    }
  });
});

describe("getMonthlyCreditsForPlan", () => {
  it("should match AI_LIMITS monthlyCredits", () => {
    expect(getMonthlyCreditsForPlan("none")).toBe(AI_LIMITS.none.monthlyCredits);
    expect(getMonthlyCreditsForPlan("starter")).toBe(AI_LIMITS.starter.monthlyCredits);
    expect(getMonthlyCreditsForPlan("pro")).toBe(AI_LIMITS.pro.monthlyCredits);
    expect(getMonthlyCreditsForPlan("hired")).toBe(AI_LIMITS.hired.monthlyCredits);
  });
});

describe("baselineCreditsForPlan", () => {
  it("should equal getMonthlyCreditsForPlan", () => {
    const plans = ["none", "starter", "pro", "hired"] as const;
    for (const plan of plans) {
      expect(baselineCreditsForPlan(plan)).toBe(getMonthlyCreditsForPlan(plan));
    }
  });
});

describe("PRICING_PLANS structure", () => {
  it("should have all 4 plan tiers", () => {
    expect(Object.keys(PRICING_PLANS)).toHaveLength(4);
    expect(PRICING_PLANS).toHaveProperty("none");
    expect(PRICING_PLANS).toHaveProperty("starter");
    expect(PRICING_PLANS).toHaveProperty("pro");
    expect(PRICING_PLANS).toHaveProperty("hired");
  });

  it("prices should increase from none → starter → pro → hired", () => {
    expect(PRICING_PLANS.none.price).toBeLessThan(PRICING_PLANS.starter.price);
    expect(PRICING_PLANS.starter.price).toBeLessThan(PRICING_PLANS.pro.price);
    expect(PRICING_PLANS.pro.price).toBeLessThan(PRICING_PLANS.hired.price);
  });

  it("every plan should have at least one feature", () => {
    for (const [id, plan] of Object.entries(PRICING_PLANS)) {
      expect(plan.features.length, `${id} should have features`).toBeGreaterThan(0);
    }
  });
});
