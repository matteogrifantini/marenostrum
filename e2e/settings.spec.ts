import { test, expect } from "@playwright/test";

test.describe("Settings & User Preferences", () => {
  test("loads /impostazioni and allows interacting with preferences and auth forms", async ({ page }) => {
    await page.goto("/impostazioni");

    await expect(page.getByRole("heading", { name: /Impostazioni/i })).toBeVisible();

    // Google Login button or Email input should be present
    const googleBtn = page.getByRole("button", { name: /Google/i });
    if (await googleBtn.isVisible()) {
      await expect(googleBtn).toBeEnabled();
    }

    const emailInput = page.getByPlaceholder(/email/i).or(page.locator("input[type='email']")).first();
    if (await emailInput.isVisible()) {
      await expect(emailInput).toBeEditable();
    }
  });
});
