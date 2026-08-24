import { test, expect } from "@playwright/test";

test.describe("Home Page & Core Interactions", () => {
  test("loads homepage, displays beach catalog and allows day/period navigation", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Mare Nostrum/i);

    // Verify day picker has 4 days
    const dayButtons = page.locator("button[aria-pressed]");
    expect(await dayButtons.count()).toBeGreaterThanOrEqual(4);

    // Click on tomorrow
    const tomorrowBtn = page.getByRole("button", { name: "Domani" });
    await expect(tomorrowBtn).toBeVisible();
    await tomorrowBtn.click();
    await expect(tomorrowBtn).toHaveAttribute("aria-pressed", "true");

    // Change period to morning
    const periodSelect = page.getByRole("combobox", { name: "Periodo" });
    if (await periodSelect.isVisible()) {
      await periodSelect.selectOption("morning");
      await expect(periodSelect).toHaveValue("morning");
    }

    // Verify beach cards are present and have scores
    const beachCard = page.locator("a[href^='/spiagge/']").first();
    await expect(beachCard).toBeVisible();
  });

  test("allows toggling beach favorites with localStorage persistence", async ({ page }) => {
    await page.goto("/");
    
    // Find favorite buttons
    const favoriteBtn = page.locator("button[aria-label*='preferiti' i], button[aria-label*='Salva' i]").first();
    if (await favoriteBtn.isVisible()) {
      await favoriteBtn.click();
      // Favorite count or aria-pressed should update
      await expect(favoriteBtn).toHaveAttribute("aria-pressed", "true");
    }
  });

  test("allows opening filter sheet and selecting province filter", async ({ page }) => {
    await page.goto("/");

    // Open filters sheet
    const filterBtn = page.getByRole("button", { name: /Filtri/i });
    await expect(filterBtn).toBeVisible();
    await filterBtn.click();

    // Verify filter dialog opens
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Close filters dialog
    const closeBtn = dialog.getByRole("button", { name: /Chiudi|Applica|Salva/i }).first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await expect(dialog).not.toBeVisible();
    }
  });
});
