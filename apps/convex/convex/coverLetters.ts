// convex/coverLetters.ts
import { internalMutation, mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { getCurrentUserProfile } from "./userHelpers";
import { api } from "./_generated/api";
import { CREDITS, CREDIT_TRANSACTION_TYPES, PAGINATION } from "./constants";
import type { Doc, Id } from "./_generated/dataModel";

type RetryableCoverLetterDoc = Doc<"coverLetters"> & {
  jobDescription?: string;
};

type NormalizedCoverLetter = RetryableCoverLetterDoc & {
  generationStatus: "pending" | "completed" | "failed";
  generationError: string | null;
  generationAttempts: number;
  lastGenerationAttemptAt?: number;
  tokensUsed?: number;
  updatedAt?: number;
};

type GenerateCoverLetterResult = {
  coverLetter: NormalizedCoverLetter;
  tokensUsed: number;
  remainingCredits: number;
};

const COVER_LETTER_GENERATION_PLACEHOLDER =
  "Generating your personalized cover letter...";

const normalizeCoverLetter = (
  coverLetter: RetryableCoverLetterDoc
): NormalizedCoverLetter => ({
  ...coverLetter,
  generationStatus:
    coverLetter.generationStatus ||
    (coverLetter.content === COVER_LETTER_GENERATION_PLACEHOLDER
      ? "pending"
      : "completed"),
  generationError: coverLetter.generationError ?? null,
  generationAttempts: coverLetter.generationAttempts ?? 1,
  lastGenerationAttemptAt:
    coverLetter.lastGenerationAttemptAt ?? coverLetter.createdAt ?? coverLetter._creationTime,
  tokensUsed: coverLetter.tokensUsed ?? 0,
  updatedAt: coverLetter.updatedAt ?? coverLetter.createdAt ?? coverLetter._creationTime,
});

const coverLetterReturnValidator = v.object({
  _id: v.id("coverLetters"),
  userProfileId: v.id("userProfiles"),
  extractedJobId: v.optional(v.id("extractedJobs")),
  resumeId: v.id("resumes"),
  jobTitle: v.optional(v.string()),
  company: v.optional(v.string()),
  jobDescription: v.optional(v.string()),
  content: v.string(),
  generationStatus: v.union(
    v.literal("pending"),
    v.literal("completed"),
    v.literal("failed")
  ),
  generationError: v.optional(v.union(v.string(), v.null())),
  generationAttempts: v.number(),
  lastGenerationAttemptAt: v.optional(v.number()),
  tokensUsed: v.optional(v.number()),
  creditsUsed: v.number(),
  preferences: v.optional(v.any()),
  createdAt: v.optional(v.number()),
  updatedAt: v.optional(v.number()),
  _creationTime: v.number(),
});

// Generate cover letter (creates placeholder, then schedules AI generation)
export const generate = mutation({
  args: {
    resumeId: v.id("resumes"),
    extractedContent: v.object({
      title: v.optional(v.string()),
      company: v.optional(v.string()),
      location: v.optional(v.string()),
      description: v.optional(v.string()),
      salary: v.optional(v.string()),
      type: v.optional(v.string()),
      requirements: v.optional(v.array(v.string())),
      skills: v.optional(v.array(v.string())),
      pageType: v.string(),
      confidence: v.number(),
      url: v.string(),
      domain: v.string(),
    }),
    preferences: v.optional(v.object({
      tone: v.optional(v.union(v.literal("professional"), v.literal("casual"), v.literal("enthusiastic"))),
      focus: v.optional(v.union(v.literal("experience"), v.literal("skills"), v.literal("achievements"))),
      length: v.optional(v.union(v.literal("short"), v.literal("medium"), v.literal("long"))),
    })),
  },
  returns: v.object({
    coverLetter: coverLetterReturnValidator,
    tokensUsed: v.number(),
    remainingCredits: v.number(),
  }),
  handler: async (ctx, args): Promise<GenerateCoverLetterResult> => {
    const { extractedContent, resumeId, preferences } = args;
    
    // Get authenticated user profile
    const userProfile = await getCurrentUserProfile(ctx);
    
    // Check credits
    const creditsRequired = CREDITS.COVER_LETTER_GENERATION;
    const currentCredits = userProfile.credits || 0;
    if (currentCredits < creditsRequired) {
      throw new ConvexError("Insufficient credits. Please upgrade your plan or purchase more credits.");
    }
    
    // Get resume
    const resume = await ctx.db.get(resumeId);
    if (!resume || resume.userProfileId !== userProfile._id) {
      throw new ConvexError("Resume not found or access denied");
    }

    // Create placeholder cover letter
    const now = Date.now();
    const coverLetterId: Id<"coverLetters"> = await ctx.db.insert("coverLetters", {
      userProfileId: userProfile._id,
      resumeId,
      jobTitle: extractedContent.title || undefined,
      company: extractedContent.company || undefined,
      jobDescription: extractedContent.description || undefined,
      content: COVER_LETTER_GENERATION_PLACEHOLDER,
      generationStatus: "pending",
      generationAttempts: 1,
      generationError: null,
      lastGenerationAttemptAt: now,
      tokensUsed: 0,
      creditsUsed: creditsRequired,
      preferences: preferences || undefined,
      createdAt: now,
      updatedAt: now,
    });

    console.info("[convex.coverLetters.generate] queued", {
      coverLetterId,
      userProfileId: userProfile._id,
      resumeId,
      company: extractedContent.company || null,
      jobTitle: extractedContent.title || null,
    });

    // Deduct credits
    const newBalance = currentCredits - creditsRequired;
    await ctx.db.patch(userProfile._id, {
      credits: newBalance,
      updatedAt: now,
    });

    // Log credit transaction
    await ctx.db.insert("creditTransactions", {
      userProfileId: userProfile._id,
      type: CREDIT_TRANSACTION_TYPES.SPENT,
      amount: creditsRequired,
      balance: newBalance,
      source: "generate-cover-letter",
      sourceId: coverLetterId,
      description: "Cover letter generation",
      createdAt: now,
    });

    // Schedule AI generation
    await ctx.scheduler.runAfter(0, api.ai.generateCoverLetter, {
      coverLetterId,
      resumeText: resume.extractedText || "",
      jobDescription: extractedContent.description || "",
      company: extractedContent.company || "",
      jobTitle: extractedContent.title || "",
      candidateName: userProfile.name,
      preferences,
    });

    const coverLetter = await ctx.db.get(coverLetterId) as RetryableCoverLetterDoc | null;
    if (!coverLetter) {
      throw new ConvexError("Failed to retrieve generated cover letter");
    }

    return {
      coverLetter: normalizeCoverLetter(coverLetter),
      tokensUsed: 0, // Will be updated when AI generation completes
      remainingCredits: newBalance,
    };
  },
});

export const generateFromForm = mutation({
  args: {
    resumeId: v.id("resumes"),
    jobTitle: v.string(),
    companyName: v.string(),
    jobDescription: v.optional(v.string()),
    preferences: v.optional(v.object({
      tone: v.optional(v.union(v.literal("professional"), v.literal("casual"), v.literal("enthusiastic"))),
      length: v.optional(v.union(v.literal("short"), v.literal("medium"), v.literal("long"))),
      customInstructions: v.optional(v.string()),
    })),
    createJobApplication: v.optional(v.boolean()),
    jobApplicationData: v.optional(v.object({
      jobUrl: v.optional(v.string()),
      location: v.optional(v.string()),
      salary: v.optional(v.string()),
      jobType: v.optional(v.union(v.literal("full-time"), v.literal("part-time"), v.literal("contract"), v.literal("internship"), v.literal("freelance"))),
      notes: v.optional(v.string()),
    })),
  },
  returns: v.object({
    coverLetter: coverLetterReturnValidator,
    tokensUsed: v.number(),
    remainingCredits: v.number(),
  }),
  handler: async (ctx, args): Promise<GenerateCoverLetterResult> => {
    const generated: GenerateCoverLetterResult = await ctx.runMutation(api.coverLetters.generate as any, {
      resumeId: args.resumeId,
      extractedContent: {
        title: args.jobTitle,
        company: args.companyName,
        description: args.jobDescription,
        pageType: "manual-form",
        confidence: 1,
        url: "",
        domain: "manual",
      },
      preferences: args.preferences
        ? {
            tone: args.preferences.tone,
            length: args.preferences.length,
          }
        : undefined,
    }) as GenerateCoverLetterResult;

    if (args.createJobApplication) {
      const jobData = args.jobApplicationData ?? {};
      await ctx.db.insert("jobApplications", {
        userProfileId: generated.coverLetter.userProfileId,
        jobTitle: args.jobTitle,
        companyName: args.companyName,
        location: jobData.location,
        salary: jobData.salary,
        status: "applied",
        appliedDate: Date.now(),
        notes: jobData.notes,
        jobUrl: jobData.jobUrl,
        jobType: jobData.jobType,
        resumeId: args.resumeId,
        coverLetterId: generated.coverLetter._id,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    return generated;
  },
});

export const refundFailedGenerationCredits = internalMutation({
  args: {
    coverLetterId: v.id("coverLetters"),
    reason: v.optional(v.string()),
  },
  returns: v.object({
    refunded: v.boolean(),
    newBalance: v.optional(v.number()),
  }),
  handler: async (ctx, args) => {
    const coverLetter = await ctx.db.get(args.coverLetterId) as RetryableCoverLetterDoc | null;
    if (!coverLetter) {
      throw new ConvexError("Cover letter not found");
    }

    const refundAmount = coverLetter.creditsUsed ?? 0;
    if (refundAmount <= 0) {
      return { refunded: false };
    }

    const existingRefund = await ctx.db
      .query("creditTransactions")
      .withIndex("by_user", (q) => q.eq("userProfileId", coverLetter.userProfileId))
      .filter((q) =>
        q.and(
          q.eq(q.field("type"), CREDIT_TRANSACTION_TYPES.REFUNDED),
          q.eq(q.field("source"), "generate-cover-letter"),
          q.eq(q.field("sourceId"), args.coverLetterId)
        )
      )
      .first();

    if (existingRefund) {
      return { refunded: false, newBalance: existingRefund.balance };
    }

    const userProfile = await ctx.db.get(coverLetter.userProfileId);
    if (!userProfile) {
      throw new ConvexError("User profile not found");
    }

    const newBalance = (userProfile.credits || 0) + refundAmount;
    const now = Date.now();

    await ctx.db.patch(userProfile._id, {
      credits: newBalance,
      updatedAt: now,
    });

    await ctx.db.insert("creditTransactions", {
      userProfileId: userProfile._id,
      type: CREDIT_TRANSACTION_TYPES.REFUNDED,
      amount: refundAmount,
      balance: newBalance,
      source: "generate-cover-letter",
      sourceId: args.coverLetterId,
      description: args.reason || "Cover letter generation refund",
      createdAt: now,
    });

    await ctx.db.patch(args.coverLetterId, {
      creditsUsed: 0,
      updatedAt: now,
    });

    return { refunded: true, newBalance };
  },
});

// Update cover letter content (called by AI action)
export const updateContent = mutation({
  args: {
    coverLetterId: v.id("coverLetters"),
    content: v.string(),
    tokensUsed: v.optional(v.number()),
    generationStatus: v.optional(
      v.union(v.literal("pending"), v.literal("completed"), v.literal("failed"))
    ),
    generationError: v.optional(v.union(v.string(), v.null())),
  },
  returns: v.object({
    success: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const patch: Partial<Doc<"coverLetters">> = {
      content: args.content,
      updatedAt: Date.now(),
    };

    if (args.tokensUsed !== undefined) {
      patch.tokensUsed = args.tokensUsed;
    }
    if (args.generationStatus !== undefined) {
      patch.generationStatus = args.generationStatus;
    }
    if (args.generationError !== undefined) {
      patch.generationError = args.generationError;
    }

    await ctx.db.patch(args.coverLetterId, {
      ...patch,
    });
    
    return { success: true };
  },
});

export const retryGeneration = mutation({
  args: {
    coverLetterId: v.id("coverLetters"),
  },
  returns: v.object({
    success: v.boolean(),
    coverLetter: coverLetterReturnValidator,
  }),
  handler: async (ctx, args) => {
    const userProfile = await getCurrentUserProfile(ctx);
    const coverLetter = await ctx.db.get(args.coverLetterId) as RetryableCoverLetterDoc | null;

    if (!coverLetter || coverLetter.userProfileId !== userProfile._id) {
      throw new ConvexError("Cover letter not found or access denied");
    }

    const normalizedCoverLetter: NormalizedCoverLetter = normalizeCoverLetter(coverLetter);

    if (normalizedCoverLetter.generationStatus === "pending") {
      throw new ConvexError("Cover letter generation is already in progress");
    }

    const resume = await ctx.db.get(normalizedCoverLetter.resumeId);
    if (!resume || resume.userProfileId !== userProfile._id) {
      throw new ConvexError("Resume not found or access denied");
    }

    const nextAttempt = normalizedCoverLetter.generationAttempts + 1;
    const now = Date.now();

    await ctx.db.patch(args.coverLetterId, {
      content: COVER_LETTER_GENERATION_PLACEHOLDER,
      generationStatus: "pending",
      generationError: null,
      generationAttempts: nextAttempt,
      lastGenerationAttemptAt: now,
      updatedAt: now,
    });

    console.info("[convex.coverLetters.retryGeneration] queued", {
      coverLetterId: args.coverLetterId,
      userProfileId: userProfile._id,
      generationAttempts: nextAttempt,
    });

    await ctx.scheduler.runAfter(0, api.ai.generateCoverLetter, {
      coverLetterId: args.coverLetterId,
      resumeText: resume.extractedText || "",
      jobDescription: normalizedCoverLetter.jobDescription || "",
      company: normalizedCoverLetter.company || "",
      jobTitle: normalizedCoverLetter.jobTitle || "",
      candidateName: userProfile.name,
      preferences: normalizedCoverLetter.preferences,
    });

    const updatedCoverLetter = await ctx.db.get(args.coverLetterId) as RetryableCoverLetterDoc | null;
    if (!updatedCoverLetter) {
      throw new ConvexError("Failed to queue retry");
    }

    return {
      success: true,
      coverLetter: normalizeCoverLetter(updatedCoverLetter),
    };
  },
});

// Get all cover letters for the current user
export const getCoverLetters = query({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.object({
    coverLetters: v.array(v.object({
      _id: v.id("coverLetters"),
      userProfileId: v.id("userProfiles"),
      extractedJobId: v.optional(v.id("extractedJobs")),
      resumeId: v.id("resumes"),
      jobTitle: v.optional(v.string()),
      company: v.optional(v.string()),
      jobDescription: v.optional(v.string()),
      content: v.string(),
      generationStatus: v.union(
        v.literal("pending"),
        v.literal("completed"),
        v.literal("failed")
      ),
      generationError: v.optional(v.union(v.string(), v.null())),
      generationAttempts: v.number(),
      lastGenerationAttemptAt: v.optional(v.number()),
      tokensUsed: v.optional(v.number()),
      creditsUsed: v.number(),
      preferences: v.optional(v.any()),
      createdAt: v.optional(v.number()),
      updatedAt: v.optional(v.number()),
      _creationTime: v.number(),
    })),
    hasMore: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const userProfile = await getCurrentUserProfile(ctx);
    const limit = Math.min(args.limit || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
    
    const coverLetters = await ctx.db
      .query("coverLetters")
      .withIndex("by_user_date", (q) => q.eq("userProfileId", userProfile._id))
      .order("desc")
      .take(limit + 1);

    const hasMore = coverLetters.length > limit;
    const results = (hasMore ? coverLetters.slice(0, limit) : coverLetters)
      .map((coverLetter) => normalizeCoverLetter(coverLetter as RetryableCoverLetterDoc));

    return {
      coverLetters: results,
      hasMore,
    };
  },
});

// Get a specific cover letter
export const getCoverLetter = query({
  args: {
    coverLetterId: v.id("coverLetters"),
  },
  returns: v.union(
    coverLetterReturnValidator,
    v.null()
  ),
  handler: async (ctx, args) => {
    const userProfile = await getCurrentUserProfile(ctx);
    
    const coverLetter = await ctx.db.get(args.coverLetterId) as RetryableCoverLetterDoc | null;
    if (!coverLetter || coverLetter.userProfileId !== userProfile._id) {
      return null;
    }
    
    return normalizeCoverLetter(coverLetter);
  },
});

// Delete a cover letter
export const deleteCoverLetter = mutation({
  args: {
    coverLetterId: v.id("coverLetters"),
  },
  returns: v.object({
    success: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const userProfile = await getCurrentUserProfile(ctx);
    
    const coverLetter = await ctx.db.get(args.coverLetterId);
    if (!coverLetter || coverLetter.userProfileId !== userProfile._id) {
      throw new ConvexError("Cover letter not found or access denied");
    }
    
    await ctx.db.delete(args.coverLetterId);
    
    return { success: true };
  },
});

// Get cover letter statistics
export const getCoverLetterStats = query({
  args: {},
  returns: v.object({
    total: v.number(),
    thisMonth: v.number(),
    totalCreditsSpent: v.number(),
  }),
  handler: async (ctx) => {
    const userProfile = await getCurrentUserProfile(ctx);
    
    const allCoverLetters = await ctx.db
      .query("coverLetters")
      .withIndex("by_user", (q) => q.eq("userProfileId", userProfile._id))
      .collect();
    
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const thisMonth = allCoverLetters.filter(
      cl => cl._creationTime >= startOfMonth.getTime()
    ).length;
    
    const totalCreditsSpent = allCoverLetters.reduce(
      (sum, cl) => sum + cl.creditsUsed, 0
    );
    
    return {
      total: allCoverLetters.length,
      thisMonth,
      totalCreditsSpent,
    };
  },
});
