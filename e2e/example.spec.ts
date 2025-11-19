/**
 * E2E Tests
 * 
 * Playwright end-to-end tests
 */

import { test, expect } from "@playwright/test";

test("homepage loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/12-Step Recovery Companion/);
});

