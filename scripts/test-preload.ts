import { GlobalRegistrator } from "@happy-dom/global-registrator";

/**
 * Test preload — runs ONCE before any test file in `bun test`.
 *
 * Two jobs:
 *   1. Register happy-dom as the global DOM. That gives `@testing-library/react`
 *      a document to render React components into, and it makes client-side env
 *      detection (`src/common/utils:environment`) resolve to "unknown" rather
 *      than "server" — without a `window`, `Dictionary.set()` no-ops and the
 *      holdings-calculation tests fail. Server-side test files are unaffected:
 *      `environment` reads "unknown" either way.
 *   2. Capture the REAL exports of leaf node-modules that tests
 *      commonly mock (`pg`, `bcrypt`). Tests can then `afterAll`-restore
 *      via these snapshots so a previous test file's
 *      `mock.module("pg", FakePool)` doesn't leak into the next file's
 *      assumptions.
 *
 *      The snapshots are taken at preload time — BEFORE any test file
 *      has a chance to call `mock.module(...)` — so they're guaranteed
 *      to be the real module exports.
 *
 * The `globalThis.__REAL_*` properties are used by tests' afterAll
 * hooks via the `restoreLeaves()` helper in `scripts/test-helpers.ts`.
 *
 * React render helpers built on top of this live in `scripts/test-render.tsx`.
 */

// Sized to the phone viewport the app is designed against, so a component
// that branches on window dimensions renders its narrow layout here too.
GlobalRegistrator.register({ width: 390, height: 844, url: "http://localhost/" });

// Capture real leaf-dep exports for tests' afterAll restoration. `require`
// runs at statement-order (vs ESM `import` which hoists), so the DOM
// registration above lands first — `common`-side modules consumed by these
// captures will see the stub.
//
// We spread the full namespace (not just a hand-picked subset) because
// these libs' methods reference each other through `module.exports` at
// runtime — e.g. `bcrypt.hash` internally calls `module.exports.genSalt`.
// If `restoreLeaves` then re-mocks bcrypt to a partial object, the
// missing-internal-reference crashes the next test file's bcrypt call.
const realPg = require("pg");
const realBcrypt = require("bcrypt");

(globalThis as Record<string, unknown>).__REAL_PG = {
  ...realPg,
  default: realPg.default ?? realPg,
};
(globalThis as Record<string, unknown>).__REAL_BCRYPT = {
  ...realBcrypt,
  default: realBcrypt.default ?? realBcrypt,
};
