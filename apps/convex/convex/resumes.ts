// convex/resumes.ts
import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { getCurrentUserProfile } from "./userHelpers";
// import { extractTextFromResume } from "./lib/ai";
import { CREDITS, AI_LIMITS, PAGINATION, FILE_TYPES } from "./constants";
import { api } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";

// Upload resume - step 1: generate upload URL
export const upload = mutation({
  args: {
    filename: v.string(),
    fileSize: v.number(),
    mimeType: v.string(),
  },
  returns: v.object({
    uploadUrl: v.string(),
  }),
  handler: async (ctx, args) => {
    const userProfile = await getCurrentUserProfile(ctx);
    
    // Check credits
    const creditsRequired = CREDITS.RESUME_UPLOAD;
    const currentCredits = userProfile.credits || 0;
    if (currentCredits < creditsRequired) {
      throw new ConvexError("Insufficient credits. Please upgrade your plan or purchase more credits.");
    }
    
    // Validate file
    if (!args.filename || args.filename.length < 1) {
      throw new ConvexError("Filename is required");
    }
    
    if (args.fileSize > 50 * 1024 * 1024) { // 50MB limit
      throw new ConvexError("File too large. Maximum size is 50MB");
    }
    
    const supportedTypes = [FILE_TYPES.PDF, FILE_TYPES.TEXT, FILE_TYPES.DOCUMENT];
    if (!supportedTypes.some(type => args.mimeType.includes(type))) {
      throw new ConvexError("Unsupported file type. Please upload PDF, DOC, DOCX, or TXT files");
    }
    
    // Just generate upload URL - no database record yet
    const uploadUrl = await ctx.storage.generateUploadUrl();

    return {
      uploadUrl,
    };
  },
});

// Complete resume upload - step 2: create resume record and extract text
export const completeUpload = mutation({
  args: {
    storageId: v.id("_storage"),
    filename: v.string(),
    fileSize: v.number(),
    mimeType: v.string(),
  },
  returns: v.object({
    resumeId: v.id("resumes"),
    remainingCredits: v.number(),
  }),
  handler: async (ctx, args) => {
    const userProfile = await getCurrentUserProfile(ctx);
    
    // Check credits again (in case something changed)
    const creditsRequired = CREDITS.RESUME_UPLOAD;
    const currentCredits = userProfile.credits || 0;
    if (currentCredits < creditsRequired) {
      throw new ConvexError("Insufficient credits. Please upgrade your plan or purchase more credits.");
    }

    const existingDefault = await ctx.db
      .query("resumes")
      .withIndex("by_user_default", (q) => q.eq("userProfileId", userProfile._id).eq("isDefault", true))
      .unique();

    // Create resume record with actual storage ID
    const resumeId: Id<"resumes"> = await ctx.db.insert("resumes", {
      userProfileId: userProfile._id,
      filename: args.filename,
      fileId: args.storageId,
      fileSize: args.fileSize,
      mimeType: args.mimeType,
      extractedText: undefined,
      isDefault: !existingDefault,
      createdAt: Date.now(),
      updatedAt: Date.now(),
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
      source: "resume-upload",
      description: "Resume upload",
      createdAt: Date.now(),
    });

    // Schedule text extraction
    await ctx.scheduler.runAfter(0, api.ai.extractTextFromResume, {
      resumeId: resumeId,
      fileId: args.storageId,
      mimeType: args.mimeType,
      fallbackName: userProfile.name,
    });

    return { 
      resumeId,
      remainingCredits: newBalance,
    };
  },
});

// Update resume with extracted text (called by AI action)
export const updateExtractedText = mutation({
  args: {
    resumeId: v.id("resumes"),
    extractedText: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
  }),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.resumeId, {
      extractedText: args.extractedText,
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});

// Get all resumes for the current user
export const getResumes = query({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.object({
    resumes: v.array(v.object({
      _id: v.id("resumes"),
      _creationTime: v.number(),
      userProfileId: v.id("userProfiles"),
      filename: v.string(),
      fileId: v.id("_storage"),
      fileSize: v.number(),
      mimeType: v.string(),
      extractedText: v.optional(v.string()),
      isDefault: v.optional(v.boolean()),
      createdAt: v.number(),
      updatedAt: v.number(),
    })),
    hasMore: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const userProfile = await getCurrentUserProfile(ctx);
    const limit = Math.min(args.limit || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
    
    const resumes = await ctx.db
      .query("resumes")
      .withIndex("by_user", (q) => q.eq("userProfileId", userProfile._id))
      .order("desc")
      .take(limit + 1);

    const hasMore = resumes.length > limit;
    const results = hasMore ? resumes.slice(0, limit) : resumes;

    return {
      resumes: results,
      hasMore,
    };
  },
});


// Get a specific resume
export const getResume = query({
  args: {
    resumeId: v.id("resumes"),
  },
  returns: v.union(
    v.object({
      _id: v.id("resumes"),
      _creationTime: v.number(),
      userProfileId: v.id("userProfiles"),
      filename: v.string(),
      fileId: v.id("_storage"),
      fileSize: v.number(),
      mimeType: v.string(),
      extractedText: v.optional(v.string()),
      isDefault: v.optional(v.boolean()),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const userProfile = await getCurrentUserProfile(ctx);
    
    const resume = await ctx.db.get(args.resumeId);
    if (!resume || resume.userProfileId !== userProfile._id) {
      return null;
    }
    
    return resume;
  },
});

// Get resume download URL
export const getDownloadUrl = query({
  args: {
    resumeId: v.id("resumes"),
  },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    const userProfile = await getCurrentUserProfile(ctx);
    
    const resume = await ctx.db.get(args.resumeId);
    if (!resume || resume.userProfileId !== userProfile._id) {
      return null;
    }
    
    return await ctx.storage.getUrl(resume.fileId);
  },
});

// Delete a resume
export const deleteResume = mutation({
  args: {
    resumeId: v.id("resumes"),
  },
  returns: v.object({
    success: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const userProfile = await getCurrentUserProfile(ctx);
    
    const resume = await ctx.db.get(args.resumeId);
    if (!resume || resume.userProfileId !== userProfile._id) {
      throw new ConvexError("Resume not found or access denied");
    }
    
    // Delete the file from storage
    await ctx.storage.delete(resume.fileId);
    
    // Delete the resume record
    await ctx.db.delete(args.resumeId);
    
    return { success: true };
  },
});

// Get resume statistics
export const getResumeStats = query({
  args: {},
  returns: v.object({
    total: v.number(),
    thisMonth: v.number(),
    totalCreditsSpent: v.number(),
  }),
  handler: async (ctx) => {
    const userProfile = await getCurrentUserProfile(ctx);
    
    const allResumes = await ctx.db
      .query("resumes")
      .withIndex("by_user", (q) => q.eq("userProfileId", userProfile._id))
      .collect();
    
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const thisMonth = allResumes.filter(
      resume => resume.createdAt >= startOfMonth.getTime()
    ).length;
    
    const totalCreditsSpent = allResumes.length * CREDITS.RESUME_UPLOAD;
    
    return {
      total: allResumes.length,
      thisMonth,
      totalCreditsSpent,
    };
  },
});

export const setDefault = mutation({
  args: {
    resumeId: v.id("resumes"),
  },
  returns: v.object({
    success: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const userProfile = await getCurrentUserProfile(ctx);

    const targetResume = await ctx.db.get(args.resumeId);
    if (!targetResume || targetResume.userProfileId !== userProfile._id) {
      throw new ConvexError("Resume not found or access denied");
    }

    const resumes = await ctx.db
      .query("resumes")
      .withIndex("by_user", (q) => q.eq("userProfileId", userProfile._id))
      .collect();

    for (const resume of resumes) {
      const shouldBeDefault = resume._id === args.resumeId;
      if ((resume.isDefault ?? false) !== shouldBeDefault) {
        await ctx.db.patch(resume._id, {
          isDefault: shouldBeDefault,
          updatedAt: Date.now(),
        });
      }
    }

    return { success: true };
  },
});

export const getDefaultResume = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("resumes"),
      _creationTime: v.number(),
      userProfileId: v.id("userProfiles"),
      filename: v.string(),
      fileId: v.id("_storage"),
      fileSize: v.number(),
      mimeType: v.string(),
      extractedText: v.optional(v.string()),
      isDefault: v.optional(v.boolean()),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx) => {
    const userProfile = await getCurrentUserProfile(ctx);
    const defaultResume = await ctx.db
      .query("resumes")
      .withIndex("by_user_default", (q) => q.eq("userProfileId", userProfile._id).eq("isDefault", true))
      .unique();

    if (defaultResume) return defaultResume;

    const fallback = await ctx.db
      .query("resumes")
      .withIndex("by_user", (q) => q.eq("userProfileId", userProfile._id))
      .order("desc")
      .first();

    return fallback ?? null;
  },
});
