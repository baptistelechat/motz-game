import { Page, expect } from "@playwright/test";

export async function verifyLobbyElements(page: Page) {
  // Verify Heading (Common to all)
  // Use getByRole heading level 1 to be more specific and robust
  await expect(
    page.getByRole("heading", { level: 1, name: /SALLE D'ATTENTE/i }),
  ).toBeVisible({
    timeout: 10000,
  });

  // Verify we are actually in the lobby (profile button should be visible)
  await expect(
    page.getByRole("button", { name: "Modifier mon profil" }),
  ).toBeVisible();
}

export async function verifyHostControls(page: Page) {
  // Verify Copy Link Button (Host Only)
  await expect(
    page.getByRole("button", { name: "COPIER LE LIEN" }),
  ).toBeVisible();
}

export async function getGameCode(page: Page): Promise<string> {
  // The code is displayed as text matching 6 alphanumeric characters
  const codeLocator = page.getByText(/^[A-Z0-9]{6}$/);
  await expect(codeLocator).toBeVisible();
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
