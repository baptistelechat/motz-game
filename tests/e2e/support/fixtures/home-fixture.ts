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
        // Enable console logs from browser
        page.on('console', msg => console.log(`BROWSER: ${msg.text()}`));

        // Mock Supabase Auth Routes to bypass Captcha/Backend verification
        await page.route(/.*\/auth\/v1\/.*/, async (route) => {
          const url = route.request().url();
          console.log(`[MOCK] Intercepting: ${url}`);
          
          if (url.includes("signup") || url.includes("token") || url.includes("anonymous")) {
            console.log(`[MOCK] Returning fake session for: ${url}`);
            await route.fulfill({
              status: 200,
              contentType: "application/json",
              body: JSON.stringify({
                access_token: "fake-access-token",
                token_type: "bearer",
                expires_in: 3600,
                refresh_token: "fake-refresh-token",
                user: {
                  id: "fake-user-id",
                  aud: "authenticated",
                  role: "authenticated",
                  email: "",
                  app_metadata: { provider: "anonymous" },
                  user_metadata: {},
                  created_at: new Date().toISOString(),
                },
              }),
            });
            return;
          }
          
          if (url.includes("user")) {
             console.log(`[MOCK] Returning fake user for: ${url}`);
             await route.fulfill({
              status: 200,
              contentType: "application/json",
              body: JSON.stringify({
                id: "fake-user-id",
                aud: "authenticated",
                role: "authenticated",
                email: "",
                app_metadata: { provider: "anonymous" },
                user_metadata: {},
                created_at: new Date().toISOString(),
              }),
            });
            return;
          }

          // Continue other requests
          await route.continue();
        });

        // Mock Supabase Rest API (Database) to prevent 401 errors with fake token
        await page.route(/.*\/rest\/v1\/.*/, async (route) => {
          const url = route.request().url();
          console.log(`[MOCK] Intercepting REST: ${url}`);
          
          if (url.includes("players")) {
             console.log(`[MOCK] Returning fake profile for: ${url}`);
             await route.fulfill({
              status: 200,
              contentType: "application/json",
              body: JSON.stringify({
                id: "fake-user-id",
                pseudo: "TestPlayer",
                avatar_config: {
                  animal: "cat",
                  color: "blue"
                },
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }),
            });
            return;
          }

          await route.continue();
        });

        await page.goto("/");
        
        // Bypass Captcha if in E2E mode
        const bypassBtn = page.getByTestId("e2e-bypass-captcha");
        try {
          console.log("Waiting for bypass button...");
          // Wait longer to ensure it renders
          await bypassBtn.waitFor({ state: "visible", timeout: 5000 });
          console.log("Clicking bypass button...");
          await bypassBtn.click();
        } catch (e) {
          console.log("Bypass button not found or already authenticated");
        }
      },
      verifyElements: async () => verifyHomePageElements(page),
      verifyStatus: async () => verifySystemStatus(),
    });
  },
});
