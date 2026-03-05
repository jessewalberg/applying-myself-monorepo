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
      <div className="auth-container">
        <div className="auth-header">
          <h1>Applying Myself</h1>
          <p>Missing Clerk publishable key. Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.</p>
        </div>
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
        <App />
      </ClerkProvider>
    </React.StrictMode>
  );
}
