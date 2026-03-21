import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
    coverage: {
      provider: "v8",
      include: ["convex/**/*.ts", "lib/**/*.ts"],
      exclude: ["convex/_generated/**", "convex/schema.ts", "convex/auth.config.ts"],
    },
  },
});
