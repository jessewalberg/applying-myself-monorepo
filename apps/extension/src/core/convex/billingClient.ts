import { api } from "@applyingmyself/convex-client";
import { convexClient, isConvexAuthenticated } from "./client";

export const createBillingSession = async (priceId: string): Promise<{ url: string }> => {
  if (!isConvexAuthenticated()) {
    throw new Error("Authentication required");
  }

  const result = await convexClient.action(api.billing.createSubscriptionCheckout, {
    priceId,
    successUrl: `${window.location.origin}/success`,
    cancelUrl: `${window.location.origin}/cancel`,
  });

  return { url: result.checkoutUrl };
};

export const getDashboardData = async () => {
  if (!isConvexAuthenticated()) {
    throw new Error("Authentication required");
  }

  return convexClient.query(api.users.getDashboard);
};

export const getCreditStats = async () => {
  if (!isConvexAuthenticated()) {
    throw new Error("Authentication required");
  }

  return convexClient.query(api.credits.getCreditStats);
};
