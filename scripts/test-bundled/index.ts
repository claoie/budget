/**
 * Per-test-bundle runner.
 *
 * 1. Discover converted tests in `scripts/test-bundled/bundled-tests/`.
 * 2. For each, build its source-under-test into a unique bundle in
 *    `.test-bundles/`. Each test hard-codes the bundle path so the build
 *    step just has to produce the bundle at the expected location.
 * 3. Run all converted tests in a single `bun test` process — isolation
 *    comes from each test dynamic-importing a unique bundle path that
 *    captures its own leaf-dep mocks at load time.
 *
 * Wired into package.json as `bun run test:bundled`.
 */
import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { Glob } from "bun";
import { buildBundleForTest, cleanBundleDir, bundlePathFor } from "./build.ts";

const REPO_ROOT = resolve(import.meta.dirname, "..", "..");
const BUNDLED_TESTS_DIR = resolve(import.meta.dirname, "bundled-tests");

interface ManifestEntry {
  /** Test file (relative to repo root). */
  test: string;
  /** Source file to bundle for this test (relative to repo root). */
  source: string;
}

/**
 * Extract the `@bundles <relPath>` annotation from a converted test's
 * header. The orchestrator builds whichever source the annotation points
 * at; the test itself must import the matching bundle path.
 */
const parseAnnotation = async (testAbs: string): Promise<string | null> => {
  const text = await readFile(testAbs, "utf8");
  const lines = text.split("\n", 20);
  for (const line of lines) {
    const m = /^\s*\/\/\s*@bundles\s+(.+?)\s*$/.exec(line);
    if (m) return m[1];
  }
  return null;
};

const COLOR_DIM = "\x1b[90m";
const COLOR_BOLD = "\x1b[1m";
const COLOR_RESET = "\x1b[0m";

const main = async (): Promise<void> => {
  const t0 = performance.now();
  // 1. Discover tests
  const tests: string[] = [];
  const glob = new Glob("**/*.test.ts");
  for await (const rel of glob.scan({ cwd: BUNDLED_TESTS_DIR, absolute: false })) {
    tests.push(resolve(BUNDLED_TESTS_DIR, rel));
  }
  if (tests.length === 0) {
    process.stdout.write("no bundled tests discovered\n");
    return;
  }

  // 2. Resolve each test's source via annotation
  const manifest: Array<{ test: string; source: string }> = [];
  for (const testAbs of tests) {
    const ann = await parseAnnotation(testAbs);
    if (!ann) {
      process.stderr.write(`skip (no @bundles annotation): ${testAbs}\n`);
      continue;
    }
    const sourceAbs = resolve(REPO_ROOT, ann);
    manifest.push({ test: testAbs, source: sourceAbs });
  }
  process.stdout.write(
    `${COLOR_BOLD}building${COLOR_RESET} ${manifest.length} bundle(s)…\n`,
  );

  // 3. Clean + build all bundles in parallel
  await cleanBundleDir();
  const t1 = performance.now();
  const buildResults = await Promise.all(
    manifest.map(async ({ source }) => {
      // Re-use the test-side builder helper; pass a fake "test" path that
      // points at the source so its `X.test.ts → X.ts` heuristic picks the
      // right source. Easier: bypass the heuristic and bundle directly.
      const result = await Bun.build({
        entrypoints: [source],
        outdir: dirname(bundlePathFor(source)),
        naming: bundlePathFor(source).split("/").pop()!,
        target: "bun",
        external: ["pg", "bcrypt", "jose", "plaid", "aws-sdk", "nock", "mock-aws-s3"],
        format: "esm",
      });
      if (!result.success) {
        const msgs = result.logs.map((l) => `  ${l.level}: ${l.message}`).join("\n");
        throw new Error(`bundle failed: ${source}\n${msgs}`);
      }
      return source;
    }),
  );
  const buildMs = performance.now() - t1;
  process.stdout.write(
    `${COLOR_DIM}built ${buildResults.length} bundles in ${buildMs.toFixed(0)}ms${COLOR_RESET}\n`,
  );

  // 4. Run all converted tests in one bun test process
  const t2 = performance.now();
  const proc = Bun.spawn(["bun", "test", ...tests], {
    cwd: REPO_ROOT,
    stdout: "inherit",
    stderr: "inherit",
  });
  const exitCode = await proc.exited;
  const runMs = performance.now() - t2;
  const totalMs = performance.now() - t0;
  process.stdout.write(
    `\n${COLOR_DIM}build=${buildMs.toFixed(0)}ms  run=${runMs.toFixed(0)}ms  total=${totalMs.toFixed(0)}ms${COLOR_RESET}\n`,
  );
  process.exit(exitCode);
};

main().catch((err) => {
  process.stderr.write(`test-bundled crashed: ${err?.stack ?? err}\n`);
  process.exit(2);
});
