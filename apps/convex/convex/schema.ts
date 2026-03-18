import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Business user profiles - linked to Clerk identity
  // This stores our app-specific user data like credits, billing, etc.
  userProfiles: defineTable({
    // Canonical Clerk user identifier (subject / tokenIdentifier)
    clerkUserId: v.string(),
    email: v.string(),
    name: v.string(),
    plan: v.union(
      v.literal("none"),
      v.literal("starter"),
      v.literal("pro"),
      v.literal("hired")
    ),
    isAdmin: v.optional(v.boolean()),
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
    entitlementsClaimedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_user_id", ["clerkUserId"])
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
    isDefault: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userProfileId"])
    .index("by_user_default", ["userProfileId", "isDefault"]),

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

  jobApplications: defineTable({
    userProfileId: v.id("userProfiles"),
    jobTitle: v.string(),
    companyName: v.string(),
    location: v.optional(v.string()),
    salary: v.optional(v.string()),
    status: v.optional(v.union(
      v.literal("applied"),
      v.literal("interviewing"),
      v.literal("offered"),
      v.literal("rejected"),
      v.literal("withdrawn")
    )),
    appliedDate: v.optional(v.number()),
    notes: v.optional(v.string()),
    jobUrl: v.optional(v.string()),
    jobType: v.optional(v.union(
      v.literal("full-time"),
      v.literal("part-time"),
      v.literal("contract"),
      v.literal("internship"),
      v.literal("freelance")
    )),
    resumeId: v.optional(v.id("resumes")),
    coverLetterId: v.optional(v.id("coverLetters")),
    extractedJobId: v.optional(v.id("extractedJobs")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userProfileId"])
    .index("by_user_date", ["userProfileId", "createdAt"])
    .index("by_user_status", ["userProfileId", "status"]),

  coverLetters: defineTable({
    userProfileId: v.id("userProfiles"),
    extractedJobId: v.optional(v.id("extractedJobs")),
    resumeId: v.id("resumes"),
    jobTitle: v.optional(v.string()),
    company: v.optional(v.string()),
    jobDescription: v.optional(v.string()),
    content: v.string(),
    generationStatus: v.optional(v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed")
    )),
    generationError: v.optional(v.union(v.string(), v.null())),
    generationAttempts: v.optional(v.number()),
    lastGenerationAttemptAt: v.optional(v.number()),
    tokensUsed: v.optional(v.number()),
    creditsUsed: v.number(),
    preferences: v.optional(v.object({
      tone: v.optional(v.union(v.literal("professional"), v.literal("casual"), v.literal("enthusiastic"))),
      focus: v.optional(v.union(v.literal("experience"), v.literal("skills"), v.literal("achievements"))),
      length: v.optional(v.union(v.literal("short"), v.literal("medium"), v.literal("long"))),
    })),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
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

  billingArchive: defineTable({
    source: v.union(
      v.literal("userProfiles"),
      v.literal("subscriptions"),
      v.literal("payments")
    ),
    sourceId: v.string(),
    clerkUserId: v.optional(v.string()),
    email: v.optional(v.string()),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    stripeInvoiceId: v.optional(v.string()),
    stripePaymentIntentId: v.optional(v.string()),
    amount: v.optional(v.number()),
    currency: v.optional(v.string()),
    status: v.optional(v.string()),
    metadata: v.optional(v.any()),
    archivedAt: v.number(),
  })
    .index("by_source", ["source"])
    .index("by_source_id", ["source", "sourceId"])
    .index("by_email", ["email"])
    .index("by_clerk_user_id", ["clerkUserId"])
    .index("by_stripe_customer", ["stripeCustomerId"])
    .index("by_stripe_subscription", ["stripeSubscriptionId"]),

  creditTransactions: defineTable({
    userProfileId: v.id("userProfiles"),
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
  clerkUserId: string;
  email: string;
  plan: 'none' | 'starter' | 'pro' | 'hired';
  iat?: number;
  exp?: number;
}
