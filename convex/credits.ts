import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth.config";

export const getCreditStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return null;
    }

    const credits = await ctx.db
      .query("credits")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    let totalEarned = 0;
    let totalUsed = 0;
    let thisMonthEarned = 0;
    let thisMonthUsed = 0;

    credits.forEach((credit) => {
      if (credit.amount > 0) {
        totalEarned += credit.amount;
        if (credit.createdAt >= thisMonthStart) {
          thisMonthEarned += credit.amount;
        }
      } else {
        const used = Math.abs(credit.amount);
        totalUsed += used;
        if (credit.createdAt >= thisMonthStart) {
          thisMonthUsed += used;
        }
      }
    });

    const balance = totalEarned - totalUsed;

    return {
      balance,
      totalEarned,
      totalUsed,
      thisMonthEarned,
      thisMonthUsed,
      thisMonthBalance: thisMonthEarned - thisMonthUsed,
    };
  },
});

export const getCreditHistory = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return [];
    }

    const limit = args.limit || 50;

    const credits = await ctx.db
      .query("credits")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);

    return credits;
  },
});

export const addCredits = mutation({
  args: {
    amount: v.number(),
    reason: v.string(),
    type: v.union(
      v.literal("purchase"),
      v.literal("usage"),
      v.literal("refund"),
      v.literal("bonus")
    ),
    relatedId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("credits", {
      userId,
      amount: args.amount,
      type: args.type,
      reason: args.reason,
      relatedId: args.relatedId,
      createdAt: Date.now(),
    });
  },
});

export const useCredits = mutation({
  args: {
    amount: v.number(),
    reason: v.string(),
    relatedId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if user has enough credits
    const stats = await getCreditStats(ctx, {});
    if (!stats || stats.balance < args.amount) {
      throw new Error("Insufficient credits");
    }

    return await ctx.db.insert("credits", {
      userId,
      amount: -args.amount, // Negative for usage
      type: "usage",
      reason: args.reason,
      relatedId: args.relatedId,
      createdAt: Date.now(),
    });
  },
});

// Give new users 10 free credits
export const initializeUserCredits = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if user already has credits
    const existingCredits = await ctx.db
      .query("credits")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .first();

    if (!existingCredits) {
      await ctx.db.insert("credits", {
        userId,
        amount: 10,
        type: "bonus",
        reason: "Welcome bonus - 10 free credits",
        createdAt: Date.now(),
      });
    }
  },
}); 