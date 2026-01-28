import { joinGame } from "./support/actions/home.actions";
import { verifyLobbyElements } from "./support/actions/lobby.actions";
import { setupE2EAuth, teardownE2EAuth } from "./support/auth.utils";
import { expect, test } from "./support/fixtures";

test.describe("Join Game (Story 2.2)", () => {
  test.setTimeout(60000); // Increase timeout for slower CI/local envs

  test.beforeEach(async ({ homePage, page }) => {
    // Force new user to ensure clean state (name, avatar) for lobby verification
    await setupE2EAuth(page, { force: true });
    await homePage.goto();
  });

  test("[P1] Manual Join: User enters code on Home Page", async ({
    page,
    homePage,
    lobbyPage,
    browser,
  }) => {
    // --- User A (Host) ---
    // homePage fixture handles auth and cleanup for User A
    await homePage.goto();

    // Verify Host is logged in
    try {
      await expect(
        page.getByRole("button", { name: "CRÉER UNE PARTIE" }),
      ).toBeVisible({ timeout: 15000 });
    } catch (e) {
      console.log("Host Create Button not visible. Page state:");
      console.log(
        await page.evaluate(() => document.body.innerText.substring(0, 500)),
      );
      console.log("Host Cookies:", await page.evaluate(() => document.cookie));
      throw e;
    }

    await page.getByRole("button", { name: "CRÉER UNE PARTIE" }).click();
    const code = await lobbyPage.getGameCode();

    // --- User B (Joiner) ---
    const contextB = await browser.newContext({
      baseURL: "http://localhost:3000",
    });
    const pageB = await contextB.newPage();
    const authB = await setupE2EAuth(pageB, { force: true });

    try {
      await pageB.goto("/");
      // User B is already auth via setupE2EAuth

      // Enter code
      await joinGame(pageB, code);

      // Verify B is in Lobby
      await verifyLobbyElements(pageB);

      // Verify A sees B
      const profileButtonB = pageB.getByRole("button", {
        name: "Modifier mon profil",
      });
      const nameB = (await profileButtonB.textContent()) || "";
      await lobbyPage.verifyPlayerInList(nameB);
    } finally {
      if (authB.cleanupUserId)
        await teardownE2EAuth(pageB, authB.cleanupUserId);
      await contextB.close();
    }
  });
});
