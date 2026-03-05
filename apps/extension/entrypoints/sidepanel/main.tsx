import React from "react";
import ReactDOM from "react-dom/client";
import { ClerkProvider } from "@clerk/chrome-extension";
import SidePanel from "../../src/sidepanel/SidePanel";
import CONFIG from "../../src/config";
import "../../src/sidepanel/styles.css";

const root = document.getElementById("root");
if (!root) {
  throw new Error("Missing root container");
}

if (!CONFIG.CLERK.PUBLISHABLE_KEY) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <div className="flex items-center justify-center h-screen bg-background text-foreground p-6 text-center">
        <p className="text-sm text-destructive">Missing Clerk publishable key.</p>
      </div>
    </React.StrictMode>
  );
} else {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <ClerkProvider
        publishableKey={CONFIG.CLERK.PUBLISHABLE_KEY}
        syncHost={CONFIG.CLERK.SYNC_HOST}
        __experimental_syncHostListener
      >
        <SidePanel />
      </ClerkProvider>
    </React.StrictMode>
  );
}
