#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const extensionRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(extensionRoot, "../..");
const distDir = path.join(extensionRoot, "dist");
const buildDir = path.join(distDir, "chrome-mv3");
const manifestPath = path.join(buildDir, "manifest.json");
const screenshotsDir = path.join(extensionRoot, "store-assets", "screenshots");
const promoTilePath = path.join(extensionRoot, "store-assets", "promotional-440x280.png");
const marqueePath = path.join(extensionRoot, "store-assets", "marquee-1400x560.png");
const shortPermissionsPath = path.join(
  extensionRoot,
  "CHROME_STORE_PERMISSIONS_JUSTIFICATION_SHORT.md",
);
const fullPermissionsPath = path.join(
  extensionRoot,
  "CHROME_STORE_PERMISSIONS_JUSTIFICATION.md",
);
const privacyPagePath = path.join(repoRoot, "apps", "web", "app", "privacy", "page.tsx");
const runtimeConfigPath = path.join(repoRoot, "packages", "runtime-config", "src", "index.js");

const validationEnv = process.argv[2] || "production";

const requiredIconSizes = new Map([
  ["16", 16],
  ["32", 32],
  ["48", 48],
  ["128", 128],
]);

const allowedScreenshotSizes = new Set(["640x400", "1280x800"]);

function fail(message) {
  return { ok: false, message };
}

function pass(message) {
  return { ok: true, message };
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getProductionSiteUrl() {
  const source = fs.readFileSync(runtimeConfigPath, "utf8");
  const match = source.match(
    /production:\s*\{[\s\S]*?siteUrl:\s*["'`]([^"'`]+)["'`]/,
  );
  return match ? match[1] : null;
}

async function validateImageSize(filePath, expectedWidth, expectedHeight, label) {
  if (!fs.existsSync(filePath)) {
    return fail(`${label} is missing: ${path.relative(extensionRoot, filePath)}`);
  }

  const metadata = await sharp(filePath).metadata();
  if (metadata.width !== expectedWidth || metadata.height !== expectedHeight) {
    return fail(
      `${label} must be ${expectedWidth}x${expectedHeight}, got ${metadata.width}x${metadata.height}`,
    );
  }

  return pass(`${label} is ${expectedWidth}x${expectedHeight}`);
}

async function validateManifestIcons(manifest) {
  const checks = [];

  for (const [key, size] of requiredIconSizes.entries()) {
    const relativeIconPath = manifest.icons?.[key];
    if (!relativeIconPath) {
      checks.push(fail(`manifest.icons is missing ${key}px entry`));
      continue;
    }

    const builtIconPath = path.join(buildDir, relativeIconPath);
    checks.push(await validateImageSize(builtIconPath, size, size, `Built icon ${key}px`));
  }

  return checks;
}

function validatePermissionDocs(manifest) {
  const results = [];
  const shortDoc = fs.readFileSync(shortPermissionsPath, "utf8");
  const fullDoc = fs.readFileSync(fullPermissionsPath, "utf8");
  const permissionDocs = [
    ["short permission doc", shortDoc],
    ["full permission doc", fullDoc],
  ];

  for (const [label, source] of permissionDocs) {
    for (const permission of manifest.permissions ?? []) {
      const pattern = new RegExp(`${escapeRegex(permission)}\\s+Permission`, "i");
      if (!pattern.test(source)) {
        results.push(fail(`${label} is missing a section for "${permission}" permission`));
      }
    }

    if ((manifest.host_permissions ?? []).length > 0 && !/Host Permissions/i.test(source)) {
      results.push(fail(`${label} is missing a Host Permissions section`));
    }
  }

  return results.length > 0 ? results : [pass("Permission docs cover manifest permissions")];
}

async function validateScreenshots() {
  if (!fs.existsSync(screenshotsDir)) {
    return [fail("Screenshot directory is missing")];
  }

  const files = fs
    .readdirSync(screenshotsDir)
    .filter((file) => /\.(png|jpe?g)$/i.test(file))
    .sort();

  if (files.length === 0) {
    return [fail("At least one store screenshot is required")];
  }

  if (files.length > 5) {
    return [fail(`Chrome Web Store allows up to 5 screenshots, found ${files.length}`)];
  }

  const results = [];
  for (const file of files) {
    const filePath = path.join(screenshotsDir, file);
    const metadata = await sharp(filePath).metadata();
    const sizeKey = `${metadata.width}x${metadata.height}`;
    if (!allowedScreenshotSizes.has(sizeKey)) {
      results.push(
        fail(
          `Screenshot ${file} must be 640x400 or 1280x800, got ${metadata.width}x${metadata.height}`,
        ),
      );
      continue;
    }

    results.push(pass(`Screenshot ${file} uses supported size ${sizeKey}`));
  }

  return results;
}

function validatePrivacyPage() {
  if (!fs.existsSync(privacyPagePath)) {
    return [fail("Web privacy page is missing")];
  }

  const source = fs.readFileSync(privacyPagePath, "utf8");
  const siteUrl = getProductionSiteUrl();
  const expectedPrivacyUrl = siteUrl ? `${siteUrl}/privacy` : null;
  const results = [];

  if (!/Last updated:/i.test(source)) {
    results.push(fail("Privacy page does not include a visible last-updated marker"));
  }

  if (!expectedPrivacyUrl) {
    results.push(fail("Could not determine production site URL from runtime config"));
  } else if (!source.includes(expectedPrivacyUrl)) {
    results.push(fail(`Privacy page metadata does not reference ${expectedPrivacyUrl}`));
  } else {
    results.push(pass(`Privacy page metadata references ${expectedPrivacyUrl}`));
  }

  return results;
}

function validateManifest(manifest) {
  const results = [];
  const expectedNames = {
    development: "Applying Myself - Development",
    staging: "Applying Myself - Staging",
    production: "Applying Myself",
  };

  if (manifest.manifest_version !== 3) {
    results.push(fail(`Expected manifest_version 3, found ${manifest.manifest_version}`));
  } else {
    results.push(pass("Manifest uses MV3"));
  }

  if (!manifest.name || !manifest.version || !manifest.description) {
    results.push(fail("Manifest must include name, version, and description"));
  } else {
    results.push(pass(`Manifest metadata present for ${manifest.name} ${manifest.version}`));
  }

  const expectedName = expectedNames[validationEnv];
  if (expectedName && manifest.name !== expectedName) {
    results.push(
      fail(`Expected ${validationEnv} manifest name "${expectedName}", found "${manifest.name}"`),
    );
  }

  const permissions = manifest.permissions ?? [];
  if (permissions.length === 0) {
    results.push(fail("Manifest has no declared permissions"));
  } else {
    results.push(pass(`Manifest declares ${permissions.length} permissions`));
  }

  const duplicates = permissions.filter((permission, index) => permissions.indexOf(permission) !== index);
  if (duplicates.length > 0) {
    results.push(fail(`Manifest has duplicate permissions: ${duplicates.join(", ")}`));
  }

  const hostPermissions = manifest.host_permissions ?? [];
  const invalidHosts = hostPermissions.filter((host) => !/^https:\/\/.+\/\*$/.test(host));
  if (invalidHosts.length > 0) {
    results.push(fail(`Host permissions must be explicit https origins: ${invalidHosts.join(", ")}`));
  } else if (hostPermissions.length > 0) {
    results.push(pass(`Manifest declares ${hostPermissions.length} host permission entries`));
  }

  if (permissions.includes("sidePanel")) {
    if (!manifest.side_panel?.default_path) {
      results.push(fail('Manifest includes "sidePanel" permission but no side_panel.default_path'));
    } else {
      results.push(pass("Side panel manifest config is present"));
    }
  }

  return results;
}

function validateZipArtifacts() {
  if (!fs.existsSync(distDir)) {
    return [fail("dist/ is missing. Run a production zip build first.")];
  }

  const zipFiles = fs
    .readdirSync(distDir)
    .filter((file) => file.endsWith(".zip"))
    .map((file) => ({
      file,
      size: fs.statSync(path.join(distDir, file)).size,
    }));

  if (zipFiles.length === 0) {
    return [fail("No zip artifact found in apps/extension/dist. Run `bun run zip:prod` first.")];
  }

  const emptyZip = zipFiles.find((zip) => zip.size === 0);
  if (emptyZip) {
    return [fail(`Zip artifact is empty: ${emptyZip.file}`)];
  }

  return [pass(`Found ${zipFiles.length} zip artifact(s): ${zipFiles.map((zip) => zip.file).join(", ")}`)];
}

async function main() {
  const results = [];

  if (!fs.existsSync(manifestPath)) {
    console.error("Missing production manifest.");
    console.error("Run `bun run build:prod` before validating Chrome Web Store assets.");
    process.exit(1);
  }

  const manifest = readJson(manifestPath);
  results.push(...validateManifest(manifest));
  results.push(...(await validateManifestIcons(manifest)));
  results.push(...(await validateScreenshots()));
  results.push(await validateImageSize(promoTilePath, 440, 280, "Promotional tile"));
  results.push(await validateImageSize(marqueePath, 1400, 560, "Marquee image"));
  results.push(...validateZipArtifacts());
  results.push(...validatePrivacyPage());
  results.push(...validatePermissionDocs(manifest));

  const failures = results.filter((result) => !result.ok);
  const passes = results.filter((result) => result.ok);

  console.log("Chrome Web Store validation");
  console.log("===========================");
  for (const result of passes) {
    console.log(`PASS ${result.message}`);
  }
  for (const result of failures) {
    console.log(`FAIL ${result.message}`);
  }

  if (failures.length > 0) {
    console.error(`\nValidation failed with ${failures.length} issue(s).`);
    process.exit(1);
  }

  console.log("\nValidation passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
