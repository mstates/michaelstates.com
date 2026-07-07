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

  test("renders through BaseLayout: title and main landmark", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page).toHaveTitle("Michael States");
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("skip link: first in tab order, visible on focus, moves focus to main", async ({
    page,
  }) => {
    await page.goto("/");
    const skipLink = page.getByRole("link", { name: "Skip to main content" });

    await page.keyboard.press("Tab");
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeVisible();

    // Playwright counts the 1×1 sr-only clip box as "visible" — geometry is the real
    // proof the link un-hid, and doubles as the WCAG 2.2 §2.5.8 24×24 target check.
    const box = await skipLink.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(24);
    expect(box!.height).toBeGreaterThanOrEqual(24);

    await page.keyboard.press("Enter");
    await expect(page.locator("#main")).toBeFocused();
  });
});
