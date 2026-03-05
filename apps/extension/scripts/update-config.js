#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const runtimeConfigPath = path.join(__dirname, "../../../packages/runtime-config/src/index.js");
const supportedEnvs = ["development", "staging", "production"];

function updateConvexUrl(newUrl, environment) {
  const source = fs.readFileSync(runtimeConfigPath, "utf8");
  const blockRegex = new RegExp(
    `(${environment}:\\s*\\{[\\s\\S]*?convexUrl:\\s*)["'\`][^"'\`]+["'\`]`
  );

  if (!blockRegex.test(source)) {
    throw new Error(`Could not locate ${environment} config block in runtime-config package.`);
  }

  const nextSource = source.replace(blockRegex, `$1"${newUrl}"`);
  fs.writeFileSync(runtimeConfigPath, nextSource, "utf8");

  console.log(`Updated ${environment} convexUrl to: ${newUrl}`);
  console.log("Shared runtime config updated at:");
  console.log(`  ${runtimeConfigPath}`);
  console.log("");
  console.log("Next steps:");
  console.log(`1. bun run build:${environment === "development" ? "dev" : environment}`);
  console.log("2. Reload the extension in Chrome");
}

function main() {
  const newUrl = process.argv[2];
  const environment = process.argv[3] || "development";

  if (!newUrl) {
    console.log("Usage: bun scripts/update-config.js <convex-url> [environment]");
    console.log("Example: bun scripts/update-config.js https://my-deployment.convex.cloud development");
    console.log("Example: bun scripts/update-config.js https://my-staging.convex.cloud staging");
    console.log("Example: bun scripts/update-config.js https://my-prod.convex.site production");
    process.exit(1);
  }

  if (!supportedEnvs.includes(environment)) {
    console.error(`Environment must be one of: ${supportedEnvs.join(", ")}`);
    process.exit(1);
  }

  try {
    new URL(newUrl);
  } catch {
    console.error(`Invalid URL format: ${newUrl}`);
    process.exit(1);
  }

  try {
    updateConvexUrl(newUrl, environment);
  } catch (error) {
    console.error("Error updating shared runtime config:", error.message);
    process.exit(1);
  }
}

main();
