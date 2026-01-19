/* eslint-disable react-hooks/rules-of-hooks */
import { PlayerProfile } from "@/lib/schemas/player-schema";
import { test as base } from "@playwright/test";
import { createPlayerProfile } from "../factories/player.factory";

interface PlayerFixture {
  playerProfile: PlayerProfile;
  openProfileDialog: () => Promise<void>;
  updateProfile: (profile: Partial<PlayerProfile>) => Promise<void>;
}

export const test = base.extend<PlayerFixture>({
  playerProfile: async ({}, use) => {
    const profile = createPlayerProfile();
    await use(profile);
  },
  openProfileDialog: async ({ page }, use) => {
    await use(async () => {
      await page.getByRole("button", { name: "Modifier mon profil" }).click();
    });
  },
  updateProfile: async ({ page }, use) => {
    await use(async (profile) => {
      if (profile.pseudo) {
        await page.fill('input[id="pseudo"]', profile.pseudo);
      }
      if (profile.avatar_config?.animal) {
        // Open Select
        // Assuming generic SelectTrigger behavior, need to click the trigger first.
        // In ProfileForm, SelectTrigger contains AvatarDisplay and text.
        // Let's try to find it by the "Avatar" label.
        // The label is "Avatar", the select is next to it.
        // We can try to click the trigger by looking for the current animal text or generic select trigger.
        // Or finding the select trigger near the "Avatar" label.
        // Using a locator strategy:
        // await page.click('text=Avatar >> .. >> [role="combobox"]'); // pseudo-code
        // Better:
        // Find the label "Avatar", then finding the select trigger.
        // But the select trigger in radix-ui usually has role="combobox".

        // Let's try clicking the current avatar/animal name to open the select.
        // Or use locator('button[role="combobox"]').last() if there are multiple?
        // There is only one Select in ProfileForm.
        await page.getByRole("combobox").click();

        // Then select the item
        await page
          .getByRole("option", {
            name: profile.avatar_config.animal,
            exact: false,
          })
          .click();
      }
      if (profile.avatar_config?.color) {
        await page.click(
          `button[aria-label="Choisir la couleur ${profile.avatar_config.color}"]`,
        );
      }
      await page.getByRole("button", { name: "C'EST PARTI !" }).click();
    });
  },
});
