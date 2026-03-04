"use client";

import { SignIn } from "@clerk/nextjs";
import { RedirectIfAuthenticated } from "@/components/RedirectIfAuthenticated";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { authAppearance } from "@/components/auth/authAppearance";

export default function LoginPage() {
  return (
    <RedirectIfAuthenticated>
      <AuthPageLayout
        heading="Welcome back"
        subheading="Pick up your job search where you left off and keep your applications moving."
      >
        <SignIn
          appearance={authAppearance}
          path="/login"
          routing="path"
          signUpUrl="/register"
          fallbackRedirectUrl="/dashboard"
        />
      </AuthPageLayout>
    </RedirectIfAuthenticated>
  );
}
