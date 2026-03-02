"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuthActions } from "@convex-dev/auth/react";

import { ApplyingMyselfLogo } from "@/components/ApplyingMyselfLogo";
import { RedirectIfAuthenticated } from "@/components/RedirectIfAuthenticated";

function RegisterForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isReturningUser, setIsReturningUser] = useState(false);

  const { signIn } = useAuthActions();
  const router = useRouter();
  const searchParams = useSearchParams();


  useEffect(() => {
    // Check if user is returning for verification
    const returning = searchParams.get("returning");
    const email = searchParams.get("email");

    if (returning === "true") {
      setIsReturningUser(true);
      if (email) {
        setFormData(prev => ({ ...prev, email }));
      }
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validation
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      setIsLoading(false);
      return;
    }

    // Only check password confirmation for new users
    if (!isReturningUser && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      await signIn("password", {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        flow: "signUp"
      });

      // With email verification enabled, user won't be signed in yet
      // Show verification message instead of redirecting
      router.push(`/verify-email-sent?email=${encodeURIComponent(formData.email)}`);
    } catch (error: unknown) {
      console.error("Registration error:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("User already exists")) {
        if (isReturningUser) {
          setError("This will generate a new verification code for your existing account. Please use the same password you used when you first signed up.");
        } else {
          setError("An account with this email already exists. Please sign in instead.");
        }
      } else if (errorMessage.includes("Invalid email")) {
        setError("Please enter a valid email address.");
      } else if (errorMessage.includes("Password")) {
        setError("Password must be at least 8 characters long.");
      } else {
        setError("Failed to create account. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RedirectIfAuthenticated>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="flex justify-center">
              <ApplyingMyselfLogo size="lg" />
            </div>
            <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
              {isReturningUser ? "Get new verification code" : "Create your account"}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {isReturningUser ? (
                <>
                  Enter your email and password to receive a fresh verification code
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-medium text-purple-600 hover:text-purple-500 transition-colors"
                  >
                    Sign in here
                  </Link>
                </>
              )}
            </p>
          </div>

          {isReturningUser && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Getting a new verification code
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      Enter the same email and password you used when you first signed up.
                      This will generate a fresh verification code and send it to your email.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              {!isReturningUser && (
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Full name
                  </label>
                  <div className="mt-1">
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete={isReturningUser ? "current-password" : "new-password"}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all"
                    placeholder={isReturningUser ? "Enter your existing password" : "Create a password"}
                  />
                </div>
                <p className={`mt-1 text-sm ${formData.password.length >= 8 || formData.password.length === 0 ? 'text-gray-500' : 'text-red-500'}`}>
                  {isReturningUser ? "Enter the same password you used when you first signed up" : "Must be at least 8 characters long"}
                </p>
              </div>

              {!isReturningUser && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm password
                  </label>
                  <div className="mt-1">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all"
                      placeholder="Confirm your password"
                    />
                  </div>
                </div>
              )}

              {!isReturningUser && (
                <div className="flex items-center">
                  <input
                    id="agree-terms"
                    name="agree-terms"
                    type="checkbox"
                    required
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-900">
                    I agree to the{" "}
                    <Link href="/terms" className="text-purple-600 hover:text-purple-500 transition-colors">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-purple-600 hover:text-purple-500 transition-colors">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    isReturningUser ? "Sending new code..." : "Creating account..."
                  ) : (
                    isReturningUser ? "Send new verification code" : "Create account"
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-8 text-center">
            <Link
              href={isReturningUser ? "/login" : "/"}
              className="text-purple-600 hover:text-purple-500 font-medium transition-colors"
            >
              {isReturningUser ? "← Back to login" : "← Back to home"}
            </Link>
          </div>
        </div>
      </div>
    </RedirectIfAuthenticated>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div></div>}>
      <RegisterForm />
    </Suspense>
  );
}