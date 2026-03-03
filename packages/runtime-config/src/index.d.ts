export type RuntimeEnv = "development" | "staging" | "production";

export interface RuntimeConfig {
  convexUrl: string;
  apiBaseUrl: string;
  analyticsEndpoint: string;
  siteUrl: string;
  environment: RuntimeEnv;
}

export interface RuntimeConfigOverrides {
  env?: string | null;
  convexUrl?: string | null;
  apiBaseUrl?: string | null;
  analyticsEndpoint?: string | null;
  siteUrl?: string | null;
}

export declare function detectRuntimeEnv(value?: string | null): RuntimeEnv;
export declare function getRuntimeConfig(env: RuntimeEnv): RuntimeConfig;
export declare function resolveRuntimeConfig(overrides?: RuntimeConfigOverrides): RuntimeConfig;
