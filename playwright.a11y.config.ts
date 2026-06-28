import { defineConfig, devices } from "@playwright/test";

// Accessibility suite: drives the *built* static site (astro preview serves dist/) and
// runs axe-core against rendered output — the strongest a11y check we have. Kept as its
// own config so `pnpm test:a11y` is independent of any future e2e config.
const PORT = 4321;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests/a11y",
  reporter: [["html", { open: "never" }], ["list"]],
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // CI builds before this step, so dist/ exists. Locally, run `pnpm build` first; let
  // preview own the port (a stray `pnpm dev` on 4321 would serve un-built output).
  webServer: {
    command: `pnpm preview --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
