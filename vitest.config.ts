import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Component/unit test runner (jsdom). Separate from the Playwright a11y suite, which
// exercises the *rendered* site. Vitest uses its own Vite, independent of Astro's.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
