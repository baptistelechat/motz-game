import { expect } from "@playwright/test";
import { test } from "./support/fixtures/home-fixture";

test.describe("Game Creation", () => {
  test("should create a game and redirect to lobby", async ({
    page,
    homePage,
  }) => {
    // 1. Navigate to home
    await homePage.goto();

    // Check for E2E Bypass button and click it if visible
    // We wait briefly because it might take a moment to appear after initial loading
    try {
      const bypassButton = page.getByTestId("e2e-bypass-captcha");
      await bypassButton.waitFor({ state: "visible", timeout: 5000 });
      await bypassButton.click();
    } catch {
      // Ignore if not found (maybe already logged in or no e2e mode)
      console.log("Bypass button not found or not needed");
    }

    // 2. Wait for profile initialization (Loading screen disappears)
    // The button "CRÉER UNE PARTIE" should appear
    await expect(
      page.getByRole("button", { name: "CRÉER UNE PARTIE" }),
    ).toBeVisible({ timeout: 15000 });

    // 3. Click Create Game
    await page.getByRole("button", { name: "CRÉER UNE PARTIE" }).click();

    // 4. Wait for redirection to room
    await expect(page).toHaveURL(/\/room\/[A-Z0-9]{6}/, { timeout: 20000 });

    // 5. Verify Lobby UI
    await expect(
      page.getByRole("heading", { name: "SALLE D'ATTENTE" }),
    ).toBeVisible();

    // 6. Verify Game Code
    // Verify code format (6 chars alphanumeric)
    await expect(page.getByText(/^[A-Z0-9]{6}$/)).toBeVisible();
    await expect(
      page.getByRole("button", { name: "COPIER LE LIEN" }),
    ).toBeVisible();
  });
});
