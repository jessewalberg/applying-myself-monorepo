// convex/coverLetters.ts
import { mutation, query, action, ActionCtx } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { getCurrentUserProfile } from "./userHelpers";
import { api } from "./_generated/api";
import { CREDITS, PAGINATION, FILE_TYPES } from "./constants";
import type { Doc, Id } from "./_generated/dataModel";

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
    coverLetter: v.object({
      _id: v.id("coverLetters"),
      userProfileId: v.id("userProfiles"),
      extractedJobId: v.optional(v.id("extractedJobs")),
      resumeId: v.id("resumes"),
      jobTitle: v.optional(v.string()),
      company: v.optional(v.string()),
      content: v.string(),
      creditsUsed: v.number(),
      preferences: v.optional(v.any()),
      createdAt: v.number(),
      _creationTime: v.number(),
    }),
    tokensUsed: v.number(),
    remainingCredits: v.number(),
  }),
  handler: async (ctx, args): Promise<{
    coverLetter: Doc<"coverLetters">;
    tokensUsed: number;
    remainingCredits: number;
  }> => {
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
    const coverLetterId: Id<"coverLetters"> = await ctx.db.insert("coverLetters", {
      userProfileId: userProfile._id,
      resumeId,
      jobTitle: extractedContent.title || undefined,
      company: extractedContent.company || undefined,
      content: "Generating your personalized cover letter...",
      creditsUsed: creditsRequired,
      preferences: preferences || undefined,
      createdAt: Date.now(),
    });

    // Deduct credits
    const newBalance = currentCredits - creditsRequired;
    await ctx.db.patch(userProfile._id, {
      credits: newBalance,
      updatedAt: Date.now(),
    });

    // Log credit transaction
    await ctx.db.insert("creditTransactions", {
      userProfileId: userProfile._id,
      type: "spent",
      amount: creditsRequired,
      balance: newBalance,
      source: "generate-cover-letter",
      description: "Cover letter generation",
      createdAt: Date.now(),
    });

    // Schedule AI generation
    await ctx.scheduler.runAfter(0, api.ai.generateCoverLetter, {
      coverLetterId,
      resumeText: resume.extractedText || "",
      jobDescription: extractedContent.description || "",
      company: extractedContent.company || "",
      jobTitle: extractedContent.title || "",
      preferences,
    });

    const coverLetter: Doc<"coverLetters"> | null = await ctx.db.get(coverLetterId);
    if (!coverLetter) {
      throw new ConvexError("Failed to retrieve generated cover letter");
    }

    return {
      coverLetter,
      tokensUsed: 0, // Will be updated when AI generation completes
      remainingCredits: newBalance,
    };
  },
});

// Update cover letter content (called by AI action)
export const updateContent = mutation({
  args: {
    coverLetterId: v.id("coverLetters"),
    content: v.string(),
    tokensUsed: v.optional(v.number()),
  },
  returns: v.object({
    success: v.boolean(),
  }),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.coverLetterId, {
      content: args.content,
    });
    
    return { success: true };
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
      content: v.string(),
      creditsUsed: v.number(),
      preferences: v.optional(v.any()),
      createdAt: v.optional(v.number()),
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
    const results = hasMore ? coverLetters.slice(0, limit) : coverLetters;

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
    v.object({
      _id: v.id("coverLetters"),
      userProfileId: v.id("userProfiles"),
      extractedJobId: v.optional(v.id("extractedJobs")),
      resumeId: v.id("resumes"),
      jobTitle: v.optional(v.string()),
      company: v.optional(v.string()),
      content: v.string(),
      creditsUsed: v.number(),
      preferences: v.optional(v.any()),
      createdAt: v.optional(v.number()),
      _creationTime: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const userProfile = await getCurrentUserProfile(ctx);
    
    const coverLetter = await ctx.db.get(args.coverLetterId);
    if (!coverLetter || coverLetter.userProfileId !== userProfile._id) {
      return null;
    }
    
    return coverLetter;
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