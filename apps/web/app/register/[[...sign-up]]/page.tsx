"use client";

import { Suspense, useEffect } from "react";
import { SignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { RedirectIfAuthenticated } from "@/components/RedirectIfAuthenticated";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { authAppearance } from "@/components/auth/authAppearance";
import {
  resolveSafeRedirectPath,
  withRedirectParam,
} from "@/lib/authRedirect";
import { captureWebEvent } from "@/lib/analytics";

function RegisterPageContent() {
  const searchParams = useSearchParams();
  const redirectTo = resolveSafeRedirectPath(searchParams.get("redirect"));
  const signInUrl = withRedirectParam("/login", redirectTo);

  useEffect(() => {
    captureWebEvent("register_viewed", { redirect_to: redirectTo });
  }, [redirectTo]);

  return (
    <RedirectIfAuthenticated redirectTo={redirectTo}>
      <AuthPageLayout
        heading="Create your account"
        subheading="Set up your workspace and start generating tailored resumes and cover letters."
      >
        <SignUp
          appearance={authAppearance}
          path="/register"
          routing="path"
          signInUrl={signInUrl}
          fallbackRedirectUrl={redirectTo}
        />
      </AuthPageLayout>
    </RedirectIfAuthenticated>
  );
}

function RegisterLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-600">Loading...</p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterLoadingFallback />}>
      <RegisterPageContent />
    </Suspense>
  );
}
