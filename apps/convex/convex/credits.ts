// convex/credits.ts
import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { getCurrentUserProfile } from "./userHelpers";
import { CREDIT_TRANSACTION_TYPES, PAGINATION } from "./constants";
import {
  CREDIT_COSTS,
  addCreditsToBalance,
  calculateApiUsageStats,
  calculateCreditStats,
  deductCreditsFromBalance,
  getCreditAvailability,
  getSubscriptionLimitSnapshot,
} from "../lib/credits";

export { CREDIT_COSTS } from "../lib/credits";

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
    return getCreditAvailability(userProfile.credits || 0, requiredCredits);
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
    const balanceUpdate = addCreditsToBalance(userProfile.credits || 0, amount);

    // Update user credits
    await ctx.db.patch(userProfile._id, {
      credits: balanceUpdate.newBalance,
      updatedAt: Date.now(),
    });

    // Log transaction
    await ctx.db.insert("creditTransactions", {
      userProfileId: userProfile._id,
      type: CREDIT_TRANSACTION_TYPES.EARNED,
      amount,
      balance: balanceUpdate.newBalance,
      source,
      sourceId,
      description,
      metadata,
      createdAt: Date.now(),
    });

    return balanceUpdate;
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
    const creditAvailability = getCreditAvailability(
      userProfile.credits || 0,
      amount
    );
    if (!creditAvailability.hasCredits) {
      throw new ConvexError("Insufficient credits");
    }
    const balanceUpdate = deductCreditsFromBalance(
      creditAvailability.currentCredits,
      amount
    );

    // Update user credits
    await ctx.db.patch(userProfile._id, {
      credits: balanceUpdate.newBalance,
      updatedAt: Date.now(),
    });

    // Log transaction
    await ctx.db.insert("creditTransactions", {
      userProfileId: userProfile._id,
      type: CREDIT_TRANSACTION_TYPES.SPENT,
      amount,
      balance: balanceUpdate.newBalance,
      source,
      sourceId,
      description,
      metadata,
      createdAt: Date.now(),
    });

    return balanceUpdate;
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
    return calculateCreditStats(
      allTransactions,
      userProfile.credits || 0,
      Date.now()
    );
  },
});

// Check subscription limits and credit usage
export const checkSubscriptionLimits = query({
  args: {},
  handler: async (ctx) => {
    const userProfile = await getCurrentUserProfile(ctx);

    const thisMonthTransactions = await ctx.db
      .query("creditTransactions")
      .withIndex("by_user_date", (q) => q.eq("userProfileId", userProfile._id))
      .filter((q) => q.gte(q.field("createdAt"), 0))
      .collect();
    return getSubscriptionLimitSnapshot(
      userProfile,
      thisMonthTransactions,
      Date.now()
    );
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
    return calculateApiUsageStats(apiUsageEntries, days, Date.now());
  },
});
