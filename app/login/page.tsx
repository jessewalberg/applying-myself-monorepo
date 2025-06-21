"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthActions } from "@convex-dev/auth/react";
import { ApplyingMyselfLogo } from "@/components/ApplyingMyselfLogo";
import { RedirectIfAuthenticated } from "@/components/RedirectIfAuthenticated";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { signIn } = useAuthActions();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setError("");
    setIsLoading(true);

    try {
      await signIn("password", {
        email,
        password,
        flow: "signIn"
      });

      // If sign in was successful, redirect to dashboard
      router.push("/dashboard");
    } catch (error: unknown) {
      console.error("Login error:", error);

      const errorMessage = error instanceof Error ? error.message : String(error);

      // Check if this is an email verification error (user needs to verify their email)
      if (errorMessage.includes("verification") || errorMessage.includes("verify") || errorMessage.includes("not verified")) {
        // Redirect to verification page
        router.push(`/verify-email-sent?email=${encodeURIComponent(email)}`);
        return;
      }

      if (errorMessage.includes("Invalid credentials") ||
        errorMessage.includes("wrong password") ||
        errorMessage.includes("incorrect password")) {
        setError("Invalid email or password");
      } else if (errorMessage.includes("User not found")) {
        setError("No account found with this email address");
      } else {
        setError("Failed to sign in. Please try again.");
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
              Welcome back
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Don&rsquo;t have an account?{" "}
              <Link
                href="/register"
                className="font-medium text-purple-600 hover:text-purple-500 transition-colors"
              >
                Sign up for free
              </Link>
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link
                    href="/forgot-password"
                    className="font-medium text-purple-600 hover:text-purple-500 transition-colors"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="text-purple-600 hover:text-purple-500 font-medium transition-colors"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </RedirectIfAuthenticated>
  );
}