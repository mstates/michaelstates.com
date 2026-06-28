import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Real axe-core run against the rendered homepage across WCAG 2.0/2.1/2.2 A & AA.
// As routes are added, add one spec per route (or parametrize over a route list).
test.describe("homepage accessibility", () => {
  test("has no WCAG 2.0/2.1/2.2 A & AA violations", async ({ page }) => {
    await page.goto("/");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();

    expect(results.violations).toEqual([]);
  });
});
