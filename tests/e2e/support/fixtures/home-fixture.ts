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
        // page.on('console', msg => console.log(`BROWSER: ${msg.text()}`));
        // page.on('pageerror', err => console.log(`BROWSER ERROR: ${err}`));

        // Log all network requests to debug mocking
        // await page.route('**', async (route) => {
        //    console.log(`[NET] ${route.request().method()} ${route.request().url()}`);
        //    await route.fallback();
        // });

        // Mock Supabase Auth Routes to bypass Captcha/Backend verification
        await page.route("**/auth/v1/**", async (route) => {
          const url = route.request().url();

          if (
            url.includes("signup") ||
            url.includes("token") ||
            url.includes("anonymous")
          ) {
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
        let currentProfile = {
          id: "fake-user-id",
          pseudo: "TestPlayer",
          avatar_config: {
            animal: "chat",
            color: "#e63946",
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        await page.route("**/rest/v1/**", async (route) => {
          const url = route.request().url();
          const method = route.request().method();

          if (url.includes("players")) {
            if (method === "GET") {
              await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify(currentProfile),
              });
            } else if (method === "PATCH" || method === "POST") {
              const data = route.request().postDataJSON();
              currentProfile = { ...currentProfile, ...data };
              await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify(currentProfile),
              });
            }
            return;
          }

          // Mock successful empty response for other DB operations
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({}),
          });
        });

        await page.goto("/");

        // Bypass Captcha if in E2E mode
        const bypassButton = page.getByTestId("e2e-bypass-captcha");
        try {
          // Wait for the button to be visible (it might take a moment to mount)
          await bypassButton.waitFor({ state: "visible", timeout: 5000 });
          await bypassButton.click();
        } catch (e) {
          // Ignore if button not found - might be already authenticated or not in E2E mode
          console.log(
            "CaptchaGuard: Bypass button not found - not in E2E mode or already authenticated",
            e,
          );
        }
      },
      verifyElements: async () => verifyHomePageElements(page),
      verifyStatus: async () => verifySystemStatus(),
    });
  },
});
