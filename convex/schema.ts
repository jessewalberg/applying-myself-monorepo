import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
  }).index("email", ["email"]),

  authSessions: defineTable({
    userId: v.id("users"),
    sessionId: v.string(),
    expirationTime: v.number(),
  })
    .index("sessionId", ["sessionId"])
    .index("userId", ["userId"]),

  authAccounts: defineTable({
    userId: v.id("users"),
    provider: v.string(),
    providerAccountId: v.string(),
    type: v.union(v.literal("oidc"), v.literal("oauth"), v.literal("email")),
    access_token: v.optional(v.string()),
    refresh_token: v.optional(v.string()),
    id_token: v.optional(v.string()),
    scope: v.optional(v.string()),
    expires_at: v.optional(v.number()),
    token_type: v.optional(v.string()),
    session_state: v.optional(v.string()),
  })
    .index("providerAndAccountId", ["provider", "providerAccountId"])
    .index("userId", ["userId"]),

  authVerificationCodes: defineTable({
    identifier: v.string(),
    code: v.string(),
    expiresAt: v.number(),
  }).index("identifier", ["identifier"]),

  authVerifiers: defineTable({
    sessionId: v.string(),
    signature: v.string(),
  }).index("sessionId", ["sessionId"]),

  userProfiles: defineTable({
    userId: v.id("users"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.string(),
    phone: v.optional(v.string()),
    location: v.optional(v.string()),
    website: v.optional(v.string()),
    linkedIn: v.optional(v.string()),
    github: v.optional(v.string()),
    bio: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    experience: v.optional(v.array(v.object({
      company: v.string(),
      position: v.string(),
      startDate: v.string(),
      endDate: v.optional(v.string()),
      description: v.string(),
      current: v.optional(v.boolean()),
    }))),
    education: v.optional(v.array(v.object({
      school: v.string(),
      degree: v.string(),
      field: v.string(),
      startDate: v.string(),
      endDate: v.optional(v.string()),
      gpa: v.optional(v.string()),
    }))),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("userId", ["userId"]),

  credits: defineTable({
    userId: v.id("users"),
    amount: v.number(),
    type: v.union(
      v.literal("purchase"),
      v.literal("usage"),
      v.literal("refund"),
      v.literal("bonus")
    ),
    reason: v.string(),
    relatedId: v.optional(v.string()),
    createdAt: v.number(),
  }).index("userId", ["userId"]),

  resumes: defineTable({
    userId: v.id("users"),
    name: v.string(),
    content: v.optional(v.string()),
    fileId: v.optional(v.id("_storage")),
    fileName: v.optional(v.string()),
    fileSize: v.optional(v.number()),
    mimeType: v.optional(v.string()),
    isDefault: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("userId", ["userId"]),

  coverLetters: defineTable({
    userId: v.id("users"),
    jobTitle: v.string(),
    companyName: v.string(),
    jobDescription: v.optional(v.string()),
    content: v.string(),
    tone: v.optional(v.string()),
    length: v.optional(v.string()),
    customInstructions: v.optional(v.string()),
    creditsUsed: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("userId", ["userId"]),

  jobApplications: defineTable({
    userId: v.id("users"),
    jobTitle: v.string(),
    companyName: v.string(),
    jobDescription: v.optional(v.string()),
    jobUrl: v.optional(v.string()),
    location: v.optional(v.string()),
    salary: v.optional(v.string()),
    status: v.union(
      v.literal("applied"),
      v.literal("interviewing"),
      v.literal("offered"),
      v.literal("rejected"),
      v.literal("withdrawn")
    ),
    appliedDate: v.optional(v.number()),
    resumeId: v.optional(v.id("resumes")),
    coverLetterId: v.optional(v.id("coverLetters")),
    notes: v.optional(v.string()),
    contacts: v.optional(v.array(v.object({
      name: v.string(),
      email: v.optional(v.string()),
      phone: v.optional(v.string()),
      role: v.optional(v.string()),
    }))),
    interviews: v.optional(v.array(v.object({
      date: v.number(),
      type: v.string(),
      interviewer: v.optional(v.string()),
      notes: v.optional(v.string()),
    }))),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("userId", ["userId"]),
}); 