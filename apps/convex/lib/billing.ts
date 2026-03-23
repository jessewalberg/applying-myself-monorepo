import type { CanonicalPlan } from "./validation";
import { normalizePlan } from "./validation";
import {
  CREDIT_PACKAGES as SHARED_CREDIT_PACKAGES,
  PRICING_PLANS as SHARED_PRICING_PLANS,
  getCreditPackageById,
} from "./plans";

export const PRICING_PLANS = SHARED_PRICING_PLANS;
export const CREDIT_PACKAGES = SHARED_CREDIT_PACKAGES;

export { normalizePlan };

export function getPricingCatalog() {
  return {
    plans: Object.values(PRICING_PLANS),
    creditPackages: Object.values(CREDIT_PACKAGES),
  };
}

export function getCreditPackage(packageId: string) {
  return getCreditPackageById(packageId);
}

export function getReactivatedPlan(plan: unknown): CanonicalPlan {
  const normalizedPlan = normalizePlan(plan);
  return normalizedPlan === "none" ? "starter" : normalizedPlan;
}
