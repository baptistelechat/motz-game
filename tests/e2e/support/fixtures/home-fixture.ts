import { test as base } from "@playwright/test";
import {
  bypassCaptcha,
  verifyHomePageElements,
  verifySystemStatus,
} from "../actions/home.actions";
import { setupE2EAuth, teardownE2EAuth } from "../auth.utils";

type HomeFixture = {
  homePage: {
    verifyElements: () => Promise<void>;
    verifyStatus: () => Promise<void>;
    bypassCaptcha: () => Promise<void>;
    goto: () => Promise<void>;
    userId: string | null;
  };
};

export const test = base.extend<HomeFixture>({
  homePage: async ({ page }, use) => {
    // Setup Real Auth via E2E Backdoor
    const { userId, cleanupUserId } = await setupE2EAuth(page);

    // Provide the fixture to the test
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use({
      userId,
      goto: async () => {
        await page.goto("/");
      },
      bypassCaptcha: async () => bypassCaptcha(page),
      verifyElements: async () => verifyHomePageElements(page),
      verifyStatus: async () => verifySystemStatus(),
    });

    // Teardown: Cleanup User
    if (cleanupUserId) {
      await teardownE2EAuth(page, cleanupUserId);
    }
  },
});
