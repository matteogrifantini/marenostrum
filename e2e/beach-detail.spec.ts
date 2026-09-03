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

  test("opens photo lightbox and closes it on browser back button without leaving the beach page", async ({ page }) => {
    await page.goto("/spiagge/mondello");

    // Click photo to open lightbox
    const openPhotoBtn = page.getByRole("button", { name: /Apri foto di Mondello/i });
    await expect(openPhotoBtn).toBeVisible();
    await openPhotoBtn.click();

    // Dialog should be open
    const dialog = page.getByRole("dialog", { name: /Foto di Mondello/i });
    await expect(dialog).toBeVisible();

    // Press browser back
    await page.goBack();

    // Dialog should close, and URL remains on /spiagge/mondello
    await expect(dialog).not.toBeVisible();
    expect(page.url()).toContain("/spiagge/mondello");
    await expect(page.getByRole("heading", { name: /Mondello/i, level: 1 })).toBeVisible();
  });

  test("shows webcam section and neutral disclosure when beach has webcam data", async ({ page }) => {
    await page.goto("/spiagge/mondello");

    const webcamHeading = page.getByRole("heading", { name: /Webcam ·/i });
    await expect(webcamHeading).toBeVisible();
    await expect(page.getByText(/Fonte esterna; verifica la disponibilità sul sito del provider/i)).toBeVisible();
    await expect(page.getByText(/^LIVE$/)).not.toBeVisible();
  });
});
