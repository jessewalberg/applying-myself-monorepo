"use client";

import React, { ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { resolveRuntimeConfig } from "@applyingmyself/runtime-config";

// Create singleton ConvexReactClient to persist auth state
let convexClientInstance: ConvexReactClient | null = null;
const runtimeConfig = resolveRuntimeConfig({
  env: process.env.NEXT_PUBLIC_APP_ENV ?? process.env.NODE_ENV,
  convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL,
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
});

function getConvexClient() {
  if (!convexClientInstance) {
    convexClientInstance = new ConvexReactClient(runtimeConfig.convexUrl);
  }
  return convexClientInstance;
}

interface ConvexProviderProps {
  children: ReactNode;
}

export function ConvexProvider({ children }: ConvexProviderProps) {
  const convex = getConvexClient();
  const publishableKey =
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
    "pk_test_ZXhhbXBsZS5jbGVyay5hY2NvdW50cy5kZXYk";

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
