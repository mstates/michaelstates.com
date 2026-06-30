import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Real axe-core run against the rendered 404 page across WCAG 2.0/2.1/2.2 A & AA.
// Mirrors homepage.spec.ts. The target is intentionally a non-existent route so the
// static 404.html is served (astro preview / Cloudflare Pages serve it for unmatched paths).
test.describe("not-found (404) accessibility", () => {
  test("has no WCAG 2.0/2.1/2.2 A & AA violations", async ({ page }) => {
    const response = await page.goto("/this-route-does-not-exist-inc223");

    // The unmatched route serves the static 404 document with a real 404 status
    // (verified against astro preview, which the a11y harness also uses to serve dist/).
    expect(response?.status()).toBe(404);

    // Render guard: confirm we're scanning the actual 404 page (not an empty/wrong one),
    // so the spec can't silently pass against the wrong document.
    await expect(
      page.getByRole("heading", { level: 1, name: "Page not found" }),
    ).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();

    expect(results.violations).toEqual([]);
  });
});
