import { describe, it, expect } from "vitest";
import {
  normalizePlan,
  planRank,
  parsePlan,
  isValidEmail,
  isValidName,
  normalizeEmail,
  isHigherPlan,
} from "../lib/validation";

describe("normalizePlan", () => {
  it("should pass through valid plan strings", () => {
    expect(normalizePlan("none")).toBe("none");
    expect(normalizePlan("starter")).toBe("starter");
    expect(normalizePlan("pro")).toBe("pro");
    expect(normalizePlan("hired")).toBe("hired");
  });

  it("should return 'none' for unrecognized strings", () => {
    expect(normalizePlan("enterprise")).toBe("none");
    expect(normalizePlan("")).toBe("none");
    expect(normalizePlan("PRO")).toBe("none");
  });

  it("should return 'none' for non-string inputs", () => {
    expect(normalizePlan(undefined)).toBe("none");
    expect(normalizePlan(null)).toBe("none");
    expect(normalizePlan(42)).toBe("none");
    expect(normalizePlan({})).toBe("none");
  });
});

describe("planRank", () => {
  it("should rank plans in ascending order", () => {
    expect(planRank("none")).toBeLessThan(planRank("starter"));
    expect(planRank("starter")).toBeLessThan(planRank("pro"));
    expect(planRank("pro")).toBeLessThan(planRank("hired"));
  });

  it("should return 1 for none", () => {
    expect(planRank("none")).toBe(1);
  });

  it("should return 4 for hired", () => {
    expect(planRank("hired")).toBe(4);
  });
});

describe("parsePlan", () => {
  it("should parse valid plan strings", () => {
    expect(parsePlan("pro")).toBe("pro");
  });

  it("should return 'none' for non-string values", () => {
    expect(parsePlan(123)).toBe("none");
    expect(parsePlan(null)).toBe("none");
    expect(parsePlan(undefined)).toBe("none");
  });

  it("should return 'none' for unrecognized strings", () => {
    expect(parsePlan("premium")).toBe("none");
  });
});

describe("isValidEmail", () => {
  it("should accept emails with @", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("a@b")).toBe(true);
  });

  it("should reject emails without @", () => {
    expect(isValidEmail("userexample.com")).toBe(false);
    expect(isValidEmail("")).toBe(false);
  });
});

describe("isValidName", () => {
  it("should accept names with 2+ characters after trim", () => {
    expect(isValidName("Jo")).toBe(true);
    expect(isValidName("  Jo  ")).toBe(true);
    expect(isValidName("Jesse Walberg")).toBe(true);
  });

  it("should reject names shorter than 2 characters after trim", () => {
    expect(isValidName("J")).toBe(false);
    expect(isValidName("  J  ")).toBe(false);
    expect(isValidName("")).toBe(false);
    expect(isValidName("   ")).toBe(false);
  });
});

describe("normalizeEmail", () => {
  it("should lowercase and trim", () => {
    expect(normalizeEmail("  USER@Example.COM  ")).toBe("user@example.com");
  });
});

describe("isHigherPlan", () => {
  it("should return true when first plan is strictly higher", () => {
    expect(isHigherPlan("pro", "starter")).toBe(true);
    expect(isHigherPlan("hired", "none")).toBe(true);
  });

  it("should return false for equal plans", () => {
    expect(isHigherPlan("pro", "pro")).toBe(false);
  });

  it("should return false when first plan is lower", () => {
    expect(isHigherPlan("none", "starter")).toBe(false);
  });
});
