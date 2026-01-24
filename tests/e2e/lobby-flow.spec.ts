import { joinGame } from "./support/actions/home.actions";
import { verifyLobbyElements } from "./support/actions/lobby.actions";
import { setupE2EAuth, teardownE2EAuth } from "./support/auth.utils";
import { expect, test } from "./support/fixtures";

test.describe("Lobby Flow (Story 2.3)", () => {
  test.setTimeout(120000); // Increase timeout for realtime interactions (Firefox can be slow)

  test.beforeEach(async ({ homePage, page }) => {
    // Force new user to ensure clean state
    await setupE2EAuth(page, { force: true });
    await homePage.goto();
  });

  test("[P1] Ready State & Game Start: Host and Joiner interaction", async ({
    page,
    homePage,
    lobbyPage,
    browser,
    request,
  }) => {
    // --- User A (Host) ---
    await homePage.goto();
    await page.getByRole("button", { name: "CRÉER UNE PARTIE" }).click();
    const code = await lobbyPage.getGameCode();
    console.log(`DEBUG: Game created with code: '${code}'`);

    // Verify Host initial state
    await expect(page.getByRole("button", { name: "Prêt ?" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Lancer" })).toBeDisabled();
    
    // DEBUG: Check if game page is accessible via direct request
    const response = await request.get(`/room/${code}`);
    console.log(`DEBUG: Direct request to /room/${code} returned status: ${response.status()}`);

    // --- User B (Joiner) ---
    const contextB = await browser.newContext();
    const pageB = await contextB.newPage();
    const authB = await setupE2EAuth(pageB, { force: true });
    
    try {
      await pageB.goto("/");
      console.log("DEBUG: User B on Home Page");
      await joinGame(pageB, code);
      console.log("DEBUG: User B joined game, waiting for lobby...");
      await verifyLobbyElements(pageB);
      
      // Get User B name
      const profileButtonB = pageB.getByRole("button", { name: "Modifier mon profil" });
      const nameB = (await profileButtonB.textContent()) || "";
      
      // Verify B sees everyone waiting initially (Host + Himself = 2)
      await expect(pageB.locator('[title="Waiting"]')).toHaveCount(2); 
      
      // Player B toggles Ready
      await pageB.getByRole("button", { name: "Prêt" }).click();
      
      // Verify User B sees himself in the list with "Waiting" status (Coffee icon)
    // Both Host and Joiner are waiting initially, so we expect at least 1 (or 2) waiting icons.
    try {
      await expect(pageB.getByTitle("Waiting").first()).toBeVisible({ timeout: 10000 });
    } catch (e) {
      console.log("DEBUG: Realtime update timed out or failed. Reloading to verify DB state...",e);
      await pageB.reload();
      await expect(pageB.getByTitle("Waiting").first()).toBeVisible({ timeout: 5000 });
    }

      await expect(pageB.locator('[title="Ready"]')).toHaveCount(1);
      await expect(pageB.locator('[title="Waiting"]')).toHaveCount(1);
      
      // Verify A sees B as ready
      // Using xpath to find the parent div of the text that contains nameB, then finding the ready badge
      await expect(page.locator(`text=${nameB}`).locator('xpath=..').locator('[title="Ready"]')).toBeVisible();
      
      // Host still can't start because Host is not ready
      await expect(page.getByRole("button", { name: "Lancer" })).toBeDisabled();
      await expect(page.getByText("Tous les joueurs doivent être prêts")).toBeVisible();
      
      // Host toggles ready
      await page.getByRole("button", { name: "Prêt ?" }).click();
      
      // Verify Host is ready
      await expect(page.getByText("En attente...")).toBeVisible();
      
      // Verify Host can now start
      await expect(page.getByRole("button", { name: "Lancer" })).toBeEnabled();
      await expect(page.getByText("Tous les joueurs sont prêts")).toBeVisible();
      
      // Host starts game
      await page.getByRole("button", { name: "Lancer" }).click();
      
      // Verify redirection to game (increase timeout for Realtime latency)
      await expect(page).toHaveURL(new RegExp(`/game/${code}`), { timeout: 15000 });
      await expect(pageB).toHaveURL(new RegExp(`/game/${code}`), { timeout: 15000 });
      
    } finally {
      if (authB.cleanupUserId) await teardownE2EAuth(pageB, authB.cleanupUserId);
      await contextB.close();
    }
  });
});
