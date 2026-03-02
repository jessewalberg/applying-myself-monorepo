import { QueryCtx, MutationCtx } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { Id, Doc } from "./_generated/dataModel";
import { query, mutation } from "./_generated/server";
import { CREDITS, AI_LIMITS } from "./constants";
import { getAuthUserId } from "@convex-dev/auth/server";

// Helper to get current authenticated user from Convex Auth
export async function getCurrentAuthUser(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new ConvexError("Not authenticated");
  }
  
  const authUser = await ctx.db.get(userId);
  if (!authUser) {
    throw new ConvexError("User not found in auth system");
  }
  
  return authUser;
}

// Helper to get user profile by auth user ID
export async function getUserProfileByAuthId(ctx: QueryCtx | MutationCtx, authUserId: Id<"users">): Promise<Doc<"userProfiles"> | null> {
  return await ctx.db
    .query("userProfiles")
    .withIndex("by_user_id", (q) => q.eq("userId", authUserId))
    .unique();
}

// Get current user's profile (combining auth check + profile lookup)
export async function getCurrentUserProfile(ctx: QueryCtx | MutationCtx): Promise<Doc<"userProfiles">> {
  const authUser = await getCurrentAuthUser(ctx);
  
  const userProfile = await getUserProfileByAuthId(ctx, authUser._id);
  if (!userProfile) {
    throw new ConvexError("User profile not found. Please complete registration.");
  }
  
  return userProfile;
}

// Create a new user profile
export const createUserProfile = mutation({
  args: {
    email: v.string(),
    name: v.string(),
  },
  returns: v.object({
    userProfileId: v.id("userProfiles"),
  }),
  handler: async (ctx, { email, name }) => {
    const authUser = await getCurrentAuthUser(ctx);
    
    // Check if profile already exists
    const existingProfile = await getUserProfileByAuthId(ctx, authUser._id);
    if (existingProfile) {
      return { userProfileId: existingProfile._id };
    }
    
    // Create new user profile
    const now = Date.now();
    const userProfileId = await ctx.db.insert("userProfiles", {
      userId: authUser._id,
      email: email.toLowerCase().trim(),
      name: name.trim(),
      plan: "free",
      credits: CREDITS.FREE_SIGNUP_BONUS,
      createdAt: now,
      updatedAt: now,
    });

    // Give welcome bonus credits
    await ctx.db.insert("creditTransactions", {
      userProfileId,
      type: "earned",
      amount: CREDITS.FREE_SIGNUP_BONUS,
      balance: CREDITS.FREE_SIGNUP_BONUS,
      source: "registration",
      description: "Welcome bonus credits",
      createdAt: now,
    });
    
    return { userProfileId };
  },
});

// Ensure user profile exists (for migration/auth compatibility)
export const ensureUserProfile = mutation({
  args: {},
  returns: v.object({
    userProfileId: v.id("userProfiles"),
  }),
  handler: async (ctx) => {
    const authUser = await getCurrentAuthUser(ctx);
    
    // Check if profile already exists
    const existingProfile = await getUserProfileByAuthId(ctx, authUser._id);
    if (existingProfile) {
      return { userProfileId: existingProfile._id };
    }
    
    // Create profile with default values
    const now = Date.now();
    const userProfileId = await ctx.db.insert("userProfiles", {
      userId: authUser._id,
      email: authUser.email || "",
      name: authUser.name || "User",
      plan: "free",
      credits: CREDITS.FREE_SIGNUP_BONUS,
      createdAt: now,
      updatedAt: now,
    });

    // Give welcome bonus credits
    await ctx.db.insert("creditTransactions", {
      userProfileId,
      type: "earned",
      amount: CREDITS.FREE_SIGNUP_BONUS,
      balance: CREDITS.FREE_SIGNUP_BONUS,
      source: "registration",
      description: "Welcome bonus credits",
      createdAt: now,
    });
    
    return { userProfileId };
  },
});

// Get user profile (public query)
export const getUserProfile = query({
  args: {},
  returns: v.object({
    _id: v.id("userProfiles"),
    email: v.string(),
    name: v.string(),
    plan: v.union(v.literal("free"), v.literal("starter"), v.literal("pro"), v.literal("enterprise")),
    credits: v.number(),
    stripeCustomerId: v.optional(v.string()),
    subscriptionStatus: v.optional(v.union(
      v.literal("active"), 
      v.literal("canceled"), 
      v.literal("incomplete"), 
      v.literal("incomplete_expired"), 
      v.literal("past_due"), 
      v.literal("trialing"), 
      v.literal("unpaid")
    )),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
  handler: async (ctx) => {
    const userProfile = await getCurrentUserProfile(ctx);
    
    return {
      _id: userProfile._id,
      email: userProfile.email,
      name: userProfile.name,
      plan: userProfile.plan,
      credits: userProfile.credits || 0,
      stripeCustomerId: userProfile.stripeCustomerId,
      subscriptionStatus: userProfile.subscriptionStatus,
      createdAt: userProfile.createdAt,
      updatedAt: userProfile.updatedAt
    };
  },
});

// Helper to get user profile by ID
export async function getUserProfileById(ctx: QueryCtx, userProfileId: Id<"userProfiles">): Promise<Doc<"userProfiles"> | null> {
  return await ctx.db.get(userProfileId);
}

// Helper to get user profile by email
export async function getUserProfileByEmail(ctx: QueryCtx, email: string): Promise<Doc<"userProfiles"> | null> {
  return await ctx.db
    .query("userProfiles")
    .withIndex("by_email", (q) => q.eq("email", email))
    .unique();
}

// Get user's subscription limits
export async function getUserLimits(ctx: QueryCtx): Promise<any> {
  const userProfile = await getCurrentUserProfile(ctx);
  
  const planLimits = AI_LIMITS[userProfile.plan];
  const hasActiveSubscription = userProfile.subscriptionStatus === "active";
  
  return {
    hasActiveSubscription,
    planLimits,
    usage: {
      credits: userProfile.credits || 0,
    },
  };
}

// Update user profile
export const updateUserProfile = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    billingAddress: v.optional(v.object({
      line1: v.string(),
      line2: v.optional(v.string()),
      city: v.string(),
      state: v.string(),
      postalCode: v.string(),
      country: v.string(),
    })),
  },
  returns: v.object({
    success: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const userProfile = await getCurrentUserProfile(ctx);

    const updates: Partial<Doc<"userProfiles">> = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) {
      if (!args.name || args.name.trim().length < 2) {
        throw new ConvexError("Name must be at least 2 characters");
      }
      updates.name = args.name.trim();
    }

    if (args.email !== undefined) {
      if (!args.email || !args.email.includes('@')) {
        throw new ConvexError("Valid email is required");
      }
      
      const email = args.email.toLowerCase().trim();
      
      // Check if email is already taken by another user
      const existingProfile = await ctx.db
        .query("userProfiles")
        .withIndex("by_email", (q) => q.eq("email", email))
        .unique();
      
      if (existingProfile && existingProfile._id !== userProfile._id) {
        throw new ConvexError("Email is already taken");
      }
      
      updates.email = email;
    }

    if (args.billingAddress !== undefined) {
      updates.billingAddress = args.billingAddress;
    }

    await ctx.db.patch(userProfile._id, updates);

    return { success: true };
  },
}); 