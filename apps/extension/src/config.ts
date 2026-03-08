import {
  detectRuntimeEnv,
  resolveRuntimeConfig,
  type RuntimeEnv,
} from "@applyingmyself/runtime-config";

interface Config {
  CONVEX_URL: string;
  API_BASE_URL: string;
  ANALYTICS_ENDPOINT: string;
  SITE_URL: string;
  POSTHOG: {
    API_KEY?: string;
    HOST?: string;
  };
  CLERK: {
    PUBLISHABLE_KEY: string;
    SYNC_HOST?: string;
    JWT_TEMPLATE: string;
    FRONTEND_API_URL?: string;
  };
  MAX_RETRIES: number;
  REQUEST_TIMEOUT: number;
  EXTENSION: {
    KEY: string;
    ID: string;
    VERSION: string;
  };
  ENVIRONMENT: RuntimeEnv;
}

type ExtensionImportMetaEnv = {
  WXT_MODE?: string;
  BUILD_ENV?: string;
  NODE_ENV?: string;
  MODE?: string;
  EXTENSION_CRX_KEY?: string;
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?: string;
  CLERK_PUBLISHABLE_KEY?: string;
  EXTENSION_CLERK_SYNC_HOST?: string;
  EXTENSION_CLERK_JWT_TEMPLATE?: string;
  EXTENSION_CLERK_FRONTEND_API_URL?: string;
  NEXT_PUBLIC_POSTHOG_KEY?: string;
  NEXT_PUBLIC_POSTHOG_HOST?: string;
  EXTENSION_POSTHOG_KEY?: string;
  EXTENSION_POSTHOG_HOST?: string;
};

const extensionEnv = (import.meta as ImportMeta & { env: ExtensionImportMetaEnv }).env;
const parseHttpUrl = (value?: string): string | undefined => {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return undefined;
    return parsed.origin;
  } catch {
    return undefined;
  }
};

const environment = detectRuntimeEnv(
  extensionEnv.WXT_MODE ||
    extensionEnv.BUILD_ENV ||
    extensionEnv.NODE_ENV ||
    extensionEnv.MODE
);
const runtime = resolveRuntimeConfig({ env: environment });
const clerkSyncHost = parseHttpUrl(extensionEnv.EXTENSION_CLERK_SYNC_HOST);
const clerkFrontendApiUrl = parseHttpUrl(extensionEnv.EXTENSION_CLERK_FRONTEND_API_URL);
const clerkPublishableKey = (
  extensionEnv.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  extensionEnv.CLERK_PUBLISHABLE_KEY ||
  ""
).trim();
const posthogHost = parseHttpUrl(
  extensionEnv.EXTENSION_POSTHOG_HOST || extensionEnv.NEXT_PUBLIC_POSTHOG_HOST
);
const posthogApiKey = (
  extensionEnv.EXTENSION_POSTHOG_KEY || extensionEnv.NEXT_PUBLIC_POSTHOG_KEY || ""
).trim();

const config: Config = {
  CONVEX_URL: runtime.convexUrl,
  API_BASE_URL: runtime.apiBaseUrl,
  ANALYTICS_ENDPOINT: runtime.analyticsEndpoint,
  SITE_URL: runtime.siteUrl,
  POSTHOG: {
    ...(posthogApiKey ? { API_KEY: posthogApiKey } : {}),
    ...(posthogHost ? { HOST: posthogHost } : {}),
  },
  CLERK: {
    PUBLISHABLE_KEY: clerkPublishableKey,
    ...(clerkSyncHost ? { SYNC_HOST: clerkSyncHost } : {}),
    JWT_TEMPLATE: extensionEnv.EXTENSION_CLERK_JWT_TEMPLATE || "convex",
    FRONTEND_API_URL: clerkFrontendApiUrl,
  },
  MAX_RETRIES: environment === "development" ? 3 : 2,
  REQUEST_TIMEOUT: environment === "production" ? 15000 : 30000,
  EXTENSION: {
    KEY: (extensionEnv.EXTENSION_CRX_KEY || "").trim(),
    ID: chrome.runtime?.id || "",
    VERSION: environment === "production" ? "1.0.0" : `1.0.0-${environment}`,
  },
  ENVIRONMENT: environment,
};

if (config.ENVIRONMENT === "development" && typeof console !== "undefined") {
  console.log("Applying Myself Extension - Development Mode");
  console.log("Convex URL:", config.CONVEX_URL);
  console.log("Site URL:", config.SITE_URL);
  console.log("Extension ID:", config.EXTENSION.ID || "(unavailable)");
  if (config.EXTENSION.ID) {
    console.log("Extension Origin:", `chrome-extension://${config.EXTENSION.ID}`);
  }
  if (config.POSTHOG.HOST && config.POSTHOG.API_KEY) {
    console.log("PostHog Host:", config.POSTHOG.HOST);
  }
  if (!config.EXTENSION.KEY) {
    console.warn(
      "EXTENSION_CRX_KEY is not set. Standalone Clerk OAuth requires the extension origin to be allowed in Clerk and works best with a consistent extension ID."
    );
  }
}

export default config;
