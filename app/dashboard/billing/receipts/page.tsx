'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convexApi';

export default function ReceiptsPage() {
    const paymentData = useQuery(api.billing.getPaymentHistory, { limit: 50 });

    if (!paymentData) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-6">Receipts</h1>
                <div className="animate-pulse">Loading receipts...</div>
            </div>
        );
    }

    // Get payment history as array (same pattern as billing page)
    const paymentHistory = paymentData?.payments || [];

    // Filter to only successful payments (these are the receipts)
    const receipts = paymentHistory.filter((payment: { status: string }) =>
        payment.status === 'succeeded'
    );

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Receipts</h1>

            {receipts.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <p className="text-gray-600">No receipts found.</p>
                    <p className="text-sm text-gray-500 mt-2">
                        Receipts will appear here after successful payments.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {receipts.map((payment: { _id: string; stripeInvoiceId?: string; description?: string; type: string; amount: number; createdAt: number }) => (
                        <div
                            key={payment._id}
                            className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold">
                                        Receipt #{payment.stripeInvoiceId?.slice(-8) || payment._id.slice(-8)}
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        {payment.description || `${payment.type} payment`} - ${(payment.amount / 100).toFixed(2)}
                                    </p>
                                    <p className="text-gray-500 text-xs">
                                        {new Date(payment.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <a
                                        href={`/dashboard/billing/receipts/${payment._id}`}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                        View Details
                                    </a>
                                    {payment.stripeInvoiceId && (
                                        <a
                                            href={`https://dashboard.stripe.com/invoices/${payment.stripeInvoiceId}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-green-600 hover:text-green-800 text-sm font-medium"
                                        >
                                            View on Stripe
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
} 