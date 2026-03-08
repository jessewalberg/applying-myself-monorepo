import React, { useState } from "react";
import { SignIn, SignUp } from "@clerk/chrome-extension";
import CONFIG from "@/config";
import ApplyingMyselfLogo from "../../popup/components/ApplyingMyselfLogo";
import EnvironmentBanner from "../../components/EnvironmentBanner";

type AuthMode = "sign-in" | "sign-up";
type Variant = "popup" | "sidepanel";

const parseInitialMode = (): AuthMode => {
  try {
    return new URLSearchParams(window.location.search).get("mode") === "sign-up"
      ? "sign-up"
      : "sign-in";
  } catch {
    return "sign-in";
  }
};

const clerkAppearance = {
  variables: {
    colorPrimary: "hsl(38 92% 50%)",
    colorText: "hsl(40 20% 95%)",
    colorTextSecondary: "hsl(40 10% 60%)",
    colorBackground: "transparent",
    colorInputBackground: "hsl(20 10% 13%)",
    colorInputText: "hsl(40 20% 95%)",
    colorDanger: "hsl(0 84% 60%)",
    borderRadius: "0.625rem",
    fontFamily:
      '"Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
  },
  elements: {
    rootBox: "w-full",
    cardBox: "w-full",
    card: "bg-transparent shadow-none border-0 p-0",
    header: "hidden",
    headerTitle: "hidden",
    headerSubtitle: "hidden",
    socialButtonsBlockButton:
      "h-9 rounded-lg border border-border/80 bg-secondary/50 text-foreground transition-colors hover:bg-secondary/80",
    socialButtonsBlockButtonText: "text-[13px] font-medium text-foreground",
    socialButtonsProviderIcon: "opacity-90",
    dividerLine: "bg-border/60",
    dividerText: "px-2 text-[10px] uppercase tracking-[0.1em] text-muted-foreground/70",
    formFieldLabel:
      "text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground/80",
    formFieldRow: "gap-1.5",
    formFieldInput:
      "h-9 rounded-lg border border-border/70 bg-background/60 text-foreground placeholder:text-muted-foreground/50 focus-visible:border-primary/60 focus-visible:ring-1 focus-visible:ring-primary/40",
    formButtonPrimary:
      "h-9 rounded-lg bg-primary text-[13px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90",
    footerAction: "text-xs text-muted-foreground/70",
    footerActionLink: "font-medium text-primary/90 hover:text-primary",
    formFieldErrorText: "text-xs text-destructive",
    alert: "rounded-lg border border-destructive/20 bg-destructive/5",
    alertText: "text-xs text-foreground",
    formResendCodeLink: "text-primary/90 hover:text-primary",
  },
};

const getRedirectUrls = (variant: Variant) => {
  const page = variant === "popup" ? "popup.html" : "sidepanel.html";
  return {
    signIn: chrome.runtime.getURL(`${page}?mode=sign-in`),
    signUp: chrome.runtime.getURL(`${page}?mode=sign-up`),
  };
};

const InlineAuthPanel: React.FC<{ variant: Variant; debugStage?: string }> = ({ variant, debugStage }) => {
  const [mode, setMode] = useState<AuthMode>(parseInitialMode);
  const redirectUrls = getRedirectUrls(variant);
  const isPopup = variant === "popup";

  if (!CONFIG.CLERK.PUBLISHABLE_KEY) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-background px-6 text-center text-foreground">
        <EnvironmentBanner />
        <ApplyingMyselfLogo size={36} />
        <h1 className="mt-3 font-display text-lg italic text-foreground">
          applying myself<span className="text-primary">.</span>
        </h1>
        <p className="mt-2 text-sm text-destructive/80">
          Missing Clerk publishable key.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background text-foreground">
      <EnvironmentBanner />

      <div
        className={
          isPopup
            ? "flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pb-4 pt-5"
            : "mx-auto flex min-h-0 w-full max-w-md flex-1 flex-col items-center px-6 pb-8 pt-8"
        }
      >
        {/* Branding */}
        <div className="mb-4 flex flex-col items-center text-center">
          <ApplyingMyselfLogo size={isPopup ? 32 : 44} className="mx-auto" />
          <h1
            className={
              isPopup
                ? "mt-2 font-display text-lg italic text-foreground"
                : "mt-3 font-display text-2xl italic text-foreground"
            }
          >
            applying myself<span className="text-primary">.</span>
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground/80">
            {mode === "sign-in" ? "Sign in to continue" : "Create your account"}
          </p>
        </div>

        {/* Auth card */}
        <div
          className={
            isPopup
              ? "flex w-full flex-1 flex-col rounded-xl border border-border/50 bg-card/60 p-4"
              : "flex w-full min-h-0 flex-1 flex-col rounded-xl border border-border/60 bg-card/80 p-5"
          }
        >
          {/* Mode toggle */}
          <div className="mb-3 flex gap-1 rounded-lg bg-background/80 p-0.5">
            <button
              onClick={() => setMode("sign-in")}
              className={`flex-1 rounded-md px-3 py-1.5 text-[13px] font-medium transition-all ${
                mode === "sign-in"
                  ? "bg-secondary text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground/80"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode("sign-up")}
              className={`flex-1 rounded-md px-3 py-1.5 text-[13px] font-medium transition-all ${
                mode === "sign-up"
                  ? "bg-secondary text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground/80"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Clerk form */}
          <div className={isPopup ? "auth-clerk-compact" : "min-h-0 overflow-y-auto"}>
            {mode === "sign-in" ? (
              <SignIn
                oauthFlow="popup"
                forceRedirectUrl={redirectUrls.signIn}
                fallbackRedirectUrl={redirectUrls.signIn}
                signUpUrl={redirectUrls.signUp}
                appearance={clerkAppearance}
              />
            ) : (
              <SignUp
                oauthFlow="popup"
                forceRedirectUrl={redirectUrls.signUp}
                fallbackRedirectUrl={redirectUrls.signUp}
                signInUrl={redirectUrls.signIn}
                appearance={clerkAppearance}
              />
            )}
          </div>
        </div>

        {/* Debug info (dev only) */}
        {CONFIG.ENVIRONMENT === "development" && debugStage ? (
          <p className="mt-2 rounded-md bg-background/60 px-2 py-1 font-mono text-[10px] text-muted-foreground/60">
            {debugStage}
          </p>
        ) : null}
      </div>
    </div>
  );
};

export default InlineAuthPanel;
