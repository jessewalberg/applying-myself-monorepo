import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { getCurrentUserProfile } from "./userHelpers";
import { PAGINATION } from "./constants";

const statusValidator = v.union(
  v.literal("applied"),
  v.literal("interviewing"),
  v.literal("offered"),
  v.literal("rejected"),
  v.literal("withdrawn")
);

const jobTypeValidator = v.union(
  v.literal("full-time"),
  v.literal("part-time"),
  v.literal("contract"),
  v.literal("internship"),
  v.literal("freelance")
);

export const getJobApplications = query({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.object({
    jobApplications: v.array(v.object({
      _id: v.id("jobApplications"),
      _creationTime: v.number(),
      userProfileId: v.id("userProfiles"),
      jobTitle: v.string(),
      companyName: v.string(),
      location: v.optional(v.string()),
      salary: v.optional(v.string()),
      status: v.optional(statusValidator),
      appliedDate: v.optional(v.number()),
      notes: v.optional(v.string()),
      jobUrl: v.optional(v.string()),
      jobType: v.optional(jobTypeValidator),
      resumeId: v.optional(v.id("resumes")),
      coverLetterId: v.optional(v.id("coverLetters")),
      extractedJobId: v.optional(v.id("extractedJobs")),
      createdAt: v.number(),
      updatedAt: v.number(),
    })),
    hasMore: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const userProfile = await getCurrentUserProfile(ctx);
    const limit = Math.min(args.limit ?? PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);

    const records = await ctx.db
      .query("jobApplications")
      .withIndex("by_user_date", (q) => q.eq("userProfileId", userProfile._id))
      .order("desc")
      .take(limit + 1);

    const hasMore = records.length > limit;
    return {
      jobApplications: hasMore ? records.slice(0, limit) : records,
      hasMore,
    };
  },
});

export const getJobApplication = query({
  args: {
    jobApplicationId: v.id("jobApplications"),
  },
  returns: v.union(
    v.object({
      _id: v.id("jobApplications"),
      _creationTime: v.number(),
      userProfileId: v.id("userProfiles"),
      jobTitle: v.string(),
      companyName: v.string(),
      location: v.optional(v.string()),
      salary: v.optional(v.string()),
      status: v.optional(statusValidator),
      appliedDate: v.optional(v.number()),
      notes: v.optional(v.string()),
      jobUrl: v.optional(v.string()),
      jobType: v.optional(jobTypeValidator),
      resumeId: v.optional(v.id("resumes")),
      coverLetterId: v.optional(v.id("coverLetters")),
      extractedJobId: v.optional(v.id("extractedJobs")),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const userProfile = await getCurrentUserProfile(ctx);
    const record = await ctx.db.get(args.jobApplicationId);
    if (!record || record.userProfileId !== userProfile._id) {
      return null;
    }
    return record;
  },
});

export const create = mutation({
  args: {
    jobTitle: v.string(),
    companyName: v.string(),
    jobUrl: v.optional(v.string()),
    location: v.optional(v.string()),
    salary: v.optional(v.string()),
    status: v.optional(statusValidator),
    appliedDate: v.optional(v.number()),
    notes: v.optional(v.string()),
    jobType: v.optional(jobTypeValidator),
    resumeId: v.optional(v.id("resumes")),
    coverLetterId: v.optional(v.id("coverLetters")),
  },
  returns: v.object({
    success: v.boolean(),
    jobApplicationId: v.id("jobApplications"),
  }),
  handler: async (ctx, args) => {
    const userProfile = await getCurrentUserProfile(ctx);

    if (!args.jobTitle.trim() || !args.companyName.trim()) {
      throw new ConvexError("Job title and company name are required");
    }

    const now = Date.now();
    const jobApplicationId = await ctx.db.insert("jobApplications", {
      userProfileId: userProfile._id,
      jobTitle: args.jobTitle.trim(),
      companyName: args.companyName.trim(),
      jobUrl: args.jobUrl,
      location: args.location,
      salary: args.salary,
      status: args.status ?? "applied",
      appliedDate: args.appliedDate,
      notes: args.notes,
      jobType: args.jobType,
      resumeId: args.resumeId,
      coverLetterId: args.coverLetterId,
      createdAt: now,
      updatedAt: now,
    });

    return {
      success: true,
      jobApplicationId,
    };
  },
});

export const createFromExtractedJob = mutation({
  args: {
    extractedJobId: v.id("extractedJobs"),
    status: v.optional(statusValidator),
    appliedDate: v.optional(v.number()),
    notes: v.optional(v.string()),
    resumeId: v.optional(v.id("resumes")),
    coverLetterId: v.optional(v.id("coverLetters")),
  },
  returns: v.object({
    success: v.boolean(),
    jobApplicationId: v.id("jobApplications"),
  }),
  handler: async (ctx, args) => {
    const userProfile = await getCurrentUserProfile(ctx);
    const extracted = await ctx.db.get(args.extractedJobId);

    if (!extracted || extracted.userProfileId !== userProfile._id) {
      throw new ConvexError("Extracted job not found or access denied");
    }

    const now = Date.now();
    const jobApplicationId = await ctx.db.insert("jobApplications", {
      userProfileId: userProfile._id,
      jobTitle: extracted.title || "Job Position",
      companyName: extracted.company || "Unknown Company",
      location: extracted.location,
      salary: extracted.salary,
      status: args.status ?? "applied",
      appliedDate: args.appliedDate ?? now,
      notes: args.notes,
      jobUrl: extracted.url,
      jobType: (extracted.jobType as any) || undefined,
      resumeId: args.resumeId,
      coverLetterId: args.coverLetterId,
      extractedJobId: extracted._id,
      createdAt: now,
      updatedAt: now,
    });

    return {
      success: true,
      jobApplicationId,
    };
  },
});

export const update = mutation({
  args: {
    jobApplicationId: v.id("jobApplications"),
    jobTitle: v.optional(v.string()),
    companyName: v.optional(v.string()),
    location: v.optional(v.string()),
    salary: v.optional(v.string()),
    status: v.optional(statusValidator),
    appliedDate: v.optional(v.number()),
    notes: v.optional(v.string()),
    jobUrl: v.optional(v.string()),
    jobType: v.optional(jobTypeValidator),
    resumeId: v.optional(v.id("resumes")),
    coverLetterId: v.optional(v.id("coverLetters")),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const userProfile = await getCurrentUserProfile(ctx);
    const record = await ctx.db.get(args.jobApplicationId);

    if (!record || record.userProfileId !== userProfile._id) {
      throw new ConvexError("Job application not found or access denied");
    }

    const updates: any = { updatedAt: Date.now() };
    if (args.jobTitle !== undefined) updates.jobTitle = args.jobTitle.trim();
    if (args.companyName !== undefined) updates.companyName = args.companyName.trim();
    if (args.location !== undefined) updates.location = args.location;
    if (args.salary !== undefined) updates.salary = args.salary;
    if (args.status !== undefined) updates.status = args.status;
    if (args.appliedDate !== undefined) updates.appliedDate = args.appliedDate;
    if (args.notes !== undefined) updates.notes = args.notes;
    if (args.jobUrl !== undefined) updates.jobUrl = args.jobUrl;
    if (args.jobType !== undefined) updates.jobType = args.jobType;
    if (args.resumeId !== undefined) updates.resumeId = args.resumeId;
    if (args.coverLetterId !== undefined) updates.coverLetterId = args.coverLetterId;

    await ctx.db.patch(args.jobApplicationId, updates);
    return { success: true };
  },
});

export const updateStatus = mutation({
  args: {
    jobApplicationId: v.id("jobApplications"),
    status: statusValidator,
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const userProfile = await getCurrentUserProfile(ctx);
    const record = await ctx.db.get(args.jobApplicationId);
    if (!record || record.userProfileId !== userProfile._id) {
      throw new ConvexError("Job application not found or access denied");
    }

    await ctx.db.patch(args.jobApplicationId, {
      status: args.status,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const deleteJobApplication = mutation({
  args: {
    jobApplicationId: v.id("jobApplications"),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const userProfile = await getCurrentUserProfile(ctx);
    const record = await ctx.db.get(args.jobApplicationId);
    if (!record || record.userProfileId !== userProfile._id) {
      throw new ConvexError("Job application not found or access denied");
    }

    await ctx.db.delete(args.jobApplicationId);
    return { success: true };
  },
});
