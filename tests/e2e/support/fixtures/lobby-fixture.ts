import { test as base } from "@playwright/test";
import {
  getGameCode,
  verifyHostControls,
  verifyLobbyElements,
  verifyPlayerInList,
} from "../actions/lobby.actions";

type LobbyFixture = {
  lobbyPage: {
    verifyElements: () => Promise<void>;
    verifyHostControls: () => Promise<void>;
    getGameCode: () => Promise<string>;
    verifyPlayerInList: (name: string) => Promise<void>;
    goto: (code: string) => Promise<void>;
  };
};

export const test = base.extend<LobbyFixture>({
  lobbyPage: async ({ page }, use) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use({
      verifyElements: async () => verifyLobbyElements(page),
      verifyHostControls: async () => verifyHostControls(page),
      getGameCode: async () => getGameCode(page),
      verifyPlayerInList: async (name) => verifyPlayerInList(page, name),
      goto: async (code) => {
        await page.goto(`/room/${code}`);
      },
    });
  },
});
