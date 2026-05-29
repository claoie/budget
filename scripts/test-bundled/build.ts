/**
 * Bundle builder for the per-test-bundle test approach.
 *
 * For each test file, take the source file under test (heuristic:
 * `X.test.ts` → `X.ts` in the same directory) and produce a UNIQUE
 * bundle path. Leaf node_modules deps that tests need to mock (`pg`,
 * `bcrypt`, …) stay external; everything else is inlined.
 *
 * The unique-per-test bundle path is critical — when several tests
 * dynamic-import their bundles in the same `bun test` process, each
 * bundle path is cached separately, and each captures its own leaf-dep
 * mocks at load time. Shared bundle paths would defeat the isolation.
 */
import { mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, basename } from "node:path";

const REPO_ROOT = resolve(import.meta.dirname, "..", "..");
const BUNDLE_DIR = resolve(REPO_ROOT, ".test-bundles");

/** Leaf deps that tests commonly need to mock — kept external. */
const DEFAULT_EXTERNALS = [
  "pg",
  "bcrypt",
  "jose",
  "plaid",
  "aws-sdk",
  "nock",
  "mock-aws-s3",
];

export interface BuildResult {
  testFile: string;
  sourceFile: string;
  bundlePath: string;
  buildMs: number;
}

const inferSourceFile = (testFile: string): string | null => {
  // X.test.ts → X.ts in the same directory.
  const m = /(.+?)\.test\.(ts|tsx)$/.exec(testFile);
  if (!m) return null;
  const candidate = `${m[1]}.${m[2] === "tsx" ? "tsx" : "ts"}`;
  return existsSync(candidate) ? candidate : null;
};

/**
 * Compute the bundle path for a given source file. The bundle file name
 * uses the source path with `/` replaced by `__` so different sources in
 * the same dir (and the same source name in different dirs) never collide.
 * Tests construct this same path so they know which bundle to import.
 */
export const bundlePathFor = (sourceFile: string): string => {
  const rel = sourceFile.startsWith(REPO_ROOT)
    ? sourceFile.slice(REPO_ROOT.length + 1)
    : sourceFile;
  const flat = rel.replace(/\.(ts|tsx)$/, "").replace(/[\/\\]/g, "__");
  return resolve(BUNDLE_DIR, `${flat}.bundle.js`);
};

export const buildBundleForTest = async (testFile: string): Promise<BuildResult | null> => {
  const sourceFile = inferSourceFile(testFile);
  if (!sourceFile) return null;

  await mkdir(BUNDLE_DIR, { recursive: true });
  const bundlePath = bundlePathFor(sourceFile);

  const t0 = performance.now();
  const result = await Bun.build({
    entrypoints: [sourceFile],
    outdir: BUNDLE_DIR,
    naming: basename(bundlePath),
    target: "bun",
    external: DEFAULT_EXTERNALS,
    format: "esm",
  });
  const buildMs = performance.now() - t0;

  if (!result.success) {
    const messages = result.logs.map((l) => `${l.level}: ${l.message}`).join("\n");
    throw new Error(`bundle build failed for ${sourceFile}:\n${messages}`);
  }

  return { testFile, sourceFile, bundlePath, buildMs };
};

export const cleanBundleDir = async (): Promise<void> => {
  await rm(BUNDLE_DIR, { recursive: true, force: true });
};

export const getBundleDir = (): string => BUNDLE_DIR;
