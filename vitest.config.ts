import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";

const dirname = path.dirname(fileURLToPath(import.meta.url));

// Two projects under one `pnpm test` invocation. Separate from the Playwright a11y
// suite, which exercises the *rendered* site. Vitest uses its own Vite, independent
// of Astro's.
export default defineConfig({
  test: {
    projects: [
      // Component/unit tests (jsdom).
      {
        plugins: [react()],
        test: {
          name: "unit",
          environment: "jsdom",
          globals: true,
          setupFiles: ["./vitest.setup.ts"],
          include: ["src/**/*.test.{ts,tsx}"],
        },
      },
      // Stories as tests: every story renders in real chromium; addon-a11y's
      // `a11y: { test: "error" }` in preview.ts makes axe violations hard failures.
      // Storybook's own Vite pipeline (.storybook/main.ts viteFinal) supplies the
      // react/tailwind plugins here — do not add react() to this project.
      {
        plugins: [
          storybookTest({ configDir: path.join(dirname, ".storybook") }),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
          },
          setupFiles: [".storybook/vitest.setup.ts"],
        },
      },
    ],
  },
});
