import { test as base } from "@playwright/test";
import {
  verifyHomePageElements,
  verifySystemStatus,
} from "../actions/home.actions";

type HomeFixture = {
  homePage: {
    verifyElements: () => Promise<void>;
    verifyStatus: () => Promise<void>;
    goto: () => Promise<void>;
  };
};

export const test = base.extend<HomeFixture>({
  homePage: async ({ page }, use) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use({
      goto: async () => {
        await page.goto("/");
      },
      verifyElements: async () => verifyHomePageElements(page),
      verifyStatus: async () => verifySystemStatus(),
    });
  },
});
