"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from '@applyingmyself/convex-client';
import Link from "next/link";
import {
    ArrowLeftIcon,
    DocumentTextIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    CreditCardIcon
} from "@heroicons/react/24/outline";

export default function InvoicesPage() {
    const [profileEnsured, setProfileEnsured] = useState(false);
    const ensureUserProfile = useMutation(api.userHelpers.ensureUserProfile);

    useEffect(() => {
        ensureUserProfile({}).then(() => setProfileEnsured(true));
    }, [ensureUserProfile]);

    // Fetch payment history
    const paymentHistoryData = useQuery(api.billing.getPaymentHistory, profileEnsured ? { limit: 50 } : "skip");
    const userProfile = useQuery(api.userHelpers.getUserProfile, profileEnsured ? {} : "skip");

    const paymentHistory = paymentHistoryData?.payments || [];
    const isLoading = !profileEnsured || paymentHistoryData === undefined;

    // Format date helper
    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // Format currency helper
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount / 100); // Stripe amounts are in cents
    };

    // Get status icon
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'succeeded':
                return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
            case 'failed':
                return <XCircleIcon className="w-5 h-5 text-red-500" />;
            case 'pending':
                return <ClockIcon className="w-5 h-5 text-yellow-500" />;
            default:
                return <CreditCardIcon className="w-5 h-5 text-gray-400" />;
        }
    };

    // Get status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'succeeded':
                return 'bg-green-100 text-green-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'canceled':
                return 'bg-gray-100 text-gray-800';
            case 'refunded':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-16 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-8">
                <Link
                    href="/dashboard/billing"
                    className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4"
                >
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Back to Billing
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Payment History & Receipts</h1>
                <p className="mt-1 text-sm text-gray-600">
                    View all your payments, invoices, and download receipts.
                </p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                                <CheckCircleIcon className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Total Payments</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {paymentHistory.filter((p: { status: string }) => p.status === 'succeeded').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                                <CreditCardIcon className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Total Spent</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatCurrency(
                                    paymentHistory
                                        .filter((p: { status: string }) => p.status === 'succeeded')
                                        .reduce((sum: number, p: { amount: number }) => sum + p.amount, 0)
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                                <DocumentTextIcon className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Credits Earned</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {paymentHistory
                                    .filter((p: { status: string }) => p.status === 'succeeded')
                                    .reduce((sum: number, p: { metadata?: { creditsAdded?: number; credits?: number } }) => sum + (p.metadata?.creditsAdded || p.metadata?.credits || 0), 0)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment History Table */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">All Transactions</h2>
                </div>

                {paymentHistory.length === 0 ? (
                    <div className="text-center py-12">
                        <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">No payments yet</p>
                        <p className="text-sm text-gray-400 mt-2">
                            Your payment history will appear here once you make your first purchase.
                        </p>
                        <Link
                            href="/dashboard/billing"
                            className="mt-4 inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            View Plans
                        </Link>
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
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Credits
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Receipt
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paymentHistory.map((transaction: { _id: string; createdAt: number; description?: string; type: string; amount: number; metadata?: { creditsAdded?: number; credits?: number }; status: string }) => (
                                    <tr key={transaction._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatDate(transaction.createdAt)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">
                                                {transaction.description ||
                                                    (transaction.type === 'subscription' ? 'Subscription Payment' :
                                                        transaction.type === 'credits' ? 'Credit Purchase' :
                                                            'Payment')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 capitalize">
                                                {transaction.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {formatCurrency(transaction.amount)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {transaction.metadata?.creditsAdded ? `+${transaction.metadata.creditsAdded}` :
                                                transaction.metadata?.credits ? `+${transaction.metadata.credits}` :
                                                    '—'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {getStatusIcon(transaction.status)}
                                                <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)} capitalize`}>
                                                    {transaction.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {transaction.status === 'succeeded' ? (
                                                <button
                                                    onClick={() => {
                                                        // Generate a simple receipt
                                                        const receiptWindow = window.open('', '_blank');
                                                        if (receiptWindow) {
                                                            receiptWindow.document.write(`
                                <html>
                                  <head>
                                    <title>Receipt - ${transaction._id}</title>
                                    <style>
                                      body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
                                      .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
                                      .details { margin: 20px 0; }
                                      .row { display: flex; justify-content: space-between; margin: 10px 0; }
                                      .total { font-weight: bold; font-size: 1.2em; border-top: 1px solid #333; padding-top: 10px; }
                                    </style>
                                  </head>
                                  <body>
                                    <div class="header">
                                      <h1>Applying Myself</h1>
                                      <h2>Payment Receipt</h2>
                                    </div>
                                    <div class="details">
                                      <div class="row"><span>Receipt ID:</span><span>${transaction._id}</span></div>
                                      <div class="row"><span>Date:</span><span>${formatDate(transaction.createdAt)}</span></div>
                                      <div class="row"><span>Customer:</span><span>${userProfile?.email}</span></div>
                                      <div class="row"><span>Description:</span><span>${transaction.description || 'Payment'}</span></div>
                                      <div class="row"><span>Type:</span><span>${transaction.type}</span></div>
                                      ${transaction.metadata?.creditsAdded ? `<div class="row"><span>Credits:</span><span>+${transaction.metadata.creditsAdded}</span></div>` : ''}
                                      <div class="row total"><span>Amount Paid:</span><span>${formatCurrency(transaction.amount)}</span></div>
                                    </div>
                                    <p style="text-align: center; margin-top: 40px; color: #666; font-size: 0.9em;">
                                      Thank you for your business!
                                    </p>
                                  </body>
                                </html>
                              `);
                                                            receiptWindow.document.close();
                                                        }
                                                    }}
                                                    className="text-purple-600 hover:text-purple-700 font-medium"
                                                >
                                                    View Receipt
                                                </button>
                                            ) : (
                                                <span className="text-gray-400">—</span>
                                            )}
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