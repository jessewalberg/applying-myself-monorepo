import { defineConfig } from "wxt";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { detectRuntimeEnv, resolveRuntimeConfig, type RuntimeEnv } from "@app/runtime-config";

const resolveEnv = (): RuntimeEnv => {
  const raw = process.env.WXT_MODE || process.env.NODE_ENV || "development";
  return detectRuntimeEnv(raw);
};

const env = resolveEnv();
const runtime = resolveRuntimeConfig({ env });
const rootDir = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(rootDir, "src");

const manifestMeta: Record<RuntimeEnv, { name: string; title: string; description: string }> = {
  development: {
    name: "Applying Myself - Development",
    title: "Applying Myself (Dev)",
    description: "AI-powered cover letter generator (Development Build)",
  },
  staging: {
    name: "Applying Myself - Staging",
    title: "Applying Myself (Staging)",
    description: "AI-powered cover letter generator (Staging Build)",
  },
  production: {
    name: "Applying Myself",
    title: "Applying Myself",
    description:
      "AI-powered cover letter generator that creates personalized cover letters from job postings",
  },
};

const hostPermissions: Record<RuntimeEnv, string[]> = {
  development: ["https://dazzling-badger-1.convex.cloud/*", "https://*.convex.cloud/*", "https://dev.applyingmyself.com/*"],
  staging: ["https://*.convex.cloud/*", "https://dev.applyingmyself.com/*"],
  production: ["https://oceanic-retriever-344.convex.site/*", "https://*.convex.site/*", "https://applyingmyself.com/*"],
};

const toHostPermission = (value?: string): string | null => {
  if (!value) return null;
  try {
    const parsed = new URL(value);
    return `${parsed.protocol}//${parsed.host}/*`;
  } catch {
    return null;
  }
};

const syncHostPermission = toHostPermission(process.env.EXTENSION_CLERK_SYNC_HOST || runtime.siteUrl);
const clerkFrontendApiPermission = toHostPermission(process.env.EXTENSION_CLERK_FRONTEND_API_URL);
const clerkHostPermissions = [
  "https://*.clerk.accounts.dev/*",
  ...(clerkFrontendApiPermission ? [clerkFrontendApiPermission] : []),
  ...(syncHostPermission ? [syncHostPermission] : []),
];

const meta = manifestMeta[env];

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  outDir: "dist",
  vite: () => ({
    resolve: {
      alias: {
        "@/": `${srcDir}/`,
        "@": srcDir,
        "@/types": path.resolve(srcDir, "types"),
        "@/components": path.resolve(srcDir, "popup/components"),
        "@/services": path.resolve(srcDir, "services"),
        "@/utils": path.resolve(srcDir, "utils"),
        "@/config": path.resolve(srcDir, "config"),
      },
    },
    define: {
      "process.env.NODE_ENV": JSON.stringify(env),
      "process.env.BUILD_ENV": JSON.stringify(env),
      "process.env.PDFOBJECT_CDN_URL": JSON.stringify(""),
      "__APP_RUNTIME_ENV__": JSON.stringify(runtime.environment),
    },
  }),
  manifest: {
    name: meta.name,
    version: "1.0.0",
    description: meta.description,
    permissions: ["activeTab", "storage", "scripting", "contextMenus", "cookies"],
    host_permissions: [...new Set([...hostPermissions[env], ...clerkHostPermissions])],
    action: {
      default_title: meta.title,
      default_icon: {
        "16": "icons/icon16.png",
        "32": "icons/icon32.png",
        "48": "icons/icon48.png",
        "128": "icons/icon128.png",
      },
    },
    icons: {
      "16": "icons/icon16.png",
      "32": "icons/icon32.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png",
    },
    web_accessible_resources: [
      {
        resources: ["icons/logo.png"],
        matches: ["<all_urls>"],
      },
    ],
  },
});
