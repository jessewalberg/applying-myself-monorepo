"use client";

import React, { ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";

// Create singleton ConvexReactClient to persist auth state
let convexClientInstance: ConvexReactClient | null = null;

function getConvexClient() {
  if (!convexClientInstance) {
    convexClientInstance = new ConvexReactClient(
      process.env.NEXT_PUBLIC_CONVEX_URL!
    );
  }
  return convexClientInstance;
}

interface ConvexProviderProps {
  children: ReactNode;
}

export function ConvexProvider({ children }: ConvexProviderProps) {
  const convex = getConvexClient();
  
  return (
    <ConvexAuthProvider client={convex}>
      {children}
    </ConvexAuthProvider>
  );
} 