'use client';

import { useQuery } from 'convex/react';
import { api, type Id } from '@app/convex-client';
import { useParams, useRouter } from 'next/navigation';

export default function ReceiptDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const paymentId = params.id as Id<'payments'>;

    const paymentData = useQuery(api.billing.getPaymentHistory, { limit: 100 });
    const payment = paymentData?.payments?.find((p: { _id: string }) => p._id === paymentId);

    if (!paymentData) {
        return (
            <div className="p-6">
                <div className="animate-pulse">Loading receipt...</div>
            </div>
        );
    }

    if (!payment) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Receipt Not Found</h1>
                <p className="text-gray-600 mb-4">
                    The requested receipt could not be found or you do not have permission to view it.
                </p>
                <button
                    onClick={() => router.push('/dashboard/billing/receipts')}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Back to Receipts
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <div className="mb-6">
                <button
                    onClick={() => router.push('/dashboard/billing/receipts')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-4 inline-flex items-center"
                >
                    ← Back to Receipts
                </button>
                <h1 className="text-2xl font-bold">
                    Receipt #{payment.stripeInvoiceId?.slice(-8) || payment._id.slice(-8)}
                </h1>
            </div>

            <div className="bg-white border rounded-lg p-6 space-y-6">
                <div className="border-b pb-4">
                    <h2 className="text-lg font-semibold mb-3">Payment Details</h2>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-500">Description:</span>
                            <p className="font-medium">{payment.description || `${payment.type} payment`}</p>
                        </div>
                        <div>
                            <span className="text-gray-500">Amount:</span>
                            <p className="font-medium">${(payment.amount / 100).toFixed(2)}</p>
                        </div>
                        <div>
                            <span className="text-gray-500">Date:</span>
                            <p className="font-medium">
                                {new Date(payment.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                        <div>
                            <span className="text-gray-500">Status:</span>
                            <p className="font-medium text-green-600 capitalize">{payment.status}</p>
                        </div>
                        <div>
                            <span className="text-gray-500">Type:</span>
                            <p className="font-medium capitalize">{payment.type}</p>
                        </div>
                        <div>
                            <span className="text-gray-500">Currency:</span>
                            <p className="font-medium">{payment.currency?.toUpperCase() || 'USD'}</p>
                        </div>
                    </div>
                </div>

                {payment.stripeInvoiceId && (
                    <div className="border-b pb-4">
                        <h2 className="text-lg font-semibold mb-3">Stripe Information</h2>
                        <div className="text-sm">
                            <p><span className="text-gray-500">Invoice ID:</span> {payment.stripeInvoiceId}</p>
                            {payment.stripePaymentIntentId && (
                                <p><span className="text-gray-500">Payment Intent:</span> {payment.stripePaymentIntentId}</p>
                            )}
                        </div>
                    </div>
                )}

                <div className="flex gap-3">
                    {payment.stripeInvoiceId && (
                        <a
                            href={`https://dashboard.stripe.com/invoices/${payment.stripeInvoiceId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm font-medium"
                        >
                            View on Stripe
                        </a>
                    )}
                    <button
                        onClick={() => window.print()}
                        className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm font-medium"
                    >
                        Print Receipt
                    </button>
                </div>
            </div>
        </div>
    );
} 
