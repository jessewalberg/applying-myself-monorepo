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
  CLERK: {
    PUBLISHABLE_KEY: string;
    SYNC_HOST: string;
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

function getBuildEnvironment(): RuntimeEnv {
  const processEnv =
    typeof process !== "undefined"
      ? process.env.BUILD_ENV || process.env.NODE_ENV
      : undefined;
  return detectRuntimeEnv(processEnv);
}

const environment = getBuildEnvironment();
const runtime = resolveRuntimeConfig({ env: environment });

const config: Config = {
  CONVEX_URL: runtime.convexUrl,
  API_BASE_URL: runtime.apiBaseUrl,
  ANALYTICS_ENDPOINT: runtime.analyticsEndpoint,
  SITE_URL: runtime.siteUrl,
  CLERK: {
    PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
      process.env.CLERK_PUBLISHABLE_KEY ||
      "",
    SYNC_HOST: process.env.EXTENSION_CLERK_SYNC_HOST || runtime.siteUrl,
    JWT_TEMPLATE: process.env.EXTENSION_CLERK_JWT_TEMPLATE || "convex",
    FRONTEND_API_URL: process.env.EXTENSION_CLERK_FRONTEND_API_URL,
  },
  MAX_RETRIES: environment === "development" ? 3 : 2,
  REQUEST_TIMEOUT: environment === "production" ? 15000 : 30000,
  EXTENSION: {
    KEY: `${environment}-extension-key`,
    ID: `${environment}-extension-id`,
    VERSION: environment === "production" ? "1.0.0" : `1.0.0-${environment}`,
  },
  ENVIRONMENT: environment,
};

if (config.ENVIRONMENT === "development" && typeof console !== "undefined") {
  console.log("Applying Myself Extension - Development Mode");
  console.log("Convex URL:", config.CONVEX_URL);
  console.log("Site URL:", config.SITE_URL);
}

export default config;
