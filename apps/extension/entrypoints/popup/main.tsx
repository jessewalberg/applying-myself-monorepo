import React from "react";
import ReactDOM from "react-dom/client";
import { ClerkProvider } from "@clerk/chrome-extension";
import App from "../../src/popup/App";
import CONFIG from "../../src/config";
import "../../src/popup/styles/index.css";

const root = document.getElementById("root");
if (!root) {
  throw new Error("Missing root container");
}

if (!CONFIG.CLERK.PUBLISHABLE_KEY) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <div className="flex h-[520px] w-[380px] flex-col items-center justify-center bg-background px-6 text-center text-foreground">
        <h1 className="font-display text-xl italic">
          applying myself<span className="text-primary">.</span>
        </h1>
        <p className="mt-3 text-sm text-destructive">
          Missing Clerk publishable key.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY in apps/extension/.env.local
        </p>
        </div>
    </React.StrictMode>
  );
} else {
  const popupUrl = chrome.runtime.getURL("popup.html?mode=sign-in");

  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <ClerkProvider
        publishableKey={CONFIG.CLERK.PUBLISHABLE_KEY}
        allowedRedirectProtocols={["chrome-extension:"]}
        signInFallbackRedirectUrl={popupUrl}
        signUpFallbackRedirectUrl={popupUrl}
        afterSignOutUrl={popupUrl}
        {...(CONFIG.CLERK.SYNC_HOST
          ? {
              syncHost: CONFIG.CLERK.SYNC_HOST,
              __experimental_syncHostListener: true,
            }
          : {})}
      >
        <App />
      </ClerkProvider>
    </React.StrictMode>
  );
}
