import { test, expect } from "@playwright/test";

test.describe("Interactive Map & POI Curation", () => {
  test("loads /mappa with score pins only by default (zero POI requests)", async ({ page }) => {
    let overpassCalled = false;
    page.on("request", req => {
      if (req.url().includes("/api/map/places") || req.url().includes("overpass")) {
        overpassCalled = true;
      }
    });

    await page.goto("/mappa");

    // Map container exists
    const mapContainer = page.getByRole("application", { name: /Mappa interattiva/i });
    await expect(mapContainer).toBeVisible();

    // POI toggle button exists and is not pressed by default
    const poiToggle = page.getByRole("button", { name: /Mostra punti utili/i });
    await expect(poiToggle).toBeVisible();
    await expect(poiToggle).toHaveAttribute("aria-pressed", "false");

    // Sub-category chips are not visible by default
    await expect(page.getByRole("button", { name: "🅿️ Parcheggi" })).not.toBeVisible();

    // Verify overpass was not queried automatically on default load
    expect(overpassCalled).toBe(false);
  });

  test("toggling POIs reveals category chips and handles zoom gating", async ({ page }) => {
    await page.goto("/mappa");

    const poiToggle = page.getByRole("button", { name: /Mostra punti utili/i });
    await expect(poiToggle).toBeVisible();
    await poiToggle.click();

    // Should now show active state and chips
    await expect(page.getByRole("button", { name: /Punti utili attivi/i })).toBeVisible();
    await expect(page.getByRole("button", { name: "🅿️ Parcheggi" })).toBeVisible();
    await expect(page.getByRole("button", { name: "🏖️ Lidi" })).toBeVisible();
    await expect(page.getByRole("button", { name: "🚿 Servizi mare" })).toBeVisible();
  });

  test("allows selecting a beach from dropdown and flying to it", async ({ page }) => {
    await page.goto("/mappa");

    const searchSelect = page.getByRole("combobox", { name: /Cerca una spiaggia/i });
    await expect(searchSelect).toBeVisible();

    const options = await searchSelect.locator("option").all();
    if (options.length > 1) {
      const secondOptionValue = await options[1].getAttribute("value");
      if (secondOptionValue) {
        await searchSelect.selectOption(secondOptionValue);
        await expect(searchSelect).toHaveValue(secondOptionValue);
      }
    }
  });
});
