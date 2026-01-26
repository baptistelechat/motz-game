import { expect } from "@playwright/test";
import { setupE2EAuth, teardownE2EAuth } from "./support/auth.utils";
import { test } from "./support/fixtures/home-fixture";

test.describe("Round Flow", () => {
  let userId: string;

  test.beforeEach(async ({ page }) => {
    const auth = await setupE2EAuth(page, { force: true });
    userId = auth.userId;
  });

  test.afterEach(async ({ page }) => {
    if (userId) {
      await teardownE2EAuth(page, userId);
    }
  });

  test("should start game and display first round", async ({
    page,
    homePage,
  }) => {
    // 1. Navigate to home
    await homePage.goto();

    // 2. Wait for profile and Create Game button
    await expect(
      page.getByRole("button", { name: "CRÉER UNE PARTIE" }),
    ).toBeVisible({ timeout: 15000 });

    // 3. Click Create Game
    await page.getByRole("button", { name: "CRÉER UNE PARTIE" }).click();

    // 4. Wait for redirection to room
    await expect(page).toHaveURL(/\/room\/[A-Z0-9]{6}/, { timeout: 20000 });

    // 5. Host toggles Ready
    // Button text changes from "Prêt ?" to "En attente..."
    const readyButton = page.getByRole("button", { name: "Prêt ?" });
    await readyButton.click();

    // Wait a bit for server action to complete
    await page.waitForTimeout(1000);

    // Reload page to force state update (in case Realtime is flaky in test env)
    await page.reload();

    // Wait for "Lancer" button to be enabled
    const startButton = page.getByRole("button", { name: "Lancer" });
    await expect(startButton).toBeEnabled({ timeout: 10000 });
    await startButton.click();

    // 7. Wait for redirection to game page
    await expect(page).toHaveURL(/\/game\/[A-Z0-9]{6}/, { timeout: 20000 });

    // 8. Verify Game UI
    await expect(page.getByText("MANCHE 1")).toBeVisible();
    await expect(page.getByText("LETTRE")).toBeVisible();
    await expect(page.getByText("THÈME")).toBeVisible();

    // 9. Verify Round Content (Letter and Theme should be non-empty)
    // We expect a single letter for the letter constraint
    const letterConstraint = page.locator(".text-6xl");
    await expect(letterConstraint).toBeVisible();
    await expect(letterConstraint).toHaveText(/^[A-Z]$/);

    // Look for the theme value (text-3xl inside the card)
    // We use a more specific selector to avoid conflict with other 3xl texts
    const themeConstraint = page.locator(".bg-card .text-3xl");
    await expect(themeConstraint).toBeVisible();

    const themeText = await themeConstraint.innerText();
    console.log(`[TEST] Round started with Theme: ${themeText}`);
    expect(themeText.length).toBeGreaterThan(0);
  });
});
