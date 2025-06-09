import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { getCurrentUserProfile } from "./userHelpers";
import { PAGINATION } from "./constants";

// Get user dashboard data
export const getDashboard = query({
  args: {},
  handler: async (ctx) => {
    const userProfile = await getCurrentUserProfile(ctx);

    // Get recent activity counts
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Get recent cover letters
    const recentCoverLetters = await ctx.db
      .query("coverLetters")
      .withIndex("by_user_date", (q) => q.eq("userProfileId", userProfile._id))
      .order("desc")
      .take(5);

    // Get recent job extractions
    const recentJobs = await ctx.db
      .query("extractedJobs")
      .withIndex("by_user_date", (q) => q.eq("userProfileId", userProfile._id))
      .order("desc")
      .take(5);

    // Get recent resumes
    const recentResumes = await ctx.db
      .query("resumes")
      .withIndex("by_user", (q) => q.eq("userProfileId", userProfile._id))
      .order("desc")
      .take(3);

    // Get this month's usage
    const thisMonthTransactions = await ctx.db
      .query("creditTransactions")
      .filter((q) => q.eq(q.field("userProfileId"), userProfile._id))
      .filter((q) => q.gte(q.field("createdAt"), startOfMonth.getTime()))
      .collect();

    const thisMonthCreditsUsed = thisMonthTransactions
      .filter(t => t.type === "spent")
      .reduce((sum, t) => sum + t.amount, 0);

    const thisMonthCreditsEarned = thisMonthTransactions
      .filter(t => t.type === "earned")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      user: {
        _id: userProfile._id,
        name: userProfile.name,
        email: userProfile.email,
        plan: userProfile.plan,
        credits: userProfile.credits || 0,
        subscriptionStatus: userProfile.subscriptionStatus,
        createdAt: userProfile.createdAt,
      },
      activity: {
        recentCoverLetters: recentCoverLetters.map(cl => ({
          id: cl._id,
          company: cl.company || 'Unknown',
          jobTitle: cl.jobTitle || 'Unknown Position',
          createdAt: cl.createdAt,
        })),
        recentJobs: recentJobs.map(job => ({
          id: job._id,
          title: job.title || 'Unknown Position',
          company: job.company || 'Unknown',
          confidence: job.confidence || 0,
          extractedAt: job.extractedAt,
        })),
        recentResumes: recentResumes.map(resume => ({
          id: resume._id,
          filename: resume.filename,
          mimeType: resume.mimeType,
          createdAt: resume.createdAt,
          hasExtractedText: !!(resume.extractedText && resume.extractedText.length > 0),
        })),
      },
      usage: {
        thisMonthCreditsUsed,
        thisMonthCreditsEarned,
        currentCredits: userProfile.credits || 0,
      },
    };
  },
});

// Get user profile
export const getUserProfile = query({
  args: {},
  handler: async (ctx) => {
    const userProfile = await getCurrentUserProfile(ctx);
    
    return {
      _id: userProfile._id,
      name: userProfile.name,
      email: userProfile.email,
      plan: userProfile.plan,
      credits: userProfile.credits || 0,
      subscriptionStatus: userProfile.subscriptionStatus,
      stripeCustomerId: userProfile.stripeCustomerId,
      createdAt: userProfile.createdAt,
      updatedAt: userProfile.updatedAt,
    };
  },
});

// Update user profile
export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { name, email } = args;
    
    const userProfile = await getCurrentUserProfile(ctx);

    const updates: Partial<typeof userProfile> = {
      updatedAt: Date.now(),
    };

    if (name !== undefined) {
      if (!name || name.trim().length < 2) {
        throw new ConvexError("Name must be at least 2 characters");
      }
      updates.name = name.trim();
    }

    if (email !== undefined) {
      if (!email || !email.includes('@')) {
        throw new ConvexError("Valid email is required");
      }
      
      // Check if email is already taken by another user
      const existingProfile = await ctx.db
        .query("userProfiles")
        .withIndex("by_email", (q) => q.eq("email", email))
        .unique();
      
      if (existingProfile && existingProfile._id !== userProfile._id) {
        throw new ConvexError("Email is already taken");
      }
      
      updates.email = email.toLowerCase().trim();
    }

    await ctx.db.patch(userProfile._id, updates);

    return { success: true };
  },
});

// Get user stats
export const getUserStats = query({
  args: {},
  handler: async (ctx) => {
    const userProfile = await getCurrentUserProfile(ctx);

    // Get all user's data for stats
    const [coverLetters, jobs, resumes, transactions] = await Promise.all([
      ctx.db.query("coverLetters")
        .withIndex("by_user", (q) => q.eq("userProfileId", userProfile._id))
        .collect(),
      ctx.db.query("extractedJobs")
        .withIndex("by_user", (q) => q.eq("userProfileId", userProfile._id))
        .collect(),
      ctx.db.query("resumes")
        .withIndex("by_user", (q) => q.eq("userProfileId", userProfile._id))
        .collect(),
      ctx.db.query("creditTransactions")
        .withIndex("by_user", (q) => q.eq("userProfileId", userProfile._id))
        .collect(),
    ]);

    // Calculate stats
    const totalCreditsSpent = transactions
      .filter(t => t.type === "spent")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalCreditsEarned = transactions
      .filter(t => t.type === "earned")
      .reduce((sum, t) => sum + t.amount, 0);

    // Get this month's data
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const thisMonth = {
      coverLetters: coverLetters.filter(cl => cl.createdAt >= startOfMonth.getTime()).length,
      jobs: jobs.filter(job => job.extractedAt >= startOfMonth.getTime()).length,
      resumes: resumes.filter(resume => resume.createdAt >= startOfMonth.getTime()).length,
      creditsSpent: transactions
        .filter(t => t.type === "spent" && t.createdAt >= startOfMonth.getTime())
        .reduce((sum, t) => sum + t.amount, 0),
    };

    return {
      totals: {
        coverLetters: coverLetters.length,
        jobs: jobs.length,
        resumes: resumes.length,
        creditsSpent: totalCreditsSpent,
        creditsEarned: totalCreditsEarned,
      },
      thisMonth,
      accountAge: Math.floor((Date.now() - userProfile.createdAt) / (1000 * 60 * 60 * 24)), // days
      averageCreditsPerMonth: userProfile.createdAt ? 
        Math.round(totalCreditsSpent / Math.max(1, Math.ceil((Date.now() - userProfile.createdAt) / (1000 * 60 * 60 * 24 * 30)))) : 0,
    };
  },
});

// Delete user account
export const deleteAccount = mutation({
  args: {
    confirmation: v.string(),
  },
  handler: async (ctx, args) => {
    const { confirmation } = args;

    if (confirmation !== "DELETE MY ACCOUNT") {
      throw new ConvexError("Please type 'DELETE MY ACCOUNT' to confirm");
    }

    const userProfile = await getCurrentUserProfile(ctx);

    // Delete all user data
    const [coverLetters, jobs, resumes, transactions] = await Promise.all([
      ctx.db.query("coverLetters")
        .withIndex("by_user", (q) => q.eq("userProfileId", userProfile._id))
        .collect(),
      ctx.db.query("extractedJobs")
        .withIndex("by_user", (q) => q.eq("userProfileId", userProfile._id))
        .collect(),
      ctx.db.query("resumes")
        .withIndex("by_user", (q) => q.eq("userProfileId", userProfile._id))
        .collect(),
      ctx.db.query("creditTransactions")
        .withIndex("by_user", (q) => q.eq("userProfileId", userProfile._id))
        .collect(),
    ]);

    // Delete all records
    await Promise.all([
      ...coverLetters.map(cl => ctx.db.delete(cl._id)),
      ...jobs.map(job => ctx.db.delete(job._id)),
      ...resumes.map(resume => {
        // Delete file from storage
        ctx.storage.delete(resume.fileId).catch(console.error);
        return ctx.db.delete(resume._id);
      }),
      ...transactions.map(t => ctx.db.delete(t._id)),
    ]);

    // Delete user profile
    await ctx.db.delete(userProfile._id);

    return { message: "Account deleted successfully" };
  },
});
