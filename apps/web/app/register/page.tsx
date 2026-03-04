"use client";

import { SignUp } from "@clerk/nextjs";
import { RedirectIfAuthenticated } from "@/components/RedirectIfAuthenticated";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { authAppearance } from "@/components/auth/authAppearance";

export default function RegisterPage() {
  return (
    <RedirectIfAuthenticated>
      <AuthPageLayout
        heading="Create your account"
        subheading="Set up your workspace and start generating tailored resumes and cover letters."
      >
        <SignUp
          appearance={authAppearance}
          path="/register"
          routing="path"
          signInUrl="/login"
          fallbackRedirectUrl="/dashboard"
        />
      </AuthPageLayout>
    </RedirectIfAuthenticated>
  );
}
