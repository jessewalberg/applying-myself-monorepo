#!/usr/bin/env bun
import { existsSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const DIST_DIR = join(ROOT, "apps/extension/dist/chrome-mv3");
const CHUNKS_DIR = join(DIST_DIR, "chunks");
const ASSETS_DIR = join(DIST_DIR, "assets");

const BUDGETS = {
  maxTotalBytes: 2_200_000,
  maxAssetsBytes: 700_000,
  maxSingleChunkBytes: 450_000,
  maxPopupChunkBytes: 260_000,
  maxTotalChunkBytes: 1_500_000,
};

type FileStat = {
  path: string;
  bytes: number;
};

function walk(dir: string, files: FileStat[] = []): FileStat[] {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      walk(fullPath, files);
      continue;
    }
    files.push({
      path: fullPath,
      bytes: stats.size,
    });
  }
  return files;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function failIfOverBudget(label: string, actual: number, max: number): string | null {
  if (actual <= max) return null;
  return `${label} exceeded budget: ${formatBytes(actual)} > ${formatBytes(max)}`;
}

function main() {
  if (!existsSync(DIST_DIR)) {
    console.error("Missing extension build output.");
    console.error("Run `bun run --cwd apps/extension build:prod` before bundle size checks.");
    process.exit(1);
  }

  const allFiles = walk(DIST_DIR);
  const chunkFiles = existsSync(CHUNKS_DIR) ? walk(CHUNKS_DIR).filter((f) => f.path.endsWith(".js")) : [];
  const assetFiles = existsSync(ASSETS_DIR) ? walk(ASSETS_DIR) : [];

  const totalBytes = allFiles.reduce((sum, file) => sum + file.bytes, 0);
  const assetsBytes = assetFiles.reduce((sum, file) => sum + file.bytes, 0);
  const totalChunkBytes = chunkFiles.reduce((sum, file) => sum + file.bytes, 0);
  const largestChunk = [...chunkFiles].sort((a, b) => b.bytes - a.bytes)[0];
  const popupChunk = chunkFiles.find((file) => /\/popup-.*\.js$/.test(file.path));

  const failures = [
    failIfOverBudget("Total extension payload", totalBytes, BUDGETS.maxTotalBytes),
    failIfOverBudget("Total static assets payload", assetsBytes, BUDGETS.maxAssetsBytes),
    failIfOverBudget("Largest JS chunk", largestChunk?.bytes ?? 0, BUDGETS.maxSingleChunkBytes),
    failIfOverBudget("Popup entry chunk", popupChunk?.bytes ?? 0, BUDGETS.maxPopupChunkBytes),
    failIfOverBudget("Total JS chunks payload", totalChunkBytes, BUDGETS.maxTotalChunkBytes),
  ].filter(Boolean) as string[];

  console.log("Extension bundle size summary:");
  console.log(`- Total payload: ${formatBytes(totalBytes)}`);
  console.log(`- Total assets: ${formatBytes(assetsBytes)}`);
  console.log(`- Total JS chunks: ${formatBytes(totalChunkBytes)}`);
  if (largestChunk) {
    console.log(
      `- Largest chunk: ${formatBytes(largestChunk.bytes)} (${relative(ROOT, largestChunk.path)})`,
    );
  }
  if (popupChunk) {
    console.log(`- Popup chunk: ${formatBytes(popupChunk.bytes)} (${relative(ROOT, popupChunk.path)})`);
  }

  console.log("\nTop 5 largest files:");
  for (const file of [...allFiles].sort((a, b) => b.bytes - a.bytes).slice(0, 5)) {
    console.log(`- ${formatBytes(file.bytes)}  ${relative(ROOT, file.path)}`);
  }

  if (failures.length > 0) {
    console.error("\nBundle budget check failed:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log("\nBundle budget check passed.");
}

main();
