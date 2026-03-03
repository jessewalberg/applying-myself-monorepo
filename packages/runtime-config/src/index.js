const configByEnv = {
  development: {
    convexUrl: "https://dazzling-badger-1.convex.cloud",
    siteUrl: "https://dev.applyingmyself.com",
    environment: "development",
  },
  staging: {
    // Keep staging default on a real deployment to avoid accidental dead endpoint fallbacks.
    convexUrl: "https://dazzling-badger-1.convex.cloud",
    siteUrl: "https://dev.applyingmyself.com",
    environment: "staging",
  },
  production: {
    convexUrl: "https://oceanic-retriever-344.convex.site",
    siteUrl: "https://applyingmyself.com",
    environment: "production",
  },
};

function withDerivedUrls(base) {
  return {
    ...base,
    apiBaseUrl: `${base.convexUrl}/api`,
    analyticsEndpoint: `${base.convexUrl}/api/analytics`,
  };
}

export function detectRuntimeEnv(value) {
  const normalized = (value ?? "").toLowerCase().trim();
  if (normalized === "production" || normalized === "prod") return "production";
  if (normalized === "staging" || normalized === "stage") return "staging";
  return "development";
}

export function getRuntimeConfig(env) {
  return withDerivedUrls(configByEnv[env]);
}

export function resolveRuntimeConfig(overrides = {}) {
  const environment = detectRuntimeEnv(overrides.env);
  const base = getRuntimeConfig(environment);
  const convexUrl = overrides.convexUrl || base.convexUrl;
  const apiBaseUrl = overrides.apiBaseUrl || `${convexUrl}/api`;
  const analyticsEndpoint = overrides.analyticsEndpoint || `${convexUrl}/api/analytics`;

  return {
    environment,
    convexUrl,
    apiBaseUrl,
    analyticsEndpoint,
    siteUrl: overrides.siteUrl || base.siteUrl,
  };
}
