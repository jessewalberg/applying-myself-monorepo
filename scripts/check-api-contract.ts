#!/usr/bin/env bun
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

type FunctionMap = Map<string, Set<string>>;

type Callsite = {
  moduleName: string;
  functionName: string;
  file: string;
  index: number;
};

const ROOT = process.cwd();
const CONVEX_DIR = join(ROOT, "apps/convex/convex");
const CLIENT_DIRS = [
  join(ROOT, "apps/web"),
  join(ROOT, "apps/extension"),
];

const IGNORE_DIRS = new Set([
  "node_modules",
  ".git",
  ".next",
  "dist",
  "convex/_generated",
]);

function walk(dir: string, files: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const rel = full.replace(`${ROOT}/`, "");
    if ([...IGNORE_DIRS].some((segment) => rel.includes(segment))) continue;
    const stats = statSync(full);
    if (stats.isDirectory()) {
      walk(full, files);
      continue;
    }
    const ext = extname(full);
    if (ext === ".ts" || ext === ".tsx") {
      files.push(full);
    }
  }
  return files;
}

function loadBackendContract(): FunctionMap {
  const contract: FunctionMap = new Map();
  for (const file of readdirSync(CONVEX_DIR)) {
    if (!file.endsWith(".ts")) continue;
    if (["schema.ts", "constants.ts", "types.ts", "auth.config.ts"].includes(file)) {
      continue;
    }
    const moduleName = file.replace(/\.ts$/, "");
    const src = readFileSync(join(CONVEX_DIR, file), "utf8");
    const functionNames = [
      ...[...src.matchAll(/export const\s+([A-Za-z0-9_]+)\s*=\s*(?:query|mutation|action|internalQuery|internalMutation|internalAction|httpAction)\s*\(/g)].map((m) => m[1]),
      ...[...src.matchAll(/export const\s+([A-Za-z0-9_]+)\s*=/g)].map((m) => m[1]),
      ...[...src.matchAll(/export const\s*\{([^}]+)\}\s*=/g)]
        .flatMap((m) => m[1].split(",").map((name) => name.trim()).filter(Boolean)),
    ];

    if (!contract.has(moduleName)) {
      contract.set(moduleName, new Set());
    }
    for (const fn of functionNames) {
      contract.get(moduleName)!.add(fn);
    }
  }
  return contract;
}

function loadCallsites(): Callsite[] {
  const callsites: Callsite[] = [];
  const regex = /\bapi\.([A-Za-z0-9_]+)\.([A-Za-z0-9_]+)\b/g;

  for (const dir of CLIENT_DIRS) {
    for (const file of walk(dir)) {
      const src = readFileSync(file, "utf8");
      for (const match of src.matchAll(regex)) {
        callsites.push({
          moduleName: match[1],
          functionName: match[2],
          file: file.replace(`${ROOT}/`, ""),
          index: match.index ?? -1,
        });
      }
    }
  }

  return callsites;
}

function main() {
  const contract = loadBackendContract();
  const callsites = loadCallsites();

  const missingModules = new Map<string, Callsite[]>();
  const missingFunctions = new Map<string, Callsite[]>();

  for (const c of callsites) {
    const moduleFns = contract.get(c.moduleName);
    if (!moduleFns) {
      const key = c.moduleName;
      missingModules.set(key, [...(missingModules.get(key) ?? []), c]);
      continue;
    }
    if (!moduleFns.has(c.functionName)) {
      const key = `${c.moduleName}.${c.functionName}`;
      missingFunctions.set(key, [...(missingFunctions.get(key) ?? []), c]);
    }
  }

  if (missingModules.size === 0 && missingFunctions.size === 0) {
    console.log("API contract check passed.");
    console.log(`Checked ${callsites.length} api.* callsites.`);
    process.exit(0);
  }

  console.error("API contract check failed.");

  if (missingModules.size > 0) {
    console.error("\\nMissing modules:");
    for (const [moduleName, refs] of missingModules.entries()) {
      console.error(`  - ${moduleName}`);
      for (const ref of refs.slice(0, 5)) {
        console.error(`      -> ${ref.file}`);
      }
    }
  }

  if (missingFunctions.size > 0) {
    console.error("\\nMissing functions:");
    for (const [fnName, refs] of missingFunctions.entries()) {
      console.error(`  - ${fnName}`);
      for (const ref of refs.slice(0, 5)) {
        console.error(`      -> ${ref.file}`);
      }
    }
  }

  process.exit(1);
}

main();
