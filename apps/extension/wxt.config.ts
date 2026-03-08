import { defineConfig } from "wxt";
import { createPrivateKey, createPublicKey } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { detectRuntimeEnv, resolveRuntimeConfig, type RuntimeEnv } from "@applyingmyself/runtime-config";

const resolveCliMode = (): string | undefined => {
  const modeFlagIndex = process.argv.findIndex((value) => value === "--mode");
  if (modeFlagIndex >= 0 && process.argv[modeFlagIndex + 1]) {
    return process.argv[modeFlagIndex + 1];
  }

  const modeArg = process.argv.find((value) => value.startsWith("--mode="));
  if (modeArg) {
    return modeArg.slice("--mode=".length);
  }

  return undefined;
};

const resolveEnv = (): RuntimeEnv => {
  const raw =
    process.env.WXT_MODE || resolveCliMode() || process.env.NODE_ENV || "development";
  return detectRuntimeEnv(raw);
};

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(rootDir, "src");

const loadEnvFile = (filePath: string) => {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const rawLine = lines[index];
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const equals = line.indexOf("=");
    if (equals <= 0) continue;
    const key = line.slice(0, equals).trim();
    let value = line.slice(equals + 1).trim();

    if ((value.startsWith('"') || value.startsWith("'")) && !value.endsWith(value[0])) {
      const quote = value[0];
      while (index + 1 < lines.length) {
        index += 1;
        value += `\n${lines[index]}`;
        if (lines[index].trimEnd().endsWith(quote)) {
          break;
        }
      }
    }

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
};

const preloadedEnv = resolveEnv();
loadEnvFile(path.join(rootDir, ".env"));
loadEnvFile(path.join(rootDir, ".env.local"));
loadEnvFile(path.join(rootDir, `.env.${preloadedEnv}`));
loadEnvFile(path.join(rootDir, `.env.${preloadedEnv}.local`));
const env = resolveEnv();
const runtime = resolveRuntimeConfig({ env });

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
    // Guard against wildcard host values like "https://*" leaking into manifest.
    if (parsed.hostname === "*" || parsed.host === "*") return null;
    return `${parsed.protocol}//${parsed.host}/*`;
  } catch {
    return null;
  }
};

const syncHostPermission = toHostPermission(process.env.EXTENSION_CLERK_SYNC_HOST);
const clerkFrontendApiPermission = toHostPermission(process.env.EXTENSION_CLERK_FRONTEND_API_URL);
const clerkHostPermissions = [
  "https://*.clerk.accounts.dev/*",
  ...(clerkFrontendApiPermission ? [clerkFrontendApiPermission] : []),
  ...(syncHostPermission ? [syncHostPermission] : []),
];

const meta = manifestMeta[env];
const rawManifestKey = process.env.EXTENSION_CRX_KEY?.trim();
const toManifestKey = (value?: string): string | undefined => {
  if (!value) return undefined;

  if (!value.includes("BEGIN")) {
    return value;
  }

  try {
    const privateKey = createPrivateKey(value);
    const publicKey = createPublicKey(privateKey);
    return publicKey.export({ type: "spki", format: "der" }).toString("base64");
  } catch (error) {
    console.warn("Failed to derive manifest key from EXTENSION_CRX_KEY:", error);
    return undefined;
  }
};
const manifestKey = toManifestKey(rawManifestKey);

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  outDir: "dist",
  webExt: {
    disabled: true,
  },
  dev: {
    server: {
      host: process.env.WXT_DEV_HOST || "127.0.0.1",
      port: Number(process.env.WXT_DEV_PORT || 3001),
    },
    reloadCommand: "Alt+R",
  },
  vite: () => ({
    envPrefix: ["NEXT_PUBLIC_", "CLERK_", "EXTENSION_", "WXT_"],
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
      "import.meta.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY": JSON.stringify(
        process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.CLERK_PUBLISHABLE_KEY || ""
      ),
      "import.meta.env.CLERK_PUBLISHABLE_KEY": JSON.stringify(
        process.env.CLERK_PUBLISHABLE_KEY || ""
      ),
      "import.meta.env.EXTENSION_CLERK_SYNC_HOST": JSON.stringify(
        process.env.EXTENSION_CLERK_SYNC_HOST || ""
      ),
      "import.meta.env.EXTENSION_CLERK_JWT_TEMPLATE": JSON.stringify(
        process.env.EXTENSION_CLERK_JWT_TEMPLATE || "convex"
      ),
      "import.meta.env.EXTENSION_CLERK_FRONTEND_API_URL": JSON.stringify(
        process.env.EXTENSION_CLERK_FRONTEND_API_URL || ""
      ),
    },
  }),
  manifest: {
    ...(manifestKey ? { key: manifestKey } : {}),
    name: meta.name,
    version: "1.0.0",
    description: meta.description,
    permissions: ["activeTab", "storage", "scripting", "contextMenus", "cookies", "sidePanel", "tabs"],
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
    side_panel: {
      default_path: "sidepanel.html",
    },
  },
});
