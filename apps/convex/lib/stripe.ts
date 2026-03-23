import Stripe from "stripe";
import {
  CREDIT_PACKAGES as PLAN_CREDIT_PACKAGES,
  PRICING_PLANS,
} from "./plans";

export interface StripeCustomer {
  id: string;
  email: string;
  name?: string;
  created: number;
}

export interface StripeSubscription {
  id: string;
  customer: string;
  status: string;
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
  canceled_at?: number;
  trial_start?: number;
  trial_end?: number;
}

export interface StripePaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  customer?: string;
  metadata?: Record<string, string>;
}

export interface StripeCheckoutSession {
  id: string;
  url: string;
  customer?: string;
  payment_intent?: string;
  subscription?: string;
  status: string;
}

function toCents(amount: number): number {
  return Math.round(amount * 100);
}

function createStripeClient(apiKey = process.env.STRIPE_SECRET_KEY || "sk_test_placeholder") {
  return new Stripe(apiKey);
}

function getStripeClient() {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) {
    throw new Error("Stripe secret key not configured");
  }

  return createStripeClient(apiKey);
}

function mapCustomer(customer: {
  id: string;
  email?: string | null;
  name?: string | null;
  created: number;
}): StripeCustomer {
  return {
    id: customer.id,
    email: customer.email ?? "",
    name: customer.name ?? undefined,
    created: customer.created,
  };
}

function mapCheckoutSession(session: {
  id: string;
  url?: string | null;
  customer?: string | { id: string } | null;
  payment_intent?: string | { id: string } | null;
  subscription?: string | { id: string } | null;
  status?: string | null;
}): StripeCheckoutSession {
  const customer =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id;
  const paymentIntent =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;
  const subscription =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;

  return {
    id: session.id,
    url: session.url ?? "",
    customer: customer ?? undefined,
    payment_intent: paymentIntent ?? undefined,
    subscription: subscription ?? undefined,
    status: session.status ?? "open",
  };
}

function mapSubscription(subscription: {
  id: string;
  customer: string | { id: string };
  status: string;
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
  canceled_at?: number | null;
  trial_start?: number | null;
  trial_end?: number | null;
}): StripeSubscription {
  return {
    id: subscription.id,
    customer:
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer.id,
    status: subscription.status,
    current_period_start: subscription.current_period_start,
    current_period_end: subscription.current_period_end,
    cancel_at_period_end: subscription.cancel_at_period_end,
    canceled_at: subscription.canceled_at ?? undefined,
    trial_start: subscription.trial_start ?? undefined,
    trial_end: subscription.trial_end ?? undefined,
  };
}

export async function createCustomer(email: string, name?: string): Promise<StripeCustomer> {
  const stripe = getStripeClient();
  const customer = await stripe.customers.create({
    email,
    ...(name ? { name } : {}),
  });
  return mapCustomer(customer);
}

export async function createCheckoutSession(params: {
  customer?: string;
  priceId?: string;
  mode: 'payment' | 'subscription';
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}): Promise<StripeCheckoutSession> {
  const stripe = getStripeClient();
  const session = await stripe.checkout.sessions.create({
    customer: params.customer,
    line_items: params.priceId ? [{ price: params.priceId, quantity: 1 }] : undefined,
    mode: params.mode,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: params.metadata,
  });
  return mapCheckoutSession(session);
}

export async function retrieveCustomer(customerId: string): Promise<StripeCustomer | null> {
  try {
    const stripe = getStripeClient();
    const customer = await stripe.customers.retrieve(customerId);
    if ("deleted" in customer && customer.deleted) {
      return null;
    }

    return mapCustomer(customer);
  } catch {
    return null;
  }
}

export async function retrieveSubscription(subscriptionId: string): Promise<StripeSubscription | null> {
  try {
    const stripe = getStripeClient();
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return mapSubscription(subscription);
  } catch {
    return null;
  }
}

export async function cancelSubscription(
  subscriptionId: string, 
  cancelAtPeriodEnd = true
): Promise<StripeSubscription | null> {
  try {
    const stripe = getStripeClient();
    const subscription = cancelAtPeriodEnd
      ? await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        })
      : await stripe.subscriptions.cancel(subscriptionId);

    return mapSubscription(subscription);
  } catch {
    return null;
  }
}

export async function constructWebhookEvent(
  payload: string, 
  signature: string, 
  secret: string
): Promise<any> {
  return createStripeClient().webhooks.constructEvent(payload, signature, secret);
}

// Pricing configuration
export const STRIPE_PRICES = {
  starter_monthly: PRICING_PLANS.starter.stripePriceId,
  pro_monthly: PRICING_PLANS.pro.stripePriceId,
  hired_monthly: PRICING_PLANS.hired.stripePriceId,
  credits_10: PLAN_CREDIT_PACKAGES.credits_10.stripePriceId,
  credits_25: PLAN_CREDIT_PACKAGES.credits_25.stripePriceId,
  credits_50: PLAN_CREDIT_PACKAGES.credits_50.stripePriceId,
  credits_100: PLAN_CREDIT_PACKAGES.credits_100.stripePriceId,
} as const;

export const CREDIT_PACKAGES = {
  credits_10: {
    credits: PLAN_CREDIT_PACKAGES.credits_10.credits,
    price: toCents(PLAN_CREDIT_PACKAGES.credits_10.price),
    stripePriceId: PLAN_CREDIT_PACKAGES.credits_10.stripePriceId,
  },
  credits_25: {
    credits: PLAN_CREDIT_PACKAGES.credits_25.credits,
    price: toCents(PLAN_CREDIT_PACKAGES.credits_25.price),
    stripePriceId: PLAN_CREDIT_PACKAGES.credits_25.stripePriceId,
  },
  credits_50: {
    credits: PLAN_CREDIT_PACKAGES.credits_50.credits,
    price: toCents(PLAN_CREDIT_PACKAGES.credits_50.price),
    stripePriceId: PLAN_CREDIT_PACKAGES.credits_50.stripePriceId,
  },
  credits_100: {
    credits: PLAN_CREDIT_PACKAGES.credits_100.credits,
    price: toCents(PLAN_CREDIT_PACKAGES.credits_100.price),
    stripePriceId: PLAN_CREDIT_PACKAGES.credits_100.stripePriceId,
  },
} as const;

export const SUBSCRIPTION_PLANS = {
  starter: {
    monthly: {
      priceId: STRIPE_PRICES.starter_monthly,
      price: toCents(PRICING_PLANS.starter.price),
    },
  },
  pro: {
    monthly: {
      priceId: STRIPE_PRICES.pro_monthly,
      price: toCents(PRICING_PLANS.pro.price),
    },
  },
  hired: {
    monthly: {
      priceId: STRIPE_PRICES.hired_monthly,
      price: toCents(PRICING_PLANS.hired.price),
    },
  },
} as const;
