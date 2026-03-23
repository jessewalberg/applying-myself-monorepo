import { describe, expect, it } from "vitest";
import {
  CREDIT_PACKAGES,
  PRICING_PLANS,
  getPricingCatalog,
  getReactivatedPlan,
  normalizePlan,
} from "../lib/billing";
import {
  CREDIT_PACKAGES as SHARED_CREDIT_PACKAGES,
  PRICING_PLANS as SHARED_PRICING_PLANS,
  getCreditPackageById,
  getPlanById,
  getPlanByStripePriceId,
} from "../lib/plans";

describe("lib/billing deduplication", () => {
  it("re-exports the shared pricing plans object", () => {
    expect(PRICING_PLANS).toBe(SHARED_PRICING_PLANS);
  });

  it("re-exports the shared credit packages object", () => {
    expect(CREDIT_PACKAGES).toBe(SHARED_CREDIT_PACKAGES);
  });
});

describe("getPricingCatalog", () => {
  it("returns every pricing plan", () => {
    expect(getPricingCatalog().plans).toHaveLength(4);
  });

  it("returns every credit package", () => {
    expect(getPricingCatalog().creditPackages).toHaveLength(4);
  });

  it("includes the free tier and paid tiers in the plan catalog", () => {
    const planIds = getPricingCatalog().plans.map((plan) => plan.id);
    expect(planIds).toEqual(["none", "starter", "pro", "hired"]);
  });

  it("includes the expected add-on package ids", () => {
    const packageIds = getPricingCatalog().creditPackages.map((pkg) => pkg.id);
    expect(packageIds).toEqual([
      "credits_10",
      "credits_25",
      "credits_50",
      "credits_100",
    ]);
  });
});

describe("getReactivatedPlan", () => {
  it("upgrades a none plan back to starter for reactivation", () => {
    expect(getReactivatedPlan("none")).toBe("starter");
  });

  it("preserves paid plans during reactivation", () => {
    expect(getReactivatedPlan("starter")).toBe("starter");
    expect(getReactivatedPlan("pro")).toBe("pro");
    expect(getReactivatedPlan("hired")).toBe("hired");
  });

  it("falls back to starter for unknown input", () => {
    expect(getReactivatedPlan("enterprise")).toBe("starter");
    expect(getReactivatedPlan(undefined)).toBe("starter");
  });
});

describe("normalizePlan", () => {
  it("accepts canonical billing plans", () => {
    expect(normalizePlan("none")).toBe("none");
    expect(normalizePlan("starter")).toBe("starter");
    expect(normalizePlan("pro")).toBe("pro");
    expect(normalizePlan("hired")).toBe("hired");
  });

  it("falls back to none for invalid billing plans", () => {
    expect(normalizePlan("enterprise")).toBe("none");
    expect(normalizePlan(null)).toBe("none");
  });
});

describe("plan/package lookups", () => {
  it("resolves pricing plans by id", () => {
    expect(getPlanById("starter")).toBe(PRICING_PLANS.starter);
    expect(getPlanById("pro")).toBe(PRICING_PLANS.pro);
  });

  it("resolves pricing plans by stripe price id", () => {
    expect(getPlanByStripePriceId(PRICING_PLANS.pro.stripePriceId)).toBe(
      PRICING_PLANS.pro
    );
  });

  it("resolves credit packages by id", () => {
    expect(getCreditPackageById("credits_50")).toBe(CREDIT_PACKAGES.credits_50);
  });

  it("keeps lookup data aligned with the shared billing exports", () => {
    expect(getPlanById("hired").stripePriceId).toBe(
      PRICING_PLANS.hired.stripePriceId
    );
    expect(getCreditPackageById("credits_25")?.stripePriceId).toBe(
      CREDIT_PACKAGES.credits_25.stripePriceId
    );
  });
});
