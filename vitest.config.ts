import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

/**
 * Experimental vitest config — running side-by-side with `bun test` and the
 * subprocess-per-file runner (`bun run test:next`) so the three can be
 * benchmarked against each other.
 *
 * Mock isolation here comes from `isolate: true` (the default) + the
 * `threads` pool, which gives each test file its own module graph via
 * worker_threads — the same property we want from #440, just done via
 * worker-isolation instead of subprocess-per-file.
 *
 * Path aliases mirror tsconfig.json so the existing `import "client/..."` /
 * `import "server/..."` / `import "common/..."` shorthand works.
 */
export default defineConfig({
  resolve: {
    alias: {
      client: resolve(__dirname, "./src/client"),
      server: resolve(__dirname, "./src/server"),
      common: resolve(__dirname, "./src/common"),
    },
  },
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["src/client/test-setup.ts"],
    isolate: true,
    pool: "threads",
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      reportsDirectory: "coverage",
      include: ["src/**"],
      exclude: ["**/*.test.ts", "**/*.test.tsx", "**/test-setup.ts", "**/__fixtures__/**"],
    },
  },
});
