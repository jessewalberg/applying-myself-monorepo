"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convexApi";
import { ApplyingMyselfLogo } from "@/components/ApplyingMyselfLogo";

function VerifyEmailSentForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const email = searchParams.get("email");
    const [isChecking, setIsChecking] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");

    const checkVerificationStatus = useMutation(api.emailResend.checkVerificationStatus);

    const handleCheckStatus = async () => {
        if (!email) return;

        setIsChecking(true);
        setStatusMessage("");

        try {
            console.log("🔍 Checking verification status...");

            const result = await checkVerificationStatus({ email });

            if (result.success) {
                setStatusMessage("✅ " + result.message);

                // Redirect to register after showing the message
                setTimeout(() => {
                    router.push(`/register?email=${encodeURIComponent(email)}&returning=true`);
                }, 2000);
            } else {
                setStatusMessage("❌ " + (result.message || "Unable to check account status"));
            }
        } catch (error: unknown) {
            console.error("Status check error:", error);
            const errorMessage = error instanceof Error ? error.message : "Failed to check account status. Please try again.";
            setStatusMessage(`❌ ${errorMessage}`);
        } finally {
            setIsChecking(false);
        }
    };

    const handleGoToRegister = () => {
        router.push(`/register?email=${encodeURIComponent(email || '')}&returning=true`);
    };

    const handleBackToLogin = () => {
        router.push("/login");
    };

    const handleManualEntry = () => {
        router.push(`/verify-email${email ? `?email=${encodeURIComponent(email)}` : ''}`);
    };

    if (!email) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <div className="flex justify-center mb-4">
                            <ApplyingMyselfLogo size="lg" />
                        </div>
                        <h2 className="mt-6 text-3xl font-bold text-gray-900">
                            Invalid Request
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            No email address provided. Please try signing up again.
                        </p>
                        <button
                            onClick={handleBackToLogin}
                            className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                        >
                            Back to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <ApplyingMyselfLogo size="lg" />
                    </div>
                    <div className="mx-auto h-12 w-12 text-purple-600 mb-4">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h2 className="mt-6 text-3xl font-bold text-gray-900">
                        Check your email
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        We&rsquo;ve sent a verification code to <strong>{email}</strong>
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                        Check your spam folder if you don&rsquo;t see it in your inbox.
                    </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-blue-900 mb-2">What&rsquo;s next?</h3>
                    <ol className="text-sm text-blue-700 space-y-2">
                        <li className="flex items-start">
                            <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center mr-2 mt-0.5">1</span>
                            Check your email inbox (and spam folder)
                        </li>
                        <li className="flex items-start">
                            <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center mr-2 mt-0.5">2</span>
                            Find the 8-digit verification code
                        </li>
                        <li className="flex items-start">
                            <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center mr-2 mt-0.5">3</span>
                            Click the link or enter the code manually
                        </li>
                    </ol>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-amber-900 mb-2">💡 Didn&rsquo;t receive the email?</h3>
                    <p className="text-sm text-amber-800 mb-3">
                        If you don&rsquo;t receive the verification email, the most reliable way to get a new code is to sign up again with the same email and password.
                    </p>
                    <p className="text-xs text-amber-700">
                        This will generate a fresh verification code and send it to your email address.
                    </p>
                </div>

                <div className="space-y-4">
                    {statusMessage && (
                        <div className={`p-3 rounded-md text-sm ${statusMessage.includes("✅")
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : statusMessage.includes("⚠️")
                                ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                            }`}>
                            {statusMessage}
                        </div>
                    )}

                    <button
                        onClick={handleGoToRegister}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                        Sign up again to get new verification code
                    </button>

                    <button
                        onClick={handleManualEntry}
                        className="w-full flex justify-center py-2 px-4 border border-purple-300 rounded-md shadow-sm text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                        Enter verification code manually
                    </button>

                    <button
                        onClick={handleCheckStatus}
                        disabled={isChecking}
                        className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isChecking ? "Checking..." : "Check account status"}
                    </button>

                    <button
                        onClick={handleBackToLogin}
                        className="w-full flex justify-center py-2 px-4 text-sm font-medium text-purple-600 hover:text-purple-500"
                    >
                        Back to login
                    </button>
                </div>

                <div className="text-center">
                    <p className="text-xs text-gray-500">
                        The verification code will expire in 24 hours.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function VerifyEmailSentPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div></div>}>
            <VerifyEmailSentForm />
        </Suspense>
    );
} 