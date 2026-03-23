// Pure validation and utility helpers extracted from userHelpers.ts

export type CanonicalPlan = "none" | "starter" | "pro" | "hired";

/**
 * Normalize an unknown plan value to a CanonicalPlan.
 * Returns "none" for any unrecognized input.
 */
export function normalizePlan(plan: unknown): CanonicalPlan {
  if (
    plan === "starter" ||
    plan === "pro" ||
    plan === "hired" ||
    plan === "none"
  ) {
    return plan;
  }
  return "none";
}

/**
 * Numeric rank for plan comparison. Higher = better plan.
 */
export function planRank(plan: CanonicalPlan): number {
  if (plan === "hired") return 4;
  if (plan === "pro") return 3;
  if (plan === "starter") return 2;
  return 1;
}

/**
 * Parse an unknown value into a CanonicalPlan.
 */
export function parsePlan(value: unknown): CanonicalPlan {
  if (typeof value !== "string") return "none";
  return normalizePlan(value);
}

/**
 * Validate that an email contains an "@" symbol (same rule used by updateUserProfile).
 */
export function isValidEmail(email: string): boolean {
  return typeof email === "string" && email.includes("@");
}

/**
 * Validate that a name is at least 2 characters after trimming
 * (same rule used by updateUserProfile).
 */
export function isValidName(name: string): boolean {
  return typeof name === "string" && name.trim().length >= 2;
}

/**
 * Normalize an email: lowercase + trim.
 */
export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * Compare two plans. Returns true if planA is strictly higher-tier than planB.
 */
export function isHigherPlan(
  planA: CanonicalPlan,
  planB: CanonicalPlan
): boolean {
  return planRank(planA) > planRank(planB);
}
