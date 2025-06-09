// Stripe helper functions for payment processing
// Note: This is a placeholder implementation. In production, you'd use the actual Stripe SDK.

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

// Mock Stripe functions for development
// In production, replace these with actual Stripe SDK calls

export async function createCustomer(email: string, name?: string): Promise<StripeCustomer> {
  // Mock implementation
  return {
    id: `cus_mock_${Date.now()}`,
    email,
    name,
    created: Math.floor(Date.now() / 1000),
  };
}

export async function createCheckoutSession(params: {
  customer?: string;
  priceId?: string;
  mode: 'payment' | 'subscription';
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}): Promise<StripeCheckoutSession> {
  // Mock implementation
  return {
    id: `cs_mock_${Date.now()}`,
    url: `https://checkout.stripe.com/pay/mock_${Date.now()}`,
    customer: params.customer,
    status: 'open',
  };
}

export async function retrieveCustomer(customerId: string): Promise<StripeCustomer | null> {
  // Mock implementation
  if (customerId.startsWith('cus_mock_')) {
    return {
      id: customerId,
      email: 'mock@example.com',
      created: Math.floor(Date.now() / 1000),
    };
  }
  return null;
}

export async function retrieveSubscription(subscriptionId: string): Promise<StripeSubscription | null> {
  // Mock implementation
  if (subscriptionId.startsWith('sub_mock_')) {
    return {
      id: subscriptionId,
      customer: 'cus_mock_123',
      status: 'active',
      current_period_start: Math.floor(Date.now() / 1000),
      current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
      cancel_at_period_end: false,
    };
  }
  return null;
}

export async function cancelSubscription(
  subscriptionId: string, 
  cancelAtPeriodEnd = true
): Promise<StripeSubscription | null> {
  // Mock implementation
  const subscription = await retrieveSubscription(subscriptionId);
  if (subscription) {
    return {
      ...subscription,
      cancel_at_period_end: cancelAtPeriodEnd,
      canceled_at: cancelAtPeriodEnd ? undefined : Math.floor(Date.now() / 1000),
      status: cancelAtPeriodEnd ? 'active' : 'canceled',
    };
  }
  return null;
}

export async function constructWebhookEvent(
  payload: string, 
  signature: string, 
  secret: string
): Promise<any> {
  // Mock implementation - in production, use stripe.webhooks.constructEvent
  try {
    return JSON.parse(payload);
  } catch {
    throw new Error('Invalid webhook payload');
  }
}

// Pricing configuration
export const STRIPE_PRICES = {
  starter_monthly: 'price_starter_monthly',
  starter_yearly: 'price_starter_yearly',
  pro_monthly: 'price_pro_monthly',
  pro_yearly: 'price_pro_yearly',
  enterprise_monthly: 'price_enterprise_monthly',
  enterprise_yearly: 'price_enterprise_yearly',
  credits_10: 'price_credits_10',
  credits_25: 'price_credits_25',
  credits_50: 'price_credits_50',
  credits_100: 'price_credits_100',
} as const;

export const CREDIT_PACKAGES = {
  credits_10: { credits: 10, price: 500 }, // $5.00
  credits_25: { credits: 25, price: 1000 }, // $10.00
  credits_50: { credits: 50, price: 1800 }, // $18.00
  credits_100: { credits: 100, price: 3000 }, // $30.00
} as const;

export const SUBSCRIPTION_PLANS = {
  starter: {
    monthly: { priceId: STRIPE_PRICES.starter_monthly, price: 999 }, // $9.99
    yearly: { priceId: STRIPE_PRICES.starter_yearly, price: 9999 }, // $99.99
  },
  pro: {
    monthly: { priceId: STRIPE_PRICES.pro_monthly, price: 2999 }, // $29.99
    yearly: { priceId: STRIPE_PRICES.pro_yearly, price: 29999 }, // $299.99
  },
  enterprise: {
    monthly: { priceId: STRIPE_PRICES.enterprise_monthly, price: 9999 }, // $99.99
    yearly: { priceId: STRIPE_PRICES.enterprise_yearly, price: 99999 }, // $999.99
  },
} as const;
