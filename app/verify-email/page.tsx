"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";

import { ApplyingMyselfLogo } from "@/components/ApplyingMyselfLogo";

function VerifyEmailForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const urlCode = searchParams.get("code");
    const urlEmail = searchParams.get("email");

    const [verificationStatus, setVerificationStatus] = useState<
        "loading" | "success" | "error" | "invalid" | "manual"
    >("loading");
    const [message, setMessage] = useState("");
    const [manualCode, setManualCode] = useState("");
    const [manualEmail, setManualEmail] = useState(urlEmail || "");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { signIn } = useAuthActions();

    const handleVerification = useCallback(async (code: string, email: string) => {
        setIsSubmitting(true);
        try {
            // Use Convex Auth's built-in email verification flow
            const formData = new FormData();
            formData.append("code", code);
            formData.append("email", email);
            formData.append("flow", "email-verification");

            // Verify the email - this should NOT sign the user in automatically
            // According to Convex Auth docs, verification is separate from sign-in
            await signIn("password", formData);

            // Verification is complete - user should now sign in separately
            setVerificationStatus("success");
            setMessage("Email verified successfully! You can now sign in to your account.");

            // Redirect to login after 3 seconds
            setTimeout(() => {
                router.push("/login?verified=true");
            }, 3000);
        } catch (error) {
            setVerificationStatus("error");

            // Provide more specific error messages
            let errorMessage = "Verification failed";
            if (error instanceof Error) {
                if (error.message.includes("Could not verify code")) {
                    errorMessage = "This verification code is invalid, expired, or has already been used. Please get a new verification code.";
                } else if (error.message.includes("User not found")) {
                    errorMessage = "No account found with this email address. Please check your email or create a new account.";
                } else if (error.message.includes("verification")) {
                    errorMessage = "Verification failed. The code may be incorrect or expired.";
                } else {
                    errorMessage = error.message;
                }
            }

            setMessage(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    }, [signIn, router]);

    useEffect(() => {
        if (urlCode && urlEmail) {
            // Auto-verify if code and email are in URL
            handleVerification(urlCode, urlEmail);
        } else {
            // Show manual entry form
            setVerificationStatus("manual");
        }
    }, [urlCode, urlEmail, handleVerification]);

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualCode || !manualEmail) {
            setMessage("Please enter both email and verification code");
            return;
        }
        await handleVerification(manualCode, manualEmail);
    };

    const handleGoToRegister = () => {
        const emailToUse = manualEmail || urlEmail;
        router.push(`/register?email=${encodeURIComponent(emailToUse || '')}&returning=true`);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <ApplyingMyselfLogo size="lg" />
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Email Verification
                    </h2>
                </div>

                <div className="bg-white p-8 rounded-lg shadow-md">
                    {verificationStatus === "loading" && (
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Verifying your email address...</p>
                        </div>
                    )}

                    {verificationStatus === "manual" && (
                        <div className="text-center">
                            <div className="rounded-full h-12 w-12 bg-blue-100 mx-auto flex items-center justify-center">
                                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </div>
                            <h3 className="mt-4 text-lg font-medium text-gray-900">Enter Verification Code</h3>
                            <p className="mt-2 text-sm text-gray-600">
                                Enter the 8-digit code sent to your email address
                            </p>

                            {message && (
                                <div className="mt-4 p-3 bg-red-50 border-red-200 rounded-lg">
                                    <p className="text-sm text-red-600">
                                        {message}
                                    </p>
                                </div>
                            )}

                            <form onSubmit={handleManualSubmit} className="mt-6 space-y-4">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        value={manualEmail}
                                        onChange={(e) => setManualEmail(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                                        placeholder="Enter your email"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                                        Verification Code
                                    </label>
                                    <input
                                        id="code"
                                        type="text"
                                        required
                                        maxLength={8}
                                        value={manualCode}
                                        onChange={(e) => setManualCode(e.target.value.replace(/\D/g, ''))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-center text-lg font-mono tracking-widest"
                                        placeholder="12345678"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">Enter the 8-digit code from your email</p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || !manualCode || !manualEmail}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? "Verifying..." : "Verify Email"}
                                </button>
                            </form>

                            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-amber-900 mb-2">💡 Code not working?</h4>
                                <p className="text-sm text-amber-800 mb-3">
                                    Verification codes expire after 24 hours. If your code isn&rsquo;t working, get a fresh one by signing up again with the same email and password.
                                </p>
                                <button
                                    onClick={handleGoToRegister}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                                >
                                    Get fresh verification code
                                </button>
                            </div>
                        </div>
                    )}

                    {verificationStatus === "success" && (
                        <div className="text-center">
                            <div className="rounded-full h-12 w-12 bg-green-100 mx-auto flex items-center justify-center">
                                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                            </div>
                            <h3 className="mt-4 text-lg font-medium text-green-900">Email Verified!</h3>
                            <p className="mt-2 text-sm text-green-700">{message}</p>
                            {(manualEmail || urlEmail) && (
                                <p className="mt-2 text-sm text-gray-600">
                                    Account: <span className="font-medium">{manualEmail || urlEmail}</span>
                                </p>
                            )}
                            <p className="mt-4 text-sm text-gray-500">
                                Redirecting to login page in 3 seconds...
                            </p>
                            <button
                                onClick={() => router.push("/login?verified=true")}
                                className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                            >
                                Continue to Login
                            </button>
                        </div>
                    )}

                    {verificationStatus === "error" && (
                        <div className="text-center">
                            <div className="rounded-full h-12 w-12 bg-red-100 mx-auto flex items-center justify-center">
                                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </div>
                            <h3 className="mt-4 text-lg font-medium text-red-900">Verification Failed</h3>
                            <p className="mt-2 text-sm text-red-700">{message}</p>

                            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-amber-900 mb-2">🔄 What to do next</h4>
                                <p className="text-sm text-amber-800 mb-3">
                                    {message.includes("invalid, expired, or has already been used")
                                        ? "Your verification code has expired or was already used. Get a fresh code by signing up again with the same email and password."
                                        : "The verification code may have expired or been entered incorrectly. The most reliable way to get a new code is to sign up again with the same email and password."}
                                </p>
                            </div>

                            <div className="mt-6 space-y-3">
                                <button
                                    onClick={() => setVerificationStatus("manual")}
                                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                                >
                                    Try Again
                                </button>

                                <button
                                    onClick={handleGoToRegister}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                                >
                                    Sign up again for new code
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div></div>}>
            <VerifyEmailForm />
        </Suspense>
    );
} 