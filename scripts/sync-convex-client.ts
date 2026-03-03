#!/usr/bin/env bun
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const jsTarget = join(process.cwd(), "packages/convex-client/src/index.js");
const dtsTarget = join(process.cwd(), "packages/convex-client/src/index.d.ts");

const jsContent = `import { anyApi } from "convex/server";\n\nexport const api = anyApi;\nexport const internal = anyApi;\n`;
const dtsContent = `import type { anyApi } from "convex/server";\n\nexport declare const api: typeof anyApi;\nexport declare const internal: typeof anyApi;\n\nexport type { Id, Doc } from "../../../apps/convex/convex/_generated/dataModel";\n`;

writeFileSync(jsTarget, jsContent, "utf8");
writeFileSync(dtsTarget, dtsContent, "utf8");

console.log("synced packages/convex-client/src/index.js and index.d.ts");
