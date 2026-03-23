// convex/billing.ts
import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { getCurrentUserProfile } from "./userHelpers";
import { SUBSCRIPTION_STATUS, PAYMENT_STATUS, PAGINATION } from "./constants";
import {
  CREDIT_PACKAGES,
  PRICING_PLANS,
  getCreditPackage,
  getPricingCatalog,
  getReactivatedPlan,
  normalizePlan,
} from "../lib/billing";

export { CREDIT_PACKAGES, PRICING_PLANS } from "../lib/billing";

// Get pricing plans
export const getPricingPlans = query({
  args: {},
  handler: async () => {
    return getPricingCatalog();
  },
});

// Get current subscription for user
export const getCurrentSubscription = query({
  args: {},
  handler: async (ctx) => {
    const userProfile = await getCurrentUserProfile(ctx);

    // Get active subscription
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userProfileId", userProfile._id))
      .filter((q) => q.eq(q.field("status"), SUBSCRIPTION_STATUS.ACTIVE))
      .unique();

    if (!subscription) {
      return {
        hasSubscription: false,
        plan: normalizePlan(userProfile.plan),
        status: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: null,
      };
    }

    return {
      hasSubscription: true,
      plan: normalizePlan(userProfile.plan),
      subscription: {
        id: subscription._id,
        stripeSubscriptionId: subscription.stripeSubscriptionId,
        status: subscription.status,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        trialStart: subscription.trialStart,
        trialEnd: subscription.trialEnd,
      },
    };
  },
});

// Create Stripe checkout session for subscription
export const createSubscriptionCheckout = mutation({
  args: {
    priceId: v.string(),
    successUrl: v.string(),
    cancelUrl: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { priceId, successUrl, cancelUrl, metadata } = args;

    // Get authenticated user profile
    const userProfile = await getCurrentUserProfile(ctx);

    // Validate URLs
    try {
      new URL(successUrl);
      new URL(cancelUrl);
    } catch {
      throw new ConvexError("Invalid success or cancel URL");
    }

    if (!priceId || priceId.length < 1) {
      throw new ConvexError("Price ID is required");
    }

    // Note: In a real implementation, you'd create a Stripe checkout session here
    // For now, we'll create a pending payment record
    const paymentId = await ctx.db.insert("payments", {
      userProfileId: userProfile._id,
      amount: 0, // Will be updated when webhook processes
      currency: "usd",
      status: PAYMENT_STATUS.PENDING,
      type: "subscription",
      description: `Subscription checkout for price ${priceId}`,
      metadata: {
        priceId,
        successUrl,
        cancelUrl,
        ...metadata,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Return mock checkout URL (in real implementation, return Stripe URL)
    return {
      checkoutUrl: `${successUrl}?payment_id=${paymentId}`,
      paymentId,
    };
  },
});

// Create Stripe checkout session for credit purchase
export const createCreditsCheckout = mutation({
  args: {
    creditPackageId: v.string(),
    successUrl: v.string(),
    cancelUrl: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { creditPackageId, successUrl, cancelUrl, metadata } = args;

    // Get authenticated user profile
    const userProfile = await getCurrentUserProfile(ctx);

    // Validate URLs
    try {
      new URL(successUrl);
      new URL(cancelUrl);
    } catch {
      throw new ConvexError("Invalid success or cancel URL");
    }

    // Validate credit package
    const creditPackage = getCreditPackage(creditPackageId);
    if (!creditPackage) {
      throw new ConvexError("Invalid credit package");
    }

    // Create pending payment record
    const paymentId = await ctx.db.insert("payments", {
      userProfileId: userProfile._id,
      amount: creditPackage.price * 100, // Convert to cents
      currency: "usd",
      status: PAYMENT_STATUS.PENDING,
      type: "credits",
      description: `Purchase of ${creditPackage.name}`,
      metadata: {
        creditPackageId,
        credits: creditPackage.credits,
        successUrl,
        cancelUrl,
        ...metadata,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Return mock checkout URL (in real implementation, return Stripe URL)
    return {
      checkoutUrl: `${successUrl}?payment_id=${paymentId}`,
      paymentId,
    };
  },
});

// Cancel subscription
export const cancelSubscription = mutation({
  args: {
    cancelAtPeriodEnd: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { cancelAtPeriodEnd = true } = args;

    // Get authenticated user profile
    const userProfile = await getCurrentUserProfile(ctx);

    // Get active subscription
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userProfileId", userProfile._id))
      .filter((q) => q.eq(q.field("status"), SUBSCRIPTION_STATUS.ACTIVE))
      .unique();

    if (!subscription) {
      throw new ConvexError("No active subscription found");
    }

    // Update subscription
    await ctx.db.patch(subscription._id, {
      cancelAtPeriodEnd,
      canceledAt: new Date().toISOString(),
      updatedAt: Date.now(),
    });

    // If immediate cancellation, update status
    if (!cancelAtPeriodEnd) {
      await ctx.db.patch(subscription._id, {
        status: SUBSCRIPTION_STATUS.CANCELED,
      });

      // Update user plan to none tier
      await ctx.db.patch(userProfile._id, {
        plan: "none",
        subscriptionStatus: SUBSCRIPTION_STATUS.CANCELED,
        updatedAt: Date.now(),
      });
    }

    return {
      message: cancelAtPeriodEnd 
        ? "Subscription will be canceled at the end of the current period"
        : "Subscription canceled immediately",
      subscription: await ctx.db.get(subscription._id),
    };
  },
});

// Get payment history
export const getPaymentHistory = query({
  args: {
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT } = args;

    // Get authenticated user profile
    const userProfile = await getCurrentUserProfile(ctx);

    const validLimit = Math.min(Math.max(limit, PAGINATION.MIN_LIMIT), PAGINATION.MAX_LIMIT);

    const payments = await ctx.db
      .query("payments")
      .withIndex("by_user", (q) => q.eq("userProfileId", userProfile._id))
      .order("desc")
      .paginate({
        cursor: null,
        numItems: validLimit,
      });

    return {
      payments: payments.page,
      pagination: {
        page,
        limit: validLimit,
        hasMore: payments.isDone === false,
        cursor: payments.continueCursor,
      }
    };
  },
});

// Get subscription history
export const getSubscriptionHistory = query({
  args: {},
  handler: async (ctx) => {
    // Get authenticated user profile
    const userProfile = await getCurrentUserProfile(ctx);

    const subscriptions = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userProfileId", userProfile._id))
      .order("desc")
      .collect();

    return {
      subscriptions: subscriptions.map(sub => ({
        id: sub._id,
        status: sub.status,
        startDate: sub.currentPeriodStart,
        endDate: sub.currentPeriodEnd,
        trialStart: sub.trialStart,
        trialEnd: sub.trialEnd,
        canceledAt: sub.canceledAt,
        cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
      })),
    };
  },
});

// Get billing stats
export const getBillingStats = query({
  args: {},
  handler: async (ctx) => {
    // Get authenticated user profile
    const userProfile = await getCurrentUserProfile(ctx);

    // Get all payments
    const allPayments = await ctx.db
      .query("payments")
      .withIndex("by_user", (q) => q.eq("userProfileId", userProfile._id))
      .collect();

    // Get successful payments
    const successfulPayments = allPayments.filter(p => p.status === PAYMENT_STATUS.SUCCEEDED);

    // Calculate totals
    const totalSpent = successfulPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalCreditsEarned = successfulPayments
      .filter(p => p.type === "credits")
      .reduce((sum, payment) => sum + (payment.metadata?.credits || 0), 0);

    // Get this month's spending
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const thisMonthPayments = successfulPayments.filter(p => 
      p.createdAt >= startOfMonth.getTime()
    );
    const thisMonthSpent = thisMonthPayments.reduce((sum, payment) => sum + payment.amount, 0);

    // Current subscription info
    const activeSubscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userProfileId", userProfile._id))
      .filter((q) => q.eq(q.field("status"), SUBSCRIPTION_STATUS.ACTIVE))
      .unique();

    return {
      totalSpent: totalSpent / 100, // Convert from cents to dollars
      totalCreditsEarned,
      thisMonthSpent: thisMonthSpent / 100,
      paymentCount: successfulPayments.length,
      currentPlan: userProfile.plan,
      hasActiveSubscription: !!activeSubscription,
      subscriptionStatus: userProfile.subscriptionStatus,
      recentPayments: successfulPayments.slice(0, 5).map(payment => ({
        id: payment._id,
        amount: payment.amount / 100,
        type: payment.type,
        description: payment.description,
        createdAt: payment.createdAt,
      })),
    };
  },
});

// Update billing address
export const updateBillingAddress = mutation({
  args: {
    address: v.object({
      line1: v.string(),
      line2: v.optional(v.string()),
      city: v.string(),
      state: v.string(),
      postalCode: v.string(),
      country: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const { address } = args;

    // Get authenticated user profile
    const userProfile = await getCurrentUserProfile(ctx);

    // Validate address
    if (!address.line1 || !address.city || !address.state || !address.postalCode || !address.country) {
      throw new ConvexError("Address line 1, city, state, postal code, and country are required");
    }

    // Update user profile with billing address
    await ctx.db.patch(userProfile._id, {
      billingAddress: address,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Get current billing address
export const getBillingAddress = query({
  args: {},
  handler: async (ctx) => {
    // Get authenticated user profile
    const userProfile = await getCurrentUserProfile(ctx);

    return {
      address: userProfile.billingAddress || null,
    };
  },
});

// Webhook handler for Stripe events (called by Stripe)
export const handleStripeWebhook = mutation({
  args: {
    event: v.any(),
  },
  handler: async (ctx, args) => {
    const { event } = args;

    // Note: In a real implementation, you'd verify the webhook signature
    // and handle different event types from Stripe

    switch (event.type) {
      case 'payment_intent.succeeded':
        // Handle successful payment
        break;
      case 'customer.subscription.created':
        // Handle new subscription
        break;
      case 'customer.subscription.updated':
        // Handle subscription changes
        break;
      case 'customer.subscription.deleted':
        // Handle subscription cancellation
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  },
});

export const reactivateSubscription = mutation({
  args: {},
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
  }),
  handler: async (ctx) => {
    const userProfile = await getCurrentUserProfile(ctx);

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userProfileId", userProfile._id))
      .order("desc")
      .first();

    if (!subscription) {
      throw new ConvexError("No subscription found to reactivate");
    }

    await ctx.db.patch(subscription._id, {
      status: SUBSCRIPTION_STATUS.ACTIVE,
      cancelAtPeriodEnd: false,
      canceledAt: undefined,
      updatedAt: Date.now(),
    });

    await ctx.db.patch(userProfile._id, {
      plan: getReactivatedPlan(userProfile.plan),
      subscriptionStatus: SUBSCRIPTION_STATUS.ACTIVE,
      updatedAt: Date.now(),
    });

    return {
      success: true,
      message: "Subscription reactivated successfully",
    };
  },
});
