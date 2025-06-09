"use client";

import Link from "next/link";
import { CreditCardIcon, CheckIcon, XMarkIcon, ArrowUpIcon } from "@heroicons/react/24/outline";

const plans = [
  {
    name: "Starter",
    price: 9,
    credits: 100,
    features: [
      "100 Credits per month",
      "Cover letter generation",
      "Resume uploads",
      "Job application tracking",
      "Email support"
    ],
    recommended: false,
  },
  {
    name: "Pro",
    price: 29,
    credits: 300,
    features: [
      "300 Credits per month",
      "Advanced cover letter templates",
      "Resume optimization tips",
      "Interview preparation",
      "Priority support",
      "Analytics dashboard"
    ],
    recommended: true,
  },
  {
    name: "Enterprise",
    price: 99,
    credits: 1000,
    features: [
      "1000 Credits per month",
      "Custom templates",
      "API access",
      "Team collaboration",
      "Dedicated support",
      "Custom integrations"
    ],
    recommended: false,
  },
];

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: "completed" | "pending" | "failed";
}

export default function BillingPage() {
  // Mock data - will be replaced with real data from Convex
  const currentPlan = "Pro";
  const creditsRemaining = 245;
  const creditsTotal = 300;
  const nextBillingDate = "2024-02-15";
  
  const transactions: Transaction[] = [
    {
      id: "1",
      date: "2024-01-15",
      description: "Pro Plan - Monthly",
      amount: 29,
      status: "completed"
    },
    {
      id: "2",
      date: "2023-12-15",
      description: "Pro Plan - Monthly",
      amount: 29,
      status: "completed"
    },
  ];

  const handleUpgrade = (planName: string) => {
    // TODO: Implement Stripe checkout
    console.log("Upgrading to", planName);
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Billing & Subscription</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your subscription and billing information.
        </p>
      </div>

      {/* Current Plan */}
      <div className="card mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Current Plan</h2>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            Active
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{currentPlan}</h3>
            <p className="text-gray-600">
              ${plans.find(p => p.name === currentPlan)?.price}/month
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Credits Remaining</h4>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full"
                  style={{ width: `${(creditsRemaining / creditsTotal) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {creditsRemaining}/{creditsTotal}
              </span>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Next Billing</h4>
            <p className="text-sm text-gray-900">{nextBillingDate}</p>
          </div>
        </div>

        <div className="mt-6 flex space-x-3">
          <Link
            href="/dashboard/billing/manage"
            className="btn-secondary"
          >
            Manage Subscription
          </Link>
          <Link
            href="/dashboard/billing/upgrade"
            className="btn-primary flex items-center space-x-2"
          >
            <ArrowUpIcon className="w-4 h-4" />
            <span>Upgrade Plan</span>
          </Link>
        </div>
      </div>

      {/* Available Plans */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`card relative ${
                plan.recommended ? 'ring-2 ring-purple-500' : ''
              }`}
            >
              {plan.recommended && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-600 text-white">
                    Recommended
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{plan.credits} credits included</p>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckIcon className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade(plan.name)}
                className={`w-full ${
                  plan.name === currentPlan
                    ? 'btn-secondary cursor-not-allowed'
                    : 'btn-primary'
                }`}
                disabled={plan.name === currentPlan}
              >
                {plan.name === currentPlan ? 'Current Plan' : `Upgrade to ${plan.name}`}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
          <Link
            href="/dashboard/billing/invoices"
            className="text-purple-600 hover:text-purple-700 text-sm font-medium"
          >
            View all invoices
          </Link>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <CreditCardIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No transactions yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${transaction.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          transaction.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : transaction.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {transaction.status === 'completed' && <CheckIcon className="w-3 h-3 mr-1" />}
                        {transaction.status === 'failed' && <XMarkIcon className="w-3 h-3 mr-1" />}
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </span>
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