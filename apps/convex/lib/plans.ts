// Pure plan/pricing helpers extracted from billing.ts and constants.ts

import { AI_LIMITS, CREDITS } from "../convex/constants";
import type { CanonicalPlan } from "./validation";

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  credits: number;
  stripePriceId: string;
  features: readonly string[];
  popular?: boolean;
}

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  stripePriceId: string;
}

/** Pricing plans (mirrors PRICING_PLANS in billing.ts) */
export const PRICING_PLANS: Record<CanonicalPlan, PricingPlan> = {
  none: {
    id: "none",
    name: "Free",
    description: "Get started with basic features",
    price: 0,
    credits: 3,
    stripePriceId: "",
    features: [
      "3 free credits",
      "Basic cover letter generation",
      "Job extraction from web pages",
      "Resume upload and processing",
    ],
  },
  starter: {
    id: "starter",
    name: "Starter",
    description: "Perfect for job seekers",
    price: 9.99,
    credits: 50,
    stripePriceId: "price_starter_monthly",
    features: [
      "50 credits per month",
      "Advanced AI cover letters",
      "Multiple resume management",
      "Job extraction history",
      "Email support",
    ],
  },
  pro: {
    id: "pro",
    name: "Professional",
    description: "For active job hunters",
    price: 19.99,
    credits: 150,
    stripePriceId: "price_pro_monthly",
    features: [
      "150 credits per month",
      "Premium AI models",
      "Unlimited resume storage",
      "Advanced customization options",
      "Priority support",
      "Usage analytics",
    ],
    popular: true,
  },
  hired: {
    id: "hired",
    name: "Hired",
    description: "For teams and recruiters",
    price: 49.99,
    credits: 500,
    stripePriceId: "price_enterprise_monthly",
    features: [
      "500 credits per month",
      "Team collaboration",
      "Bulk operations",
      "API access",
      "Custom integrations",
      "Dedicated support",
      "Advanced analytics",
    ],
  },
};

/** Credit add-on packages (mirrors CREDIT_PACKAGES in billing.ts) */
export const CREDIT_PACKAGES: Record<string, CreditPackage> = {
  credits_10: {
    id: "credits_10",
    name: "10 Credits",
    credits: 10,
    price: 2.99,
    stripePriceId: "price_credits_10",
  },
  credits_25: {
    id: "credits_25",
    name: "25 Credits",
    credits: 25,
    price: 6.99,
    stripePriceId: "price_credits_25",
  },
  credits_50: {
    id: "credits_50",
    name: "50 Credits",
    credits: 50,
    price: 12.99,
    stripePriceId: "price_credits_50",
  },
  credits_100: {
    id: "credits_100",
    name: "100 Credits",
    credits: 100,
    price: 24.99,
    stripePriceId: "price_credits_100",
  },
};

/**
 * Look up a pricing plan by its canonical plan id.
 */
export function getPlanById(planId: CanonicalPlan): PricingPlan {
  return PRICING_PLANS[planId];
}

/**
 * Look up a pricing plan by its Stripe price ID.
 * Returns undefined if no plan matches.
 */
export function getPlanByStripePriceId(
  stripePriceId: string
): PricingPlan | undefined {
  return Object.values(PRICING_PLANS).find(
    (p) => p.stripePriceId === stripePriceId
  );
}

/**
 * Look up a credit package by its id.
 * Returns undefined if the package doesn't exist.
 */
export function getCreditPackageById(
  packageId: string
): CreditPackage | undefined {
  return CREDIT_PACKAGES[packageId];
}

/**
 * Return the monthly credit allocation for a given plan
 * (from AI_LIMITS in constants.ts).
 */
export function getMonthlyCreditsForPlan(plan: CanonicalPlan): number {
  return AI_LIMITS[plan].monthlyCredits;
}

/**
 * Return the baseline credit allocation for a plan (same as monthlyCredits).
 */
export function baselineCreditsForPlan(plan: CanonicalPlan): number {
  return AI_LIMITS[plan].monthlyCredits;
}
