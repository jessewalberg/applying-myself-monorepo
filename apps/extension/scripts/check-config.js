#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const runtimeConfigPath = path.join(__dirname, "../../../packages/runtime-config/src/index.js");
const environments = ["development", "staging", "production"];

function readConvexUrl(source, env) {
  const match = source.match(
    new RegExp(`${env}:\\s*\\{[\\s\\S]*?convexUrl:\\s*["'\`]([^"'\`]+)["'\`]`)
  );
  return match ? match[1] : "Not found";
}

function statusForUrl(url) {
  if (url === "Not found") return "Missing";
  if (url.includes("convex.cloud") || url.includes("convex.site")) return "Configured";
  return "Check value";
}

function main() {
  try {
    const source = fs.readFileSync(runtimeConfigPath, "utf8");

    console.log("Applying Myself Extension Runtime Config Status");
    console.log("=".repeat(50));
    console.log("");

    for (const env of environments) {
      const url = readConvexUrl(source, env);
      console.log(`${env}:`);
      console.log(`  convexUrl: ${url}`);
      console.log(`  status: ${statusForUrl(url)}`);
      console.log("");
    }

    console.log("Build commands:");
    console.log("  Development: bun run build:dev");
    console.log("  Staging:     bun run build:staging");
    console.log("  Production:  bun run build:prod");
  } catch (error) {
    console.error("Error reading shared runtime config:", error.message);
    process.exit(1);
  }
}

main();
