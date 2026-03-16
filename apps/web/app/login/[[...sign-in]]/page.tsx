"use client";

import { Suspense, useEffect } from "react";
import { SignIn } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { RedirectIfAuthenticated } from "@/components/RedirectIfAuthenticated";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { authAppearance } from "@/components/auth/authAppearance";
import {
  resolveSafeRedirectPath,
  withRedirectParam,
} from "@/lib/authRedirect";
import { captureWebEvent } from "@/lib/analytics";

function LoginPageContent() {
  const searchParams = useSearchParams();
  const redirectTo = resolveSafeRedirectPath(searchParams.get("redirect"));
  const signUpUrl = withRedirectParam("/register", redirectTo);

  useEffect(() => {
    captureWebEvent("login_viewed", { redirect_to: redirectTo });
  }, [redirectTo]);

  return (
    <RedirectIfAuthenticated redirectTo={redirectTo}>
      <AuthPageLayout
        heading="Welcome back"
        subheading="Pick up your job search where you left off and keep your applications moving."
      >
        <SignIn
          appearance={authAppearance}
          path="/login"
          routing="path"
          signUpUrl={signUpUrl}
          fallbackRedirectUrl={redirectTo}
        />
      </AuthPageLayout>
    </RedirectIfAuthenticated>
  );
}

function LoginLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-600">Loading...</p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoadingFallback />}>
      <LoginPageContent />
    </Suspense>
  );
}
