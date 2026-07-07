import { readdirSync } from "node:fs";
import { sep } from "node:path";
import { fileURLToPath } from "node:url";
import { test, expect } from "@playwright/test";
import { distFileToRouteId, routes } from "./routes";

// Parity guard: every HTML route in built dist/ must have an entry in the route
// manifest (routes.ts). A page that ships without a manifest entry would otherwise get
// zero axe coverage — this makes that a red build, not a silent gap. Node-side only
// (reads dist/ directly; no browser). If dist/ is missing, readdirSync throws and the
// test fails — also deliberate.

const distDir = fileURLToPath(new URL("../../dist", import.meta.url));

test("every dist/ HTML route has a manifest entry in tests/a11y/routes.ts", () => {
  const distHtmlFiles = readdirSync(distDir, { recursive: true })
    .map((entry) => String(entry).split(sep).join("/"))
    .filter((entry) => entry.endsWith(".html"))
    .sort();

  // dist/ with no HTML at all means the build produced no pages — that's a broken
  // build, not "nothing to check".
  expect(distHtmlFiles.length).toBeGreaterThan(0);

  const manifestIds = new Set(routes.map((route) => route.id));
  const missing = distHtmlFiles
    .map((file) => ({ file, id: distFileToRouteId(file) }))
    .filter(({ id }) => !manifestIds.has(id));

  expect(
    missing,
    `dist route(s) missing from the a11y route manifest:\n` +
      missing.map(({ file, id }) => `  dist/${file} → "${id}"`).join("\n") +
      `\nAdd an entry for each to tests/a11y/routes.ts so the route gets full-axe coverage.`,
  ).toEqual([]);
});
