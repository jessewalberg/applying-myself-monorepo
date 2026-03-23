import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  CREDIT_PACKAGES as PLAN_CREDIT_PACKAGES,
  PRICING_PLANS,
} from "../lib/plans";

const stripeMocks = vi.hoisted(() => ({
  apiKeys: [] as string[],
  customerCreate: vi.fn(),
  customerRetrieve: vi.fn(),
  checkoutCreate: vi.fn(),
  subscriptionRetrieve: vi.fn(),
  subscriptionUpdate: vi.fn(),
  subscriptionCancel: vi.fn(),
  constructEvent: vi.fn(),
}));

vi.mock("stripe", () => {
  return {
    default: class MockStripe {
      customers = {
        create: stripeMocks.customerCreate,
        retrieve: stripeMocks.customerRetrieve,
      };

      checkout = {
        sessions: {
          create: stripeMocks.checkoutCreate,
        },
      };

      subscriptions = {
        retrieve: stripeMocks.subscriptionRetrieve,
        update: stripeMocks.subscriptionUpdate,
        cancel: stripeMocks.subscriptionCancel,
      };

      webhooks = {
        constructEvent: stripeMocks.constructEvent,
      };

      constructor(apiKey: string) {
        stripeMocks.apiKeys.push(apiKey);
      }
    },
  };
});

import {
  CREDIT_PACKAGES,
  STRIPE_PRICES,
  SUBSCRIPTION_PLANS,
  cancelSubscription,
  constructWebhookEvent,
  createCheckoutSession,
  createCustomer,
  retrieveCustomer,
  retrieveSubscription,
} from "../lib/stripe";

describe("Stripe helpers", () => {
  beforeEach(() => {
    stripeMocks.apiKeys.length = 0;
    stripeMocks.customerCreate.mockReset();
    stripeMocks.customerRetrieve.mockReset();
    stripeMocks.checkoutCreate.mockReset();
    stripeMocks.subscriptionRetrieve.mockReset();
    stripeMocks.subscriptionUpdate.mockReset();
    stripeMocks.subscriptionCancel.mockReset();
    stripeMocks.constructEvent.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("throws when the Stripe secret key is missing for customer creation", async () => {
    await expect(createCustomer("user@example.com")).rejects.toThrow(
      "Stripe secret key not configured"
    );
  });

  it("creates a customer through the Stripe SDK", async () => {
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_123");
    stripeMocks.customerCreate.mockResolvedValue({
      id: "cus_123",
      email: "user@example.com",
      name: "Jesse",
      created: 1700000000,
    });

    const customer = await createCustomer("user@example.com", "Jesse");

    expect(customer).toEqual({
      id: "cus_123",
      email: "user@example.com",
      name: "Jesse",
      created: 1700000000,
    });
    expect(stripeMocks.apiKeys).toEqual(["sk_test_123"]);
    expect(stripeMocks.customerCreate).toHaveBeenCalledWith({
      email: "user@example.com",
      name: "Jesse",
    });
  });

  it("creates a checkout session with the requested price and metadata", async () => {
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_123");
    stripeMocks.checkoutCreate.mockResolvedValue({
      id: "cs_123",
      url: "https://checkout.stripe.com/c/pay/cs_123",
      customer: "cus_123",
      payment_intent: "pi_123",
      subscription: null,
      status: "open",
    });

    const session = await createCheckoutSession({
      customer: "cus_123",
      priceId: "price_pro_monthly",
      mode: "subscription",
      successUrl: "https://applyingmyself.com/success",
      cancelUrl: "https://applyingmyself.com/cancel",
      metadata: { source: "billing-page" },
    });

    expect(session).toEqual({
      id: "cs_123",
      url: "https://checkout.stripe.com/c/pay/cs_123",
      customer: "cus_123",
      payment_intent: "pi_123",
      subscription: undefined,
      status: "open",
    });
    expect(stripeMocks.checkoutCreate).toHaveBeenCalledWith({
      cancel_url: "https://applyingmyself.com/cancel",
      customer: "cus_123",
      line_items: [{ price: "price_pro_monthly", quantity: 1 }],
      metadata: { source: "billing-page" },
      mode: "subscription",
      success_url: "https://applyingmyself.com/success",
    });
  });

  it("retrieves an existing customer", async () => {
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_123");
    stripeMocks.customerRetrieve.mockResolvedValue({
      id: "cus_456",
      email: "existing@example.com",
      created: 1700000100,
    });

    const customer = await retrieveCustomer("cus_456");

    expect(customer).toEqual({
      id: "cus_456",
      email: "existing@example.com",
      name: undefined,
      created: 1700000100,
    });
  });

  it("returns null for deleted Stripe customers", async () => {
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_123");
    stripeMocks.customerRetrieve.mockResolvedValue({
      id: "cus_deleted",
      deleted: true,
    });

    await expect(retrieveCustomer("cus_deleted")).resolves.toBeNull();
  });

  it("retrieves an existing subscription", async () => {
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_123");
    stripeMocks.subscriptionRetrieve.mockResolvedValue({
      id: "sub_123",
      customer: "cus_123",
      status: "active",
      current_period_start: 1700000000,
      current_period_end: 1702592000,
      cancel_at_period_end: false,
      canceled_at: null,
      trial_start: null,
      trial_end: null,
    });

    const subscription = await retrieveSubscription("sub_123");

    expect(subscription).toEqual({
      id: "sub_123",
      customer: "cus_123",
      status: "active",
      current_period_start: 1700000000,
      current_period_end: 1702592000,
      cancel_at_period_end: false,
      canceled_at: undefined,
      trial_start: undefined,
      trial_end: undefined,
    });
  });

  it("returns null when subscription retrieval fails", async () => {
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_123");
    stripeMocks.subscriptionRetrieve.mockRejectedValue(new Error("not found"));

    await expect(retrieveSubscription("sub_missing")).resolves.toBeNull();
  });

  it("updates a subscription for period-end cancellation", async () => {
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_123");
    stripeMocks.subscriptionUpdate.mockResolvedValue({
      id: "sub_123",
      customer: "cus_123",
      status: "active",
      current_period_start: 1700000000,
      current_period_end: 1702592000,
      cancel_at_period_end: true,
      canceled_at: null,
      trial_start: null,
      trial_end: null,
    });

    const subscription = await cancelSubscription("sub_123");

    expect(stripeMocks.subscriptionUpdate).toHaveBeenCalledWith("sub_123", {
      cancel_at_period_end: true,
    });
    expect(subscription?.cancel_at_period_end).toBe(true);
  });

  it("immediately cancels a subscription when requested", async () => {
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_123");
    stripeMocks.subscriptionCancel.mockResolvedValue({
      id: "sub_123",
      customer: "cus_123",
      status: "canceled",
      current_period_start: 1700000000,
      current_period_end: 1702592000,
      cancel_at_period_end: false,
      canceled_at: 1700100000,
      trial_start: null,
      trial_end: null,
    });

    const subscription = await cancelSubscription("sub_123", false);

    expect(stripeMocks.subscriptionCancel).toHaveBeenCalledWith("sub_123");
    expect(subscription?.status).toBe("canceled");
    expect(subscription?.canceled_at).toBe(1700100000);
  });

  it("constructs webhook events through Stripe webhooks", async () => {
    stripeMocks.constructEvent.mockReturnValue({
      id: "evt_123",
      type: "payment_intent.succeeded",
    });

    const event = await constructWebhookEvent(
      '{"id":"evt_123"}',
      "sig_123",
      "whsec_123"
    );

    expect(event).toEqual({
      id: "evt_123",
      type: "payment_intent.succeeded",
    });
    expect(stripeMocks.constructEvent).toHaveBeenCalledWith(
      '{"id":"evt_123"}',
      "sig_123",
      "whsec_123"
    );
  });
});

describe("Stripe pricing config", () => {
  it("keeps monthly subscription price ids aligned with pricing plans", () => {
    expect(STRIPE_PRICES.starter_monthly).toBe(
      PRICING_PLANS.starter.stripePriceId
    );
    expect(STRIPE_PRICES.pro_monthly).toBe(PRICING_PLANS.pro.stripePriceId);
    expect(STRIPE_PRICES.hired_monthly).toBe(
      PRICING_PLANS.hired.stripePriceId
    );
  });

  it("keeps credit package price ids aligned with shared plan data", () => {
    expect(STRIPE_PRICES.credits_10).toBe(
      PLAN_CREDIT_PACKAGES.credits_10.stripePriceId
    );
    expect(STRIPE_PRICES.credits_100).toBe(
      PLAN_CREDIT_PACKAGES.credits_100.stripePriceId
    );
  });

  it("converts subscription prices to cents", () => {
    expect(SUBSCRIPTION_PLANS.starter.monthly.price).toBe(999);
    expect(SUBSCRIPTION_PLANS.pro.monthly.price).toBe(1999);
    expect(SUBSCRIPTION_PLANS.hired.monthly.price).toBe(4999);
  });

  it("converts credit package prices to cents", () => {
    expect(CREDIT_PACKAGES.credits_10.price).toBe(299);
    expect(CREDIT_PACKAGES.credits_25.price).toBe(699);
    expect(CREDIT_PACKAGES.credits_50.price).toBe(1299);
    expect(CREDIT_PACKAGES.credits_100.price).toBe(2499);
  });
});
