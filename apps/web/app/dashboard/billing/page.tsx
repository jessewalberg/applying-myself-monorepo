"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { CreditCardIcon, CheckIcon, XMarkIcon, ArrowUpIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from '@applyingmyself/convex-client';

// Price configuration based on environment
const getPlans = () => {
  const isProduction = process.env.NODE_ENV === 'production';

  return [
    {
      name: "Starter",
      price: 9,
      credits: 50,
      priceId: isProduction
        ? "price_1RcW71KCeqW42FQejbXbZFxo"
        : "price_1RaGUYGgPDjfnNjHzo4feM7o",
      features: [
        "50 Credits per month",
        "AI-powered cover letter generation",
        "Resume upload & text extraction",
        "Job application tracking",
        "Web job extraction (10/month)",
        "Basic search & filtering",
        "Email support"
      ],
      recommended: false,
    },
    {
      name: "Pro",
      price: 19,
      credits: 150,
      priceId: isProduction
        ? "price_1RcW6wKCeqW42FQeU8qSNGJd"
        : "price_1RaGYUGgPDjfnNjHePPZuR8N",
      features: [
        "150 Credits per month",
        "Advanced AI cover letter generation",
        "Multiple resume management",
        "Unlimited job application tracking",
        "Advanced web job extraction",
        "Enhanced search with filters",
        "Cover letter customization options",
        "Application status tracking",
        "Priority support"
      ],
      recommended: true,
    },
    {
      name: "Hired",
      price: 49,
      credits: 500,
      priceId: isProduction
        ? "price_1RcW6uKCeqW42FQeEgUB10tz"
        : "price_1RaGZJGgPDjfnNjHjLYWERED",
      features: [
        "500 Credits per month",
        "Premium AI models for cover letters",
        "Unlimited resume storage",
        "Bulk job extraction & processing",
        "Advanced application analytics",
        "Custom cover letter templates",
        "Export data capabilities",
        "API access (future)",
        "Dedicated support"
      ],
      recommended: false,
    },
  ];
};

const plans = getPlans();

export default function BillingPage() {
  const [isUpgrading, setIsUpgrading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const ensureUserProfile = useMutation(api.userHelpers.ensureUserProfile);
  const createSubscriptionCheckout = useAction(api.billing.createSubscriptionCheckout);
  const cancelSubscription = useMutation(api.billing.cancelSubscription);
  const reactivateSubscription = useMutation(api.billing.reactivateSubscription);
  const [profileEnsured, setProfileEnsured] = useState(false);

  useEffect(() => {
    ensureUserProfile({}).then(() => setProfileEnsured(true));
  }, [ensureUserProfile]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      setSuccessMessage("Payment successful! Your subscription is being activated. This may take a few moments to process.");
      window.history.replaceState({}, '', window.location.pathname);
    } else if (urlParams.get('canceled') === 'true') {
      setError("Payment was canceled. You can try again anytime.");
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const userProfile = useQuery(api.userHelpers.getUserProfile, profileEnsured ? {} : "skip");
  const currentSubscription = useQuery(api.billing.getCurrentSubscription, profileEnsured ? {} : "skip");
  const paymentHistoryData = useQuery(api.billing.getPaymentHistory, profileEnsured ? { limit: 10 } : "skip");

  const paymentHistory = paymentHistoryData?.payments || [];

  const isLoading = !profileEnsured || userProfile === undefined || currentSubscription === undefined;

  const currentPlan = userProfile?.plan || "none";
  const currentPlanInfo = plans.find(p => p.name.toLowerCase() === currentPlan.toLowerCase());
  const creditsRemaining = userProfile?.credits || 0;
  const creditsTotal = currentPlanInfo?.credits || 0;

  const isSetToCancelAtPeriodEnd = () => {
    return currentSubscription?.subscription?.cancelAtPeriodEnd === true;
  };

  const getSubscriptionStatus = () => {
    if (isSetToCancelAtPeriodEnd()) {
      return "Canceling at Period End";
    }

    if (userProfile?.subscriptionStatus) {
      switch (userProfile.subscriptionStatus) {
        case "active": return "Active";
        case "canceled": return "Canceled";
        case "past_due": return "Past Due";
        case "incomplete": return "Incomplete";
        case "trialing": return "Trial";
        case "unpaid": return "Unpaid";
        default: return "Unknown";
      }
    }

    if (currentSubscription?.subscription?.status) {
      switch (currentSubscription.subscription.status) {
        case "active": return "Active";
        case "canceled": return "Canceled";
        case "past_due": return "Past Due";
        case "incomplete": return "Incomplete";
        case "trialing": return "Trial";
        case "unpaid": return "Unpaid";
        default: return "Unknown";
      }
    }

    if (userProfile?.plan && userProfile.plan !== "none") {
      return "Active";
    }

    return "No Subscription";
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
      case "trialing":
        return "bg-emerald-500/15 text-emerald-400";
      case "canceling at period end":
        return "bg-orange-500/15 text-orange-400";
      case "canceled":
      case "past_due":
        return "bg-red-500/15 text-red-400";
      case "incomplete":
        return "bg-amber-500/15 text-amber-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const handleUpgrade = async (planName: string) => {
    if (planName.toLowerCase() === currentPlan.toLowerCase()) {
      setError("You are already subscribed to this plan.");
      return;
    }

    setIsUpgrading(planName);
    setError(null);

    try {
      const plan = plans.find(p => p.name === planName);

      if (!plan || !plan.priceId) {
        throw new Error("Invalid plan selected");
      }

      const result = await createSubscriptionCheckout({
        priceId: plan.priceId,
        successUrl: `${window.location.origin}/dashboard/billing?success=true`,
        cancelUrl: `${window.location.origin}/dashboard/billing?canceled=true`,
        metadata: {
          planName: planName,
          userId: userProfile?._id,
        }
      });

      if (result?.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        throw new Error("Failed to create checkout session - no URL returned");
      }
    } catch (error: unknown) {
      console.error("Error creating checkout:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to start upgrade process. Please try again.";
      setError(errorMessage);
    } finally {
      setIsUpgrading(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel your subscription? You'll still have access until the end of your billing period.")) {
      return;
    }

    try {
      await cancelSubscription({ cancelAtPeriodEnd: true });
      setSuccessMessage("Your subscription has been set to cancel at the end of the current billing period.");
      window.location.reload();
    } catch (error: unknown) {
      console.error("Error canceling subscription:", error);
      setError("Failed to cancel subscription. Please try again.");
    }
  };

  const handleReactivateSubscription = async () => {
    if (!confirm("Are you sure you want to reactivate your subscription? It will continue renewing after the current period.")) {
      return;
    }

    try {
      await reactivateSubscription({});
      setSuccessMessage("Your subscription has been reactivated and will continue after the current period.");
      window.location.reload();
    } catch (error: unknown) {
      console.error("Error reactivating subscription:", error);
      setError("Failed to reactivate subscription. Please try again.");
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
          <div className="space-y-6">
            <div className="h-48 bg-muted rounded"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-foreground">
          Billing & Subscription<span className="text-primary">.</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Manage your subscription and billing information.
        </p>
      </div>

      {/* Debug Section */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-8 bg-muted/50 border border-border rounded-lg p-4">
          <h3 className="text-sm font-bold text-secondary-foreground mb-2">Debug Info (Development Only)</h3>
          <div className="text-xs text-muted-foreground space-y-1">
            <div>User Plan: {userProfile?.plan || 'none'}</div>
            <div>User Subscription Status: {userProfile?.subscriptionStatus || 'none'}</div>
            <div>Current Subscription Status: {currentSubscription?.subscription?.status || 'none'}</div>
            <div>Has Current Subscription: {currentSubscription?.hasSubscription ? 'true' : 'false'}</div>
            <div>Computed Status: {getSubscriptionStatus()}</div>
            <div>Cancel Button Should Show: {currentSubscription?.subscription?.status === "active" && !isSetToCancelAtPeriodEnd() ? 'YES' : 'NO'}</div>
            <div>Cancel At Period End: {isSetToCancelAtPeriodEnd() ? 'YES' : 'NO'}</div>
            <div>Reactivate Button Should Show: {isSetToCancelAtPeriodEnd() ? 'YES' : 'NO'}</div>
            <div>Subscription Object: {JSON.stringify(currentSubscription?.subscription || {}, null, 2)}</div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
          <div className="flex">
            <CheckIcon className="h-5 w-5 text-emerald-400 mr-2 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-emerald-400">Success</h3>
              <p className="text-sm text-emerald-400/80 mt-1">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-400">Error</h3>
              <p className="text-sm text-red-400/80 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Current Plan */}
      <div className="rounded-xl p-6 bg-card/60 border border-border/50 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">Current Plan</h2>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(getSubscriptionStatus())}`}>
            {getSubscriptionStatus()}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-2xl font-bold text-foreground">{currentPlanInfo?.name || "None"}</h3>
            <p className="text-muted-foreground">
              {currentPlanInfo ? `$${currentPlanInfo.price}/month` : "No active subscription"}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Credits Remaining</h4>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((creditsRemaining / creditsTotal) * 100, 100)}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-foreground">
                {creditsRemaining}/{creditsTotal}
              </span>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Next Billing</h4>
            <p className="text-sm text-foreground">
              {currentSubscription?.subscription?.currentPeriodEnd
                ? new Date(currentSubscription.subscription.currentPeriodEnd).toLocaleDateString()
                : "N/A"
              }
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {currentSubscription?.subscription?.status === "active" && !isSetToCancelAtPeriodEnd() && (
            <button
              onClick={handleCancelSubscription}
              className="px-4 py-2 text-sm font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
            >
              Cancel Subscription
            </button>
          )}

          {isSetToCancelAtPeriodEnd() && (
            <>
              <div className="px-4 py-2 text-sm bg-orange-500/10 border border-orange-500/20 rounded-lg text-orange-400 text-center flex items-center justify-center">
                Your subscription will cancel on{" "}
                {currentSubscription?.subscription?.currentPeriodEnd
                  ? new Date(currentSubscription.subscription.currentPeriodEnd).toLocaleDateString()
                  : "the next billing date"
                }
              </div>
              <button
                onClick={handleReactivateSubscription}
                className="px-4 py-2 text-sm font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg transition-colors"
              >
                Keep Subscription Active
              </button>
            </>
          )}
          {(() => {
            let nextPlan = "";
            let nextPlanName = "";

            if (currentPlan === "none" || !currentPlan) {
              nextPlan = "Starter";
              nextPlanName = "Get Started";
            } else if (currentPlan === "starter") {
              nextPlan = "Pro";
              nextPlanName = "Upgrade to Pro";
            } else if (currentPlan === "pro") {
              nextPlan = "Hired";
              nextPlanName = "Upgrade to Hired";
            }

            if (nextPlan) {
              return (
                <button
                  onClick={() => handleUpgrade(nextPlan)}
                  disabled={isUpgrading === nextPlan}
                  className="btn-primary flex items-center space-x-2 disabled:opacity-50"
                >
                  <ArrowUpIcon className="w-4 h-4" />
                  <span>
                    {isUpgrading === nextPlan ? "Processing..." : nextPlanName}
                  </span>
                </button>
              );
            }
            return null;
          })()}
        </div>
      </div>

      {/* Available Plans */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-6">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl p-6 bg-card/60 border border-border/50 relative ${plan.recommended ? 'ring-2 ring-primary' : ''
                }`}
            >
              {plan.recommended && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                    Recommended
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-foreground">${plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{plan.credits} credits included</p>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckIcon className="w-5 h-5 text-emerald-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade(plan.name)}
                className={`w-full ${plan.name.toLowerCase() === currentPlan.toLowerCase()
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'btn-primary'
                  } disabled:opacity-50`}
                disabled={plan.name.toLowerCase() === currentPlan.toLowerCase() || isUpgrading === plan.name}
              >
                {isUpgrading === plan.name ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                    <span>Processing...</span>
                  </div>
                ) : plan.name.toLowerCase() === currentPlan.toLowerCase() ? (
                  'Current Plan'
                ) : (
                  `Upgrade to ${plan.name}`
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <div className="rounded-xl p-6 bg-card/60 border border-border/50 overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">Transaction History</h2>
          <Link
            href="/dashboard/billing/invoices"
            className="text-primary hover:text-primary/80 text-sm font-medium"
          >
            View all invoices
          </Link>
        </div>

        {!paymentHistoryData ? (
          <div className="text-center py-8">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-1/4 mx-auto mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/3 mx-auto"></div>
            </div>
          </div>
        ) : paymentHistory.length === 0 ? (
          <div className="text-center py-8">
            <CreditCardIcon className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">No transactions yet</p>
            <p className="text-sm text-muted-foreground/70 mt-2">
              Your payment history will appear here once you make your first purchase.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Credits</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paymentHistory.map((transaction: { _id: string; createdAt: number; description?: string; type: string; currency?: string; amount: number; creditsGranted?: number; metadata?: { creditsAdded?: number; credits?: number }; status: string }) => (
                  <tr key={transaction._id} className="hover:bg-muted/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {formatDate(transaction.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-foreground">
                        {transaction.description ||
                          (transaction.type === 'subscription' ? 'Subscription Payment' :
                            transaction.type === 'credits' ? 'Credit Purchase' :
                              'Payment')}
                      </div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {transaction.type} &middot; {transaction.currency?.toUpperCase() || 'USD'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {transaction.creditsGranted ? `+${transaction.creditsGranted}` :
                        transaction.metadata?.creditsAdded ? `+${transaction.metadata.creditsAdded}` :
                          transaction.metadata?.credits ? `+${transaction.metadata.credits}` :
                            '\u2014'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${transaction.status === 'succeeded'
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : transaction.status === 'pending'
                            ? 'bg-amber-500/15 text-amber-400'
                            : transaction.status === 'failed'
                              ? 'bg-red-500/15 text-red-400'
                              : transaction.status === 'canceled'
                                ? 'bg-muted text-muted-foreground'
                                : transaction.status === 'refunded'
                                  ? 'bg-blue-500/15 text-blue-400'
                                  : 'bg-muted text-muted-foreground'
                          }`}
                      >
                        {transaction.status === 'succeeded' && <CheckIcon className="w-3 h-3 mr-1" />}
                        {transaction.status === 'failed' && <XMarkIcon className="w-3 h-3 mr-1" />}
                        {transaction.status === 'canceled' && <XMarkIcon className="w-3 h-3 mr-1" />}
                        {transaction.status === 'succeeded' ? 'Completed' :
                          transaction.status === 'pending' ? 'Pending' :
                            transaction.status === 'failed' ? 'Failed' :
                              transaction.status === 'canceled' ? 'Canceled' :
                                transaction.status === 'refunded' ? 'Refunded' : 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {(() => {
                        if (transaction.status === 'succeeded') {
                          return (
                            <Link
                              href={`/dashboard/billing/receipts/${transaction._id}`}
                              className="text-primary hover:text-primary/80 font-medium"
                            >
                              View Receipt
                            </Link>
                          );
                        }

                        if (transaction.status === 'pending') {
                          return (
                            <span className="text-amber-400 text-xs">
                              Processing...
                            </span>
                          );
                        }

                        if (transaction.status === 'failed') {
                          return (
                            <span className="text-red-400 text-xs">
                              Payment failed
                            </span>
                          );
                        }

                        return (
                          <span className="text-muted-foreground text-xs">
                            {'\u2014'}
                          </span>
                        );
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
