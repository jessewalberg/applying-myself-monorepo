"use client";

import Link from "next/link";

export default function BillingSettingsPage() {
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
              <h3 className="font-medium text-gray-900">Free Plan</h3>
              <p className="text-sm text-gray-500">10 credits per month</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-900">$0/month</p>
              <p className="text-sm text-gray-500">Current plan</p>
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
          <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <h3 className="font-medium text-gray-900">Download Invoice</h3>
            <p className="text-sm text-gray-500">Get your latest billing statement</p>
          </button>
          <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <h3 className="font-medium text-gray-900">Update Payment Method</h3>
            <p className="text-sm text-gray-500">Change your credit card or payment details</p>
          </button>
          <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <h3 className="font-medium text-gray-900">Billing History</h3>
            <p className="text-sm text-gray-500">View all past transactions</p>
          </button>
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