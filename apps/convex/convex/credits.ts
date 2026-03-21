// convex/credits.ts
import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { getCurrentUserProfile } from "./userHelpers";
import { CREDITS, CREDIT_TRANSACTION_TYPES, PAGINATION, AI_LIMITS } from "./constants";

// Credit costs constants
export const CREDIT_COSTS = {
  COVER_LETTER_GENERATION: 3,
  JOB_EXTRACTION: 1,
  RESUME_ANALYSIS: 2,
  RESUME_UPLOAD: 1,
} as const;

// Check if user has sufficient credits
export const checkCredits = query({
  args: {
    requiredCredits: v.number(),
  },
  handler: async (ctx, { requiredCredits }) => {
    if (requiredCredits <= 0) {
      throw new ConvexError("Required credits must be positive");
    }

    const userProfile = await getCurrentUserProfile(ctx);

    const currentCredits = userProfile.credits || 0;
    return {
      hasCredits: currentCredits >= requiredCredits,
      currentCredits,
      requiredCredits,
      shortfall: Math.max(0, requiredCredits - currentCredits),
    };
  },
});

// Get user's current credit balance
export const getUserCredits = query({
  args: {},
  handler: async (ctx) => {
    const userProfile = await getCurrentUserProfile(ctx);

    return {
      credits: userProfile.credits || 0,
      plan: userProfile.plan,
      stripeCustomerId: userProfile.stripeCustomerId,
      subscriptionStatus: userProfile.subscriptionStatus,
    };
  },
});

// Add credits to user account (internal function)
export const addCredits = mutation({
  args: {
    amount: v.number(),
    source: v.string(),
    sourceId: v.optional(v.string()),
    description: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { amount, source, sourceId, description, metadata } = args;

    // Validate input
    if (amount <= 0) {
      throw new ConvexError("Credit amount must be positive");
    }

    if (!source || source.length < 1) {
      throw new ConvexError("Source is required");
    }

    const userProfile = await getCurrentUserProfile(ctx);

    const currentCredits = userProfile.credits || 0;
    const newBalance = currentCredits + amount;

    // Update user credits
    await ctx.db.patch(userProfile._id, {
      credits: newBalance,
      updatedAt: Date.now(),
    });

    // Log transaction
    await ctx.db.insert("creditTransactions", {
      userProfileId: userProfile._id,
      type: CREDIT_TRANSACTION_TYPES.EARNED,
      amount,
      balance: newBalance,
      source,
      sourceId,
      description,
      metadata,
      createdAt: Date.now(),
    });

    return {
      previousBalance: currentCredits,
      creditsAdded: amount,
      newBalance,
    };
  },
});

// Deduct credits from user account (internal function)
export const deductCredits = mutation({
  args: {
    amount: v.number(),
    source: v.string(),
    sourceId: v.optional(v.string()),
    description: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { amount, source, sourceId, description, metadata } = args;

    // Validate input
    if (amount <= 0) {
      throw new ConvexError("Credit amount must be positive");
    }

    if (!source || source.length < 1) {
      throw new ConvexError("Source is required");
    }

    const userProfile = await getCurrentUserProfile(ctx);

    const currentCredits = userProfile.credits || 0;
    if (currentCredits < amount) {
      throw new ConvexError("Insufficient credits");
    }

    const newBalance = currentCredits - amount;

    // Update user credits
    await ctx.db.patch(userProfile._id, {
      credits: newBalance,
      updatedAt: Date.now(),
    });

    // Log transaction
    await ctx.db.insert("creditTransactions", {
      userProfileId: userProfile._id,
      type: CREDIT_TRANSACTION_TYPES.SPENT,
      amount,
      balance: newBalance,
      source,
      sourceId,
      description,
      metadata,
      createdAt: Date.now(),
    });

    return {
      previousBalance: currentCredits,
      creditsDeducted: amount,
      newBalance,
    };
  },
});

// Get user's credit transaction history
export const getCreditHistory = query({
  args: {
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
    type: v.optional(v.union(
      v.literal("earned"),
      v.literal("spent"),
      v.literal("refunded"),
      v.literal("expired")
    )),
  },
  handler: async (ctx, args) => {
    const { page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT, type } = args;

    // Get authenticated user profile
    const userProfile = await getCurrentUserProfile(ctx);

    const validLimit = Math.min(Math.max(limit, PAGINATION.MIN_LIMIT), PAGINATION.MAX_LIMIT);

    let query = ctx.db
      .query("creditTransactions")
      .filter((q) => q.eq(q.field("userProfileId"), userProfile._id));

    if (type) {
      query = query.filter((q) => q.eq(q.field("type"), type));
    }

    const transactions = await query
      .order("desc")
      .paginate({
        cursor: null,
        numItems: validLimit,
      });

    return {
      transactions: transactions.page,
      pagination: {
        page,
        limit: validLimit,
        hasMore: transactions.isDone === false,
        cursor: transactions.continueCursor,
      },
    };
  },
});

// Get credit statistics for user
export const getCreditStats = query({
  args: {},
  handler: async (ctx) => {
    const userProfile = await getCurrentUserProfile(ctx);

    // Get all credit transactions
    const allTransactions = await ctx.db
      .query("creditTransactions")
      .filter((q) => q.eq(q.field("userProfileId"), userProfile._id))
      .collect();

    // Calculate totals
    const totalEarned = allTransactions
      .filter(t => t.type === CREDIT_TRANSACTION_TYPES.EARNED)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalSpent = allTransactions
      .filter(t => t.type === CREDIT_TRANSACTION_TYPES.SPENT)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalRefunded = allTransactions
      .filter(t => t.type === CREDIT_TRANSACTION_TYPES.REFUNDED)
      .reduce((sum, t) => sum + t.amount, 0);

    // Get this month's transactions
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const thisMonthTransactions = allTransactions.filter(t => 
      t.createdAt >= startOfMonth.getTime()
    );

    const thisMonthSpent = thisMonthTransactions
      .filter(t => t.type === CREDIT_TRANSACTION_TYPES.SPENT)
      .reduce((sum, t) => sum + t.amount, 0);

    const thisMonthEarned = thisMonthTransactions
      .filter(t => t.type === CREDIT_TRANSACTION_TYPES.EARNED)
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      currentBalance: userProfile.credits || 0,
      totalEarned,
      totalSpent,
      totalRefunded,
      thisMonthSpent,
      thisMonthEarned,
      lifetimeNet: totalEarned - totalSpent + totalRefunded,
      transactionCount: allTransactions.length,
    };
  },
});

// Check subscription limits and credit usage
export const checkSubscriptionLimits = query({
  args: {},
  handler: async (ctx) => {
    const userProfile = await getCurrentUserProfile(ctx);

    // Get plan limits from constants
    const currentPlanLimit = AI_LIMITS[userProfile.plan as keyof typeof AI_LIMITS] || AI_LIMITS.none;

    // Check if user has active subscription
    const hasActiveSubscription = userProfile.subscriptionStatus === "active";

    // Get this month's usage
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const thisMonthTransactions = await ctx.db
      .query("creditTransactions")
      .withIndex("by_user_date", (q) => q.eq("userProfileId", userProfile._id))
      .filter((q) => q.gte(q.field("createdAt"), startOfMonth.getTime()))
      .collect();

    const monthlyCreditsUsed = thisMonthTransactions
      .filter(t => t.type === CREDIT_TRANSACTION_TYPES.SPENT)
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      hasActiveSubscription,
      currentPlan: userProfile.plan,
      planLimit: currentPlanLimit,
      currentCredits: userProfile.credits || 0,
      monthlyCreditsUsed,
      canUseCredits: hasActiveSubscription || (userProfile.credits || 0) > 0,
      subscriptionStatus: userProfile.subscriptionStatus,
    };
  },
});

// Get API usage statistics
export const getApiUsageStats = query({
  args: {
    days: v.optional(v.number()),
  },
  handler: async (ctx, { days = 30 }) => {
    const userProfile = await getCurrentUserProfile(ctx);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const apiUsageEntries = await ctx.db
      .query("apiUsage")
      .withIndex("by_user_date", (q) => q.eq("userProfileId", userProfile._id))
      .filter((q) => q.gte(q.field("createdAt"), startDate.getTime()))
      .collect();

    // Group by endpoint
    const endpointStats = apiUsageEntries.reduce((acc, entry) => {
      const endpoint = entry.endpoint;
      if (!acc[endpoint]) {
        acc[endpoint] = {
          totalRequests: 0,
          totalCredits: 0,
          successfulRequests: 0,
          failedRequests: 0,
          averageResponseTime: 0,
        };
      }

      acc[endpoint].totalRequests++;
      acc[endpoint].totalCredits += entry.creditsUsed || 0;
      
      if (entry.success) {
        acc[endpoint].successfulRequests++;
      } else {
        acc[endpoint].failedRequests++;
      }

      return acc;
    }, {} as Record<string, any>);

    // Calculate daily breakdown
    const dailyUsage = getDailyUsageBreakdown(apiUsageEntries, days);

    // Total usage
    const totalRequests = apiUsageEntries.length;
    const totalCredits = apiUsageEntries.reduce((sum, entry) => sum + (entry.creditsUsed || 0), 0);
    const successRate = totalRequests > 0 ? 
      (apiUsageEntries.filter(e => e.success).length / totalRequests) * 100 : 0;

    return {
      totalRequests,
      totalCredits,
      successRate,
      endpointStats,
      dailyUsage,
      periodDays: days,
    };
  },
});

// Helper function to get daily usage breakdown
export function getDailyUsageBreakdown(entries: any[], days: number) {
  const dailyData: Record<string, { requests: number; credits: number }> = {};
  
  // Initialize all days in range
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateKey = date.toISOString().split('T')[0];
    dailyData[dateKey] = { requests: 0, credits: 0 };
  }

  // Aggregate data by day
  entries.forEach(entry => {
    const date = new Date(entry.createdAt).toISOString().split('T')[0];
    if (dailyData[date]) {
      dailyData[date].requests++;
      dailyData[date].credits += entry.creditsUsed || 0;
    }
  });

  return Object.entries(dailyData)
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
