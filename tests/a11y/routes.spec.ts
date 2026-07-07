import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { AXE_TAGS, routes } from "./routes";

// Parametrized over the route manifest (routes.ts): every entry gets a document
// contract and a real axe-core run against the rendered output. dist-parity.spec.ts
// guarantees the manifest can't silently miss a built route.

for (const route of routes) {
  test.describe(`${route.id} accessibility`, () => {
    test("serves the expected document: status, title, landmarks", async ({
      page,
    }) => {
      const response = await page.goto(route.path);
      expect(response?.status()).toBe(route.status);

      // Render guard: confirm we're on the intended document (not an empty/wrong one),
      // so the assertions below can't silently pass against the wrong page.
      if (route.h1 !== undefined) {
        await expect(
          page.getByRole("heading", { level: 1, name: route.h1 }),
        ).toBeVisible();
      }

      await expect(page).toHaveTitle(route.title);
      await expect(page.getByRole("main")).toBeVisible();
      // Layout-level skip link present on every route; keyboard operability is covered
      // once below (same BaseLayout code path everywhere).
      await expect(
        page.getByRole("link", { name: "Skip to main content" }),
      ).toBeAttached();
    });

    test("has no WCAG 2.0/2.1/2.2 A & AA violations", async ({ page }) => {
      const response = await page.goto(route.path);

      // Status + render guard repeated here so axe can't scan the wrong document.
      expect(response?.status()).toBe(route.status);
      if (route.h1 !== undefined) {
        await expect(
          page.getByRole("heading", { level: 1, name: route.h1 }),
        ).toBeVisible();
      }

      const results = await new AxeBuilder({ page })
        .withTags(AXE_TAGS)
        .analyze();

      expect(results.violations).toEqual([]);
    });
  });
}

// Run once, not per route: the skip link is BaseLayout behavior, identical on every
// page. "/" is the canonical instance.
test.describe("BaseLayout skip link (run once)", () => {
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
