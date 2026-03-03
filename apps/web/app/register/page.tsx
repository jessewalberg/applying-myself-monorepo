"use client";

import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import { ApplyingMyselfLogo } from "@/components/ApplyingMyselfLogo";
import { RedirectIfAuthenticated } from "@/components/RedirectIfAuthenticated";

export default function RegisterPage() {
  return (
    <RedirectIfAuthenticated>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="flex justify-center">
              <ApplyingMyselfLogo size="lg" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
            <SignUp
              path="/register"
              routing="path"
              signInUrl="/login"
              fallbackRedirectUrl="/dashboard"
            />
          </div>

          <div className="text-center">
            <Link href="/" className="text-purple-600 hover:text-purple-500 font-medium transition-colors">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </RedirectIfAuthenticated>
  );
}
