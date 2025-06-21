"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convexApi";

const plans = [
  {
    name: "Starter",
    price: 9,
    credits: 50,
  },
  {
    name: "Pro", 
    price: 19,
    credits: 150,
  },
  {
    name: "Hired",
    price: 49,
    credits: 500,
  },
];

export default function BillingSettingsPage() {
  // Convex hooks
  const ensureUserProfile = useMutation(api.userHelpers.ensureUserProfile);
  const [profileEnsured, setProfileEnsured] = useState(false);

  useEffect(() => {
    ensureUserProfile({}).then(() => setProfileEnsured(true));
  }, [ensureUserProfile]);

  // Fetch data from Convex
  const userProfile = useQuery(api.userHelpers.getUserProfile, profileEnsured ? {} : "skip");
  const currentSubscription = useQuery(api.billing.getCurrentSubscription, profileEnsured ? {} : "skip");

  const isLoading = !profileEnsured || userProfile === undefined || currentSubscription === undefined;

  // Get current plan info
  const currentPlan = userProfile?.plan || "none";
  const currentPlanInfo = plans.find(p => p.name.toLowerCase() === currentPlan.toLowerCase());
  const creditsRemaining = userProfile?.credits || 0;

  // Format subscription status
  const getSubscriptionStatus = () => {
    if (userProfile?.subscriptionStatus) {
      switch (userProfile.subscriptionStatus) {
        case "active":
          return "Active";
        case "canceled":
          return "Canceled";
        case "past_due":
          return "Past Due";
        case "incomplete":
          return "Incomplete";
        case "trialing":
          return "Trial";
        case "unpaid":
          return "Unpaid";
        default:
          return "Unknown";
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
        return "text-green-600";
      case "canceled":
      case "past_due":
        return "text-red-600";
      case "incomplete":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="card animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="h-20 bg-gray-200 rounded mb-4"></div>
          <div className="h-10 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Current Plan</h2>
          <p className="text-sm text-gray-600">
            Manage your subscription and billing information.
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">
                {currentPlanInfo?.name || "None"}
              </h3>
              <p className="text-sm text-gray-500">
                {currentPlanInfo ? `${currentPlanInfo.credits} credits per month` : "No active subscription"}
              </p>
              <p className={`text-sm font-medium ${getStatusColor(getSubscriptionStatus())}`}>
                {getSubscriptionStatus()}
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-900">
                {currentPlanInfo ? `$${currentPlanInfo.price}/month` : "$0/month"}
              </p>
              <p className="text-sm text-gray-500">
                {creditsRemaining} credits remaining
              </p>
              {currentSubscription?.subscription?.currentPeriodEnd && (
                <p className="text-xs text-gray-400">
                  Renews {new Date(currentSubscription.subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>

        <Link href="/dashboard/billing" className="btn-primary inline-block">
          View Full Billing Page
        </Link>
      </div>

      <div className="card">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          <p className="text-sm text-gray-600">
            Common billing actions.
          </p>
        </div>

        <div className="space-y-3">
          <Link 
            href="/dashboard/billing#invoices"
            className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors block"
          >
            <h3 className="font-medium text-gray-900">Download Invoice</h3>
            <p className="text-sm text-gray-500">Get your latest billing statement</p>
          </Link>
          
          <Link 
            href="/dashboard/billing"
            className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors block"
          >
            <h3 className="font-medium text-gray-900">Update Payment Method</h3>
            <p className="text-sm text-gray-500">Change your credit card or payment details</p>
          </Link>
          
          <Link 
            href="/dashboard/billing"
            className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors block"
          >
            <h3 className="font-medium text-gray-900">Billing History</h3>
            <p className="text-sm text-gray-500">View all past transactions</p>
          </Link>
        </div>
      </div>

      <div className="card">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Danger Zone</h2>
          <p className="text-sm text-gray-600">
            Irreversible and destructive actions.
          </p>
        </div>

        <div className="border border-red-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-red-900 mb-2">Delete Account</h3>
          <p className="text-sm text-red-700 mb-4">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
} 