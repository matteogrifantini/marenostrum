import { test, expect } from "@playwright/test";

test.describe("Beach Detail Page", () => {
  test("displays beach hero, expandable info accordion and weather condition cards", async ({ page }) => {
    await page.goto("/spiagge/mondello");

    // Title / Heading
    await expect(page.getByRole("heading", { name: /Mondello/i, level: 1 })).toBeVisible();

    // Info accordion trigger
    const infoTrigger = page.getByRole("button", { name: /Scopri la spiaggia/i }).first();
    await expect(infoTrigger).toBeVisible();

    // Click accordion
    await infoTrigger.click();

    // Verify beach description or categories are expanded
    const description = page.locator("p").filter({ hasText: /sabbia|palermo|costa|fondale/i }).first();
    await expect(description).toBeVisible();

    // Verify weather conditions cards (Vento, Onde, Temperatura, etc.)
    await expect(page.getByText(/Vento/i).first()).toBeVisible();
    await expect(page.getByText(/Onde|Mare/i).first()).toBeVisible();
  });
});
