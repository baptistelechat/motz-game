import { joinGame } from "./support/actions/home.actions";
import {
  verifyLobbyElements,
  verifyPlayerInList,
} from "./support/actions/lobby.actions";
import { setupE2EAuth, teardownE2EAuth } from "./support/auth.utils";
import { expect, test } from "./support/fixtures";

test.describe("Story 3.1: Manche & Distribution Cartes", () => {
  test("[P0] Players should receive identical constraints when round starts", async ({
    page: hostPage,
    homePage,
    lobbyPage,
    browser,
  }) => {
    test.setTimeout(60000); // Increase timeout for Realtime sync
    // 1. Host creates game
    // Host is already authenticated via homePage fixture
    await homePage.goto();
    await homePage.createGame();
    await lobbyPage.verifyElements();
    const gameCode = await lobbyPage.getGameCode();

    // Get Host Name
    const hostProfileButton = hostPage.getByRole("button", {
      name: "Modifier mon profil",
    });
    const hostName = (await hostProfileButton.textContent()) || "";
    expect(hostName).not.toBe("");

    // 2. Guest joins game (New Context)
    const guestContext = await browser.newContext();
    const guestPage = await guestContext.newPage();

    // Authenticate Guest
    const guestAuth = await setupE2EAuth(guestPage, { force: true });

    await guestPage.goto("/");
    await joinGame(guestPage, gameCode);

    // Verify Guest in lobby
    await verifyLobbyElements(guestPage);

    // Get Guest Name
    const guestProfileButton = guestPage.getByRole("button", {
      name: "Modifier mon profil",
    });
    const guestName = (await guestProfileButton.textContent()) || "";
    expect(guestName).not.toBe("");

    // Verify players see each other
    await lobbyPage.verifyPlayerInList(guestName); // Host sees Guest
    await verifyPlayerInList(guestPage, hostName); // Guest sees Host

    // 2.5. Both players toggle Ready
    await hostPage.getByTestId("toggle-ready-button").click();
    await guestPage.getByTestId("toggle-ready-button").click();

    // Wait for "All players ready" message on Host
    await expect(
      hostPage.getByText("Tous les joueurs sont prêts"),
    ).toBeVisible({ timeout: 15000 });

    // 3. Host starts the round
    const startRoundButton = hostPage.getByTestId("start-round-button");

    // Check if button exists
    await expect(startRoundButton).toBeVisible({ timeout: 5000 });
    await startRoundButton.click();

    // 4. Verify Round Started & Constraints
    // Both players should see the constraints display
    const constraintDisplayHost = hostPage.getByTestId("constraint-display");
    const constraintDisplayGuest = guestPage.getByTestId("constraint-display");

    await expect(constraintDisplayHost).toBeVisible({ timeout: 15000 });
    await expect(constraintDisplayGuest).toBeVisible({ timeout: 15000 });

    // 5. Verify Constraints are Identical
    // We expect the text content to contain the constraints (Letter and Theme)
    const hostConstraints = await constraintDisplayHost.textContent();
    const guestConstraints = await constraintDisplayGuest.textContent();

    console.log("Host Constraints:", hostConstraints);
    console.log("Guest Constraints:", guestConstraints);

    expect(hostConstraints).toEqual(guestConstraints);
    expect(hostConstraints).not.toBe("");
    expect(hostConstraints).not.toBeNull();

    // Cleanup Guest
    if (guestAuth.cleanupUserId) {
      await teardownE2EAuth(guestPage, guestAuth.cleanupUserId);
    }
    await guestContext.close();
  });
});
