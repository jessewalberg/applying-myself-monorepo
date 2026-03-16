"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { PostHogProvider as PostHogReactProvider } from "posthog-js/react";
import { useAuth, useUser } from "@clerk/nextjs";
import { usePathname, useSearchParams } from "next/navigation";

const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim();
const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim();
const isConfigured = Boolean(apiKey && apiHost);

if (typeof window !== "undefined" && isConfigured && !posthog.__loaded) {
  posthog.init(apiKey!, {
    api_host: apiHost,
    capture_pageview: false,
    capture_pageleave: true,
    autocapture: true,
    persistence: "localStorage+cookie",
    loaded: (instance) => {
      if (process.env.NODE_ENV !== "production") {
        instance.debug(false);
      }
    },
  });
}

function PostHogPageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isConfigured) return;

    const query = searchParams.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    posthog.capture("web_page_view", {
      surface: "web",
      pathname,
      url,
    });
  }, [pathname, searchParams]);

  return null;
}

function PostHogIdentitySync() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    if (!isConfigured) return;

    if (!isSignedIn || !user) {
      posthog.reset();
      return;
    }

    posthog.identify(user.id, {
      email: user.primaryEmailAddress?.emailAddress,
      name: user.fullName ?? user.username ?? undefined,
      surface: "web",
    });
  }, [isSignedIn, user]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  if (!isConfigured) return <>{children}</>;

  return (
    <PostHogReactProvider client={posthog}>
      <PostHogIdentitySync />
      <PostHogPageViewTracker />
      {children}
    </PostHogReactProvider>
  );
}
