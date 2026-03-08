"use client";

import posthog from "posthog-js";

const isConfigured = Boolean(
  process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim() && process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim()
);

export const captureWebEvent = (
  eventName: string,
  properties: Record<string, unknown> = {}
): void => {
  if (!isConfigured) return;

  const normalized = eventName.startsWith("web_") ? eventName : `web_${eventName}`;
  posthog.capture(normalized, {
    surface: "web",
    ...properties,
  });
};
