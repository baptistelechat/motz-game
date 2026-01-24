import { expect } from "@playwright/test";
import { setupE2EAuth, teardownE2EAuth } from "./support/auth.utils";
import { test } from "./support/fixtures/home-fixture";

test.describe("Game Creation", () => {
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

  test("should create a game and redirect to lobby", async ({
    page,
    homePage,
  }) => {
    // 1. Navigate to home
    await homePage.goto();

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
    // Use specific locator to avoid matching "COPIER" button or duplicates
    const codeLocator = page
      .locator("span.tracking-widest")
      .filter({ hasText: /^[A-Z0-9]{6}$/ })
      .first();

    await expect(codeLocator).toBeVisible();
    await expect(
      page.getByRole("button", { name: "COPIER" }),
    ).toBeVisible();
  });
});
