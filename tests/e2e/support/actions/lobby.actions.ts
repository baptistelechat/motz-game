import { Page, expect } from "@playwright/test";

export async function verifyLobbyElements(page: Page) {
  try {
    // Verify Heading (Common to all)
    // Use getByRole heading level 1 to be more specific and robust
    await expect(
      page.getByRole("heading", { level: 1, name: /SALLE D'ATTENTE/i }),
    ).toBeVisible({
      timeout: 10000,
    });
  } catch (e) {
    console.log("Verify Lobby Failed. Current Page URL:", page.url());
    console.log("Page Content Preview:");
    console.log(
      await page.evaluate(() => document.body.innerText.substring(0, 1000)),
    );
    throw e;
  }

  // Verify we are actually in the lobby (profile button should be visible)
  await expect(
    page.getByRole("button", { name: "Modifier mon profil" }),
  ).toBeVisible();
}

export async function verifyHostControls(page: Page) {
  // Verify Copy Link Button (Host Only)
  // Button text is "COPIER" (or "COPIÉ !")
  await expect(page.getByRole("button", { name: "COPIER" })).toBeVisible();
}

export async function getGameCode(page: Page): Promise<string> {
  // The code is displayed as text matching 6 alphanumeric characters
  // We exclude "COPIER" which is also 6 chars and matches the regex
  // We can be more specific by looking for the code styling class or context
  // Or simply filtering out the button text.

  // Method 1: Use specific locator for the code display
  // Looking at the error log, the code is in a span with 'tracking-widest'.
  // If multiple exist (e.g. mobile/desktop duplicates), take the first visible one.
  const codeLocator = page
    .locator("span.tracking-widest")
    .filter({ hasText: /^[A-Z0-9]{6}$/ })
    .first();

  await expect(codeLocator).toBeVisible({ timeout: 10000 });
  const code = await codeLocator.textContent();
  if (!code) throw new Error("Could not find game code");
  return code;
}

export async function verifyPlayerInList(page: Page, playerName: string) {
  // Assuming players are listed in a way that their name is visible text
  // We check that the text is visible on the page
  // Use exact: true to avoid matching toast notifications like "Name joined the game"
  await expect(page.getByText(playerName, { exact: true })).toBeVisible({
    timeout: 10000,
  });
}
