import { expect, test } from "./support/fixtures";

test.describe("Player Profile", () => {
  test.beforeEach(async ({ homePage, page }) => {
    await homePage.goto();
    
    // Wait for initial profile creation/loading (handled by app)
    // The "Modifier mon profil" button appearing confirms profile is loaded
    await expect(
      page.getByRole("button", { name: "Modifier mon profil" }),
    ).toBeVisible({ timeout: 10000 });
  });

  test("[P0] should allow updating pseudo and avatar", async ({
    page,
    playerProfile,
    openProfileDialog,
    updateProfile,
  }) => {
    // GIVEN: User opens profile dialog
    await openProfileDialog();
    await expect(page.getByRole("dialog")).toBeVisible();

    // WHEN: User updates profile
    const newPseudo = "New-Pseudo-" + Math.floor(Math.random() * 1000);
    await updateProfile({
      pseudo: newPseudo,
      avatar_config: playerProfile.avatar_config,
    });

    // THEN: Dialog closes and profile badge updates
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(
      page.getByRole("button", { name: "Modifier mon profil" }),
    ).toContainText(newPseudo);
  });

  test("[P1] should persist profile changes after reload", async ({
    page,
    openProfileDialog,
    updateProfile,
  }) => {
    // GIVEN: User updates profile
    await openProfileDialog();
    const newPseudo = "Persist-" + Math.floor(Math.random() * 1000);
    await updateProfile({ pseudo: newPseudo });
    await expect(
      page.getByRole("button", { name: "Modifier mon profil" }),
    ).toContainText(newPseudo);

    // WHEN: Page is reloaded
    await page.reload();

    // THEN: Profile changes persist
    await expect(
      page.getByRole("button", { name: "Modifier mon profil" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Modifier mon profil" }),
    ).toContainText(newPseudo);
  });
});
