import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  // Include Convex Auth's built-in authentication tables
  ...authTables,
  
  // Business user profiles - linked to Convex Auth users
  // This stores our app-specific user data like credits, billing, etc.
  userProfiles: defineTable({
    // Link to Convex Auth user
    userId: v.id("users"), // This references the Convex Auth users table
    email: v.string(),
    name: v.string(),
    plan: v.union(v.literal("free"), v.literal("starter"), v.literal("pro"), v.literal("enterprise")),
    credits: v.optional(v.number()),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    subscriptionStatus: v.optional(v.union(
      v.literal("active"), 
      v.literal("canceled"), 
      v.literal("incomplete"), 
      v.literal("incomplete_expired"), 
      v.literal("past_due"), 
      v.literal("trialing"), 
      v.literal("unpaid")
    )),
    subscriptionCurrentPeriodStart: v.optional(v.string()),
    subscriptionCurrentPeriodEnd: v.optional(v.string()),
    billingAddress: v.optional(v.object({
      line1: v.string(),
      line2: v.optional(v.string()),
      city: v.string(),
      state: v.string(),
      postalCode: v.string(),
      country: v.string(),
    })),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_email", ["email"])
    .index("by_stripe_customer", ["stripeCustomerId"]),

  // All other tables now reference userProfiles instead of users
  resumes: defineTable({
    userProfileId: v.id("userProfiles"),
    filename: v.string(),
    fileId: v.id("_storage"),
    fileSize: v.number(),
    mimeType: v.string(),
    extractedText: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userProfileId"]),

  extractedJobs: defineTable({
    userProfileId: v.id("userProfiles"),
    url: v.string(),
    title: v.optional(v.string()),
    company: v.optional(v.string()),
    location: v.optional(v.string()),
    salary: v.optional(v.string()),
    jobType: v.optional(v.string()),
    experience: v.optional(v.string()),
    requirements: v.optional(v.array(v.string())),
    description: v.optional(v.string()),
    benefits: v.optional(v.array(v.string())),
    skills: v.optional(v.array(v.string())),
    industry: v.optional(v.string()),
    remote: v.optional(v.string()),
    pageType: v.optional(v.string()),
    confidence: v.optional(v.number()),
    extractedAt: v.number(),
  })
    .index("by_user", ["userProfileId"])
    .index("by_user_date", ["userProfileId", "extractedAt"]),

  coverLetters: defineTable({
    userProfileId: v.id("userProfiles"),
    extractedJobId: v.optional(v.id("extractedJobs")),
    resumeId: v.id("resumes"),
    jobTitle: v.optional(v.string()),
    company: v.optional(v.string()),
    content: v.string(),
    creditsUsed: v.number(),
    preferences: v.optional(v.object({
      tone: v.optional(v.union(v.literal("professional"), v.literal("casual"), v.literal("enthusiastic"))),
      focus: v.optional(v.union(v.literal("experience"), v.literal("skills"), v.literal("achievements"))),
      length: v.optional(v.union(v.literal("short"), v.literal("medium"), v.literal("long"))),
    })),
    createdAt: v.number(),
  })
    .index("by_user", ["userProfileId"])
    .index("by_user_date", ["userProfileId", "createdAt"]),

  apiUsage: defineTable({
    userProfileId: v.id("userProfiles"),
    endpoint: v.string(),
    creditsUsed: v.optional(v.number()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    responseTime: v.optional(v.number()),
    success: v.optional(v.boolean()),
    createdAt: v.number(),
  })
    .index("by_user", ["userProfileId"])
    .index("by_user_date", ["userProfileId", "createdAt"]),

  subscriptions: defineTable({
    userProfileId: v.id("userProfiles"),
    stripeSubscriptionId: v.string(),
    stripePriceId: v.string(),
    status: v.union(
      v.literal("active"), 
      v.literal("canceled"), 
      v.literal("incomplete"), 
      v.literal("incomplete_expired"), 
      v.literal("past_due"), 
      v.literal("trialing"), 
      v.literal("unpaid")
    ),
    currentPeriodStart: v.string(),
    currentPeriodEnd: v.string(),
    cancelAtPeriodEnd: v.optional(v.boolean()),
    canceledAt: v.optional(v.string()),
    trialStart: v.optional(v.string()),
    trialEnd: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userProfileId"])
    .index("by_stripe_subscription", ["stripeSubscriptionId"]),

  payments: defineTable({
    userProfileId: v.id("userProfiles"),
    stripePaymentIntentId: v.optional(v.string()),
    stripeSessionId: v.optional(v.string()),
    stripeInvoiceId: v.optional(v.string()),
    amount: v.number(),
    currency: v.optional(v.string()),
    status: v.union(v.literal("pending"), v.literal("succeeded"), v.literal("failed"), v.literal("canceled"), v.literal("refunded")),
    type: v.union(v.literal("subscription"), v.literal("credits"), v.literal("one_time")),
    creditsGranted: v.optional(v.number()),
    description: v.optional(v.string()),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userProfileId"])
    .index("by_stripe_payment_intent", ["stripePaymentIntentId"])
    .index("by_stripe_session", ["stripeSessionId"]),

  creditTransactions: defineTable({
    userProfileId: v.optional(v.id("userProfiles")),
    userId: v.optional(v.string()), // Old field, for migration
    type: v.union(v.literal("earned"), v.literal("spent"), v.literal("refunded"), v.literal("expired")),
    amount: v.number(),
    balance: v.number(),
    source: v.string(),
    sourceId: v.optional(v.string()),
    description: v.optional(v.string()),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  })
    .index("by_user", ["userProfileId"])
    .index("by_user_date", ["userProfileId", "createdAt"]),

  extensionUsage: defineTable({
    extensionId: v.string(),
    extensionVersion: v.optional(v.string()),
    requests: v.number(),
    lastRequest: v.number(),
    date: v.string(), // YYYY-MM-DD format
  })
    .index("by_extension_date", ["extensionId", "date"]),
});

// Export types for our business logic
export interface CoverLetterPreferences {
  tone?: 'professional' | 'casual' | 'enthusiastic';
  focus?: 'experience' | 'skills' | 'achievements';
  length?: 'short' | 'medium' | 'long';
}

export interface JobExtractionData {
  title?: string;
  company?: string;
  location?: string;
  description?: string;
  salary?: string;
  jobType?: string;
  experience?: string;
  requirements?: string[];
  skills?: string[];
  benefits?: string[];
  industry?: string;
  remote?: string;
  pageType: string;
  confidence: number;
  url: string;
  domain: string;
}

export interface ValidationErrorDetail {
  field: string;
  message: string;
}

export interface PlanLimits {
  maxCoverLetters: number;
  maxResumes: number;
  maxJobExtractions: number;
  credits: number;
  monthlyCredits: number;
}

export interface SubscriptionLimits {
  hasActiveSubscription: boolean;
  planLimits: PlanLimits;
  usage: {
    credits: number;
    monthlyCreditsUsed: number;
  };
}

export interface CreditStats {
  currentBalance: number;
  totalEarned: number;
  totalSpent: number;
  thisMonthSpent: number;
}

export interface JWTPayload {
  userId: string;
  email: string;
  plan: 'free' | 'starter' | 'pro' | 'enterprise';
  iat?: number;
  exp?: number;
}