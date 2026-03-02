"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convexApi";

interface DebugResult {
    success: boolean;
    error?: string;
    authUserExists?: boolean;
    authUserId?: string;
    emailVerified?: number;
    userProfileExists?: boolean;
    userProfileId?: string;
    message?: string;
    authAccountsCount?: number;
    accountDetails?: Array<{
        id: string;
        provider: string;
        providerAccountId: string;
        userId: string;
    }>;
    providerCounts?: Record<string, number>;
    potentialIssues?: {
        multiplePasswordAccounts: boolean;
        noPasswordAccount: boolean;
        orphanedAccounts: boolean;
    };
}

export default function DebugUserPage() {
    const [email, setEmail] = useState("");
    const [result, setResult] = useState<DebugResult | null>(null);
    const [loading, setLoading] = useState(false);

    const debugUserStatus = useMutation(api.userHelpers.debugUserStatus);
    const debugAuthAccounts = useMutation(api.userHelpers.debugAuthAccounts);
    const fixProviderNames = useMutation(api.userHelpers.fixProviderNames);
    const clearAllUserData = useMutation(api.userHelpers.clearAllUserData);

    const handleDebug = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        try {
            // Run both debug functions
            const [userResult, accountsResult] = await Promise.all([
                debugUserStatus({ email }),
                debugAuthAccounts({ email })
            ]);

            // Combine results
            const combinedResult = {
                ...userResult,
                ...accountsResult
            };

            setResult(combinedResult);
            console.log("Debug result:", combinedResult);
        } catch (error) {
            console.error("Debug error:", error);
            setResult({
                success: false,
                error: error instanceof Error ? error.message : String(error)
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Debug User Status
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Check if your email exists in the database
                    </p>
                </div>

                <form onSubmit={handleDebug} className="mt-8 space-y-6">
                    <div>
                        <label htmlFor="email" className="sr-only">
                            Email address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                            placeholder="Enter your email address"
                        />
                    </div>

                    <div className="space-y-3">
                        <button
                            type="submit"
                            disabled={loading || !email}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Checking..." : "Debug User Status"}
                        </button>

                        {result?.potentialIssues?.noPasswordAccount && (
                            <button
                                type="button"
                                onClick={async () => {
                                    setLoading(true);
                                    try {
                                        const fixResult = await fixProviderNames({ email });
                                        console.log("Fix result:", fixResult);
                                        // Re-run debug after fix
                                        const [userResult, accountsResult] = await Promise.all([
                                            debugUserStatus({ email }),
                                            debugAuthAccounts({ email })
                                        ]);
                                        setResult({ ...userResult, ...accountsResult });
                                    } catch (error) {
                                        console.error("Fix error:", error);
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                🔧 Fix Provider Names Issue
                            </button>
                        )}

                        {result?.authUserExists && (
                            <button
                                type="button"
                                onClick={async () => {
                                    if (!window.confirm(`Are you sure you want to DELETE ALL DATA for ${email}? This cannot be undone!`)) {
                                        return;
                                    }
                                    setLoading(true);
                                    try {
                                        const clearResult = await clearAllUserData({ confirmEmail: email });
                                        console.log("Clear result:", clearResult);
                                        setResult(clearResult);
                                    } catch (error) {
                                        console.error("Clear error:", error);
                                        setResult({
                                            success: false,
                                            error: error instanceof Error ? error.message : String(error)
                                        });
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                🗑️ Clear All Data & Start Fresh
                            </button>
                        )}
                    </div>
                </form>

                {result && (
                    <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                Debug Results
                            </h3>
                            <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                                {typeof result === 'object' && result !== null ? JSON.stringify(result, null, 2) : String(result)}
                            </pre>
                        </div>
                    </div>
                )}

                <div className="text-center">
                    <a
                        href="/login"
                        className="text-purple-600 hover:text-purple-500 text-sm"
                    >
                        ← Back to Login
                    </a>
                </div>
            </div>
        </div>
    );
} 