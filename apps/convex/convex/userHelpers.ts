import { QueryCtx, MutationCtx, query, mutation } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { Id, Doc } from "./_generated/dataModel";
import { CREDITS, AI_LIMITS } from "./constants";

type CanonicalPlan = "none" | "starter" | "pro" | "hired";
type IdentityCtx = QueryCtx | MutationCtx;

const ACTIVE_SUBSCRIPTION_STATUSES = new Set(["active", "trialing"]);

function normalizePlan(plan: unknown): CanonicalPlan {
  if (plan === "starter" || plan === "pro" || plan === "hired" || plan === "none") {
    return plan;
  }
  return "none";
}

function planRank(plan: CanonicalPlan): number {
  if (plan === "hired") return 4;
  if (plan === "pro") return 3;
  if (plan === "starter") return 2;
  return 1;
}

function parsePlan(value: unknown): CanonicalPlan {
  if (typeof value !== "string") return "none";
  return normalizePlan(value);
}

function baselineCreditsForPlan(plan: CanonicalPlan): number {
  return AI_LIMITS[plan].monthlyCredits;
}

export interface CurrentIdentity {
  clerkUserId: string;
  tokenIdentifier: string;
  issuer: string;
  email?: string;
  name?: string;
}

export async function getCurrentIdentity(ctx: IdentityCtx): Promise<CurrentIdentity> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError("Not authenticated");
  }

  const clerkUserId = identity.subject || identity.tokenIdentifier;
  if (!clerkUserId) {
    throw new ConvexError("Missing Clerk identity");
  }

  return {
    clerkUserId,
    tokenIdentifier: identity.tokenIdentifier,
    issuer: identity.issuer,
    email: identity.email ?? undefined,
    name: identity.name ?? undefined,
  };
}

export async function getCurrentUserProfileByClerkId(
  ctx: IdentityCtx,
  clerkUserId: string
): Promise<Doc<"userProfiles"> | null> {
  return await ctx.db
    .query("userProfiles")
    .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", clerkUserId))
    .unique();
}

async function loadBillingArchiveCandidates(
  ctx: IdentityCtx,
  identity: CurrentIdentity
): Promise<Doc<"billingArchive">[]> {
  const candidates = new Map<string, Doc<"billingArchive">>();

  const byClerk = await ctx.db
    .query("billingArchive")
    .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", identity.clerkUserId))
    .collect();
  for (const record of byClerk) {
    candidates.set(record._id, record);
  }

  if (identity.email) {
    const normalizedEmail = identity.email.toLowerCase().trim();
    const byEmail = await ctx.db
      .query("billingArchive")
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
      .collect();
    for (const record of byEmail) {
      candidates.set(record._id, record);
    }
  }

  return [...candidates.values()];
}

async function resolveArchivedEntitlement(
  ctx: IdentityCtx,
  identity: CurrentIdentity
): Promise<{ plan: CanonicalPlan; creditsBaseline: number; source: string } | null> {
  const candidates = await loadBillingArchiveCandidates(ctx, identity);
  if (candidates.length === 0) return null;

  const hasActiveSubscription = candidates.some(
    (record) =>
      record.source === "subscriptions" &&
      typeof record.status === "string" &&
      ACTIVE_SUBSCRIPTION_STATUSES.has(record.status.toLowerCase())
  );

  if (!hasActiveSubscription) return null;

  let bestPlan: CanonicalPlan = "starter";
  for (const record of candidates) {
    const metadata = (record.metadata ?? {}) as Record<string, unknown>;
    const candidatePlan = parsePlan(metadata.plan ?? metadata.userPlan);
    if (planRank(candidatePlan) > planRank(bestPlan)) {
      bestPlan = candidatePlan;
    }
  }

  if (bestPlan === "none") {
    bestPlan = "starter";
  }

  return {
    plan: bestPlan,
    creditsBaseline: baselineCreditsForPlan(bestPlan),
    source: "billingArchive",
  };
}

async function applyArchivedEntitlementsToProfile(
  ctx: MutationCtx,
  userProfile: Doc<"userProfiles">,
  identity: CurrentIdentity
): Promise<{ applied: boolean; plan: CanonicalPlan; credits: number; reason?: string }> {
  if (userProfile.entitlementsClaimedAt) {
    return {
      applied: false,
      plan: normalizePlan(userProfile.plan),
      credits: userProfile.credits || 0,
      reason: "already_claimed",
    };
  }

  const entitlement = await resolveArchivedEntitlement(ctx, identity);
  if (!entitlement) {
    return {
      applied: false,
      plan: normalizePlan(userProfile.plan),
      credits: userProfile.credits || 0,
      reason: "no_active_archived_subscription",
    };
  }

  const previousCredits = userProfile.credits || 0;
  const newCredits = Math.max(previousCredits, entitlement.creditsBaseline);
  const now = Date.now();

  await ctx.db.patch(userProfile._id, {
    plan: entitlement.plan,
    credits: newCredits,
    entitlementsClaimedAt: now,
    updatedAt: now,
  });

  if (newCredits > previousCredits) {
    await ctx.db.insert("creditTransactions", {
      userProfileId: userProfile._id,
      type: "earned",
      amount: newCredits - previousCredits,
      balance: newCredits,
      source: "entitlement-claim",
      description: "Restored baseline credits from archived billing entitlement",
      metadata: {
        source: entitlement.source,
        previousCredits,
      },
      createdAt: now,
    });
  }

  return {
    applied: true,
    plan: entitlement.plan,
    credits: newCredits,
  };
}

export async function getCurrentUserProfile(ctx: IdentityCtx): Promise<Doc<"userProfiles">> {
  const identity = await getCurrentIdentity(ctx);
  const byClerkId = await getCurrentUserProfileByClerkId(ctx, identity.clerkUserId);
  if (byClerkId) {
    return byClerkId;
  }

  throw new ConvexError("User profile not found. Please complete registration.");
}

export const createUserProfile = mutation({
  args: {
    email: v.string(),
    name: v.string(),
  },
  returns: v.object({
    userProfileId: v.id("userProfiles"),
  }),
  handler: async (ctx, { email, name }) => {
    const identity = await getCurrentIdentity(ctx);

    const existing = await getCurrentUserProfileByClerkId(ctx, identity.clerkUserId);
    if (existing) {
      return { userProfileId: existing._id };
    }

    const normalizedEmail = (email || identity.email || "").toLowerCase().trim();
    const normalizedName = (name || identity.name || "User").trim();
    const now = Date.now();
    const entitlement = await resolveArchivedEntitlement(ctx, identity);
    const initialPlan = entitlement?.plan ?? "none";
    const initialCredits = entitlement?.creditsBaseline ?? CREDITS.NONE_SIGNUP_BONUS;

    const userProfileId = await ctx.db.insert("userProfiles", {
      clerkUserId: identity.clerkUserId,
      email: normalizedEmail,
      name: normalizedName,
      plan: initialPlan,
      credits: initialCredits,
      entitlementsClaimedAt: entitlement ? now : undefined,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("creditTransactions", {
      userProfileId,
      type: "earned",
      amount: initialCredits,
      balance: initialCredits,
      source: entitlement ? "entitlement-claim" : "registration",
      description: entitlement
        ? "Baseline credits restored from archived billing"
        : "Welcome bonus credits",
      createdAt: now,
    });

    return { userProfileId };
  },
});

export const ensureUserProfile = mutation({
  args: {},
  returns: v.object({
    userProfileId: v.id("userProfiles"),
  }),
  handler: async (ctx) => {
    const identity = await getCurrentIdentity(ctx);
    const now = Date.now();

    let userProfile = await getCurrentUserProfileByClerkId(ctx, identity.clerkUserId);

    if (!userProfile) {
      const entitlement = await resolveArchivedEntitlement(ctx, identity);
      const startingPlan = entitlement?.plan ?? "none";
      const startingCredits = entitlement?.creditsBaseline ?? CREDITS.NONE_SIGNUP_BONUS;

      const userProfileId = await ctx.db.insert("userProfiles", {
        clerkUserId: identity.clerkUserId,
        email: identity.email?.toLowerCase().trim() || "",
        name: identity.name || "User",
        plan: startingPlan,
        credits: startingCredits,
        entitlementsClaimedAt: entitlement ? now : undefined,
        createdAt: now,
        updatedAt: now,
      });

      await ctx.db.insert("creditTransactions", {
        userProfileId,
        type: "earned",
        amount: startingCredits,
        balance: startingCredits,
        source: entitlement ? "entitlement-claim" : "registration",
        description: entitlement
          ? "Baseline credits restored from archived billing"
          : "Welcome bonus credits",
        createdAt: now,
      });

      return { userProfileId };
    }

    const updates: Partial<Doc<"userProfiles">> = {
      updatedAt: now,
    };
    let shouldPatch = false;

    if (identity.email) {
      const normalizedEmail = identity.email.toLowerCase().trim();
      if (normalizedEmail && userProfile.email !== normalizedEmail) {
        updates.email = normalizedEmail;
        shouldPatch = true;
      }
    }

    if (identity.name && identity.name.trim() && userProfile.name !== identity.name.trim()) {
      updates.name = identity.name.trim();
      shouldPatch = true;
    }

    if (shouldPatch) {
      await ctx.db.patch(userProfile._id, updates);
      userProfile = (await ctx.db.get(userProfile._id)) || userProfile;
    }

    await applyArchivedEntitlementsToProfile(ctx, userProfile, identity);

    return { userProfileId: userProfile._id };
  },
});

export const claimArchivedEntitlements = mutation({
  args: {},
  returns: v.object({
    success: v.boolean(),
    applied: v.boolean(),
    plan: v.union(v.literal("none"), v.literal("starter"), v.literal("pro"), v.literal("hired")),
    credits: v.number(),
    reason: v.optional(v.string()),
  }),
  handler: async (ctx) => {
    const identity = await getCurrentIdentity(ctx);
    const userProfile = await getCurrentUserProfile(ctx);
    const result = await applyArchivedEntitlementsToProfile(ctx, userProfile, identity);
    return {
      success: true,
      applied: result.applied,
      plan: result.plan,
      credits: result.credits,
      reason: result.reason,
    };
  },
});

export const getUserProfile = query({
  args: {},
  returns: v.object({
    _id: v.id("userProfiles"),
    email: v.string(),
    name: v.string(),
    plan: v.union(v.literal("none"), v.literal("starter"), v.literal("pro"), v.literal("hired")),
    credits: v.number(),
    isAdmin: v.boolean(),
    stripeCustomerId: v.optional(v.string()),
    subscriptionStatus: v.optional(
      v.union(
        v.literal("active"),
        v.literal("canceled"),
        v.literal("incomplete"),
        v.literal("incomplete_expired"),
        v.literal("past_due"),
        v.literal("trialing"),
        v.literal("unpaid")
      )
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
  handler: async (ctx) => {
    const userProfile = await getCurrentUserProfile(ctx);

    return {
      _id: userProfile._id,
      email: userProfile.email,
      name: userProfile.name,
      plan: normalizePlan(userProfile.plan),
      credits: userProfile.credits || 0,
      isAdmin: !!userProfile.isAdmin,
      stripeCustomerId: userProfile.stripeCustomerId,
      subscriptionStatus: userProfile.subscriptionStatus,
      createdAt: userProfile.createdAt,
      updatedAt: userProfile.updatedAt,
    };
  },
});

export async function getUserProfileById(
  ctx: QueryCtx,
  userProfileId: Id<"userProfiles">
): Promise<Doc<"userProfiles"> | null> {
  return await ctx.db.get(userProfileId);
}

export async function getUserProfileByEmail(
  ctx: QueryCtx,
  email: string
): Promise<Doc<"userProfiles"> | null> {
  return await ctx.db
    .query("userProfiles")
    .withIndex("by_email", (q) => q.eq("email", email))
    .unique();
}

export async function getUserLimits(ctx: QueryCtx): Promise<unknown> {
  const userProfile = await getCurrentUserProfile(ctx);

  const planLimits = AI_LIMITS[normalizePlan(userProfile.plan)];
  const hasActiveSubscription = userProfile.subscriptionStatus === "active";

  return {
    hasActiveSubscription,
    planLimits,
    usage: {
      credits: userProfile.credits || 0,
    },
  };
}

export const updateUserProfile = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    billingAddress: v.optional(
      v.object({
        line1: v.string(),
        line2: v.optional(v.string()),
        city: v.string(),
        state: v.string(),
        postalCode: v.string(),
        country: v.string(),
      })
    ),
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
      if (!args.email || !args.email.includes("@")) {
        throw new ConvexError("Valid email is required");
      }

      const email = args.email.toLowerCase().trim();
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

export const getUserProfileId = query({
  args: {},
  returns: v.id("userProfiles"),
  handler: async (ctx) => {
    const userProfile = await getCurrentUserProfile(ctx);
    return userProfile._id;
  },
});

export const isCurrentUserAdmin = query({
  args: {},
  returns: v.boolean(),
  handler: async (ctx) => {
    const userProfile = await getCurrentUserProfile(ctx);
    return !!userProfile.isAdmin;
  },
});

export const getCurrentUserAdminStatus = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const userProfile = await getCurrentUserProfile(ctx);
    return {
      isAuthenticated: true,
      isAdmin: !!userProfile.isAdmin,
      userProfile: {
        _id: userProfile._id,
        email: userProfile.email,
        name: userProfile.name,
        plan: normalizePlan(userProfile.plan),
        isAdmin: !!userProfile.isAdmin,
        clerkUserId: userProfile.clerkUserId,
      },
    };
  },
});

export const getAllUsers = query({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const caller = await getCurrentUserProfile(ctx);
    if (!caller.isAdmin) {
      throw new ConvexError("Admin access required");
    }
    const limit = Math.min(Math.max(args.limit ?? 100, 1), 500);
    const users = await ctx.db.query("userProfiles").take(limit);
    return users.map((u) => ({
      _id: u._id,
      clerkUserId: u.clerkUserId,
      email: u.email,
      name: u.name,
      createdAt: u.createdAt,
      credits: u.credits ?? 0,
      plan: normalizePlan(u.plan),
      subscriptionStatus: u.subscriptionStatus,
      isAdmin: !!u.isAdmin,
    }));
  },
});

export const updateUserPlan = mutation({
  args: {
    plan: v.union(v.literal("none"), v.literal("starter"), v.literal("pro"), v.literal("hired")),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const userProfile = await getCurrentUserProfile(ctx);
    await ctx.db.patch(userProfile._id, {
      plan: args.plan,
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

export const grantAdminAccess = mutation({
  args: {
    userEmail: v.string(),
  },
  returns: v.object({ success: v.boolean(), message: v.string() }),
  handler: async (ctx, args) => {
    const caller = await getCurrentUserProfile(ctx);
    if (!caller.isAdmin) {
      throw new ConvexError("Admin access required");
    }
    const email = args.userEmail.toLowerCase().trim();
    const user = await ctx.db
      .query("userProfiles")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (!user) {
      throw new ConvexError("User not found");
    }
    await ctx.db.patch(user._id, { isAdmin: true, updatedAt: Date.now() });
    return { success: true, message: `Granted admin access to ${email}` };
  },
});

export const revokeAdminAccess = mutation({
  args: {
    userEmail: v.string(),
  },
  returns: v.object({ success: v.boolean(), message: v.string() }),
  handler: async (ctx, args) => {
    const caller = await getCurrentUserProfile(ctx);
    if (!caller.isAdmin) {
      throw new ConvexError("Admin access required");
    }
    const email = args.userEmail.toLowerCase().trim();
    const user = await ctx.db
      .query("userProfiles")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (!user) {
      throw new ConvexError("User not found");
    }
    await ctx.db.patch(user._id, { isAdmin: false, updatedAt: Date.now() });
    return { success: true, message: `Revoked admin access for ${email}` };
  },
});

export const adminAddCredits = mutation({
  args: {
    targetUserEmail: v.string(),
    amount: v.number(),
    reason: v.optional(v.string()),
  },
  returns: v.object({ success: v.boolean(), newBalance: v.number(), message: v.string() }),
  handler: async (ctx, args) => {
    const caller = await getCurrentUserProfile(ctx);
    if (!caller.isAdmin) {
      throw new ConvexError("Admin access required");
    }
    if (args.amount <= 0) {
      throw new ConvexError("Amount must be positive");
    }

    const email = args.targetUserEmail.toLowerCase().trim();
    const targetUser = await ctx.db
      .query("userProfiles")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (!targetUser) {
      throw new ConvexError("User not found");
    }

    const currentCredits = targetUser.credits || 0;
    const newBalance = currentCredits + args.amount;
    const now = Date.now();

    await ctx.db.patch(targetUser._id, {
      credits: newBalance,
      updatedAt: now,
    });

    await ctx.db.insert("creditTransactions", {
      userProfileId: targetUser._id,
      type: "earned",
      amount: args.amount,
      balance: newBalance,
      source: "admin-grant",
      description: args.reason || `Admin credit grant by ${caller.email}`,
      metadata: { grantedBy: caller._id, grantedByEmail: caller.email },
      createdAt: now,
    });

    return {
      success: true,
      newBalance,
      message: `Added ${args.amount} credits to ${email} (new balance: ${newBalance})`,
    };
  },
});

export const adminSetUserPlan = mutation({
  args: {
    targetUserEmail: v.string(),
    plan: v.union(v.literal("none"), v.literal("starter"), v.literal("pro"), v.literal("hired")),
  },
  returns: v.object({ success: v.boolean(), message: v.string() }),
  handler: async (ctx, args) => {
    const caller = await getCurrentUserProfile(ctx);
    if (!caller.isAdmin) {
      throw new ConvexError("Admin access required");
    }

    const email = args.targetUserEmail.toLowerCase().trim();
    const targetUser = await ctx.db
      .query("userProfiles")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (!targetUser) {
      throw new ConvexError("User not found");
    }

    await ctx.db.patch(targetUser._id, {
      plan: args.plan,
      updatedAt: Date.now(),
    });

    return {
      success: true,
      message: `Updated ${email} plan to ${args.plan}`,
    };
  },
});

export const getBillingArchiveForCurrentUser = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const identity = await getCurrentIdentity(ctx);
    const records = await loadBillingArchiveCandidates(ctx, identity);
    return records.sort((a, b) => b.archivedAt - a.archivedAt);
  },
});

export const deleteUserProfile = mutation({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const userProfile = await getCurrentUserProfile(ctx);

    const [coverLetters, extractedJobs, resumes, transactions, applications] = await Promise.all([
      ctx.db.query("coverLetters").withIndex("by_user", (q) => q.eq("userProfileId", userProfile._id)).collect(),
      ctx.db.query("extractedJobs").withIndex("by_user", (q) => q.eq("userProfileId", userProfile._id)).collect(),
      ctx.db.query("resumes").withIndex("by_user", (q) => q.eq("userProfileId", userProfile._id)).collect(),
      ctx.db.query("creditTransactions").withIndex("by_user", (q) => q.eq("userProfileId", userProfile._id)).collect(),
      ctx.db.query("jobApplications").withIndex("by_user", (q) => q.eq("userProfileId", userProfile._id)).collect(),
    ]);

    for (const resume of resumes) {
      await ctx.storage.delete(resume.fileId).catch(() => null);
      await ctx.db.delete(resume._id);
    }
    for (const cl of coverLetters) await ctx.db.delete(cl._id);
    for (const j of extractedJobs) await ctx.db.delete(j._id);
    for (const t of transactions) await ctx.db.delete(t._id);
    for (const app of applications) await ctx.db.delete(app._id);
    await ctx.db.delete(userProfile._id);

    return {
      success: true,
      deletedItems: {
        coverLetters: coverLetters.length,
        extractedJobs: extractedJobs.length,
        resumes: resumes.length,
        creditTransactions: transactions.length,
        jobApplications: applications.length,
        userProfile: true,
      },
    };
  },
});
