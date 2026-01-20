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
    userId: string | null;
  };
};

export const test = base.extend<HomeFixture>({
  homePage: async ({ page }, use) => {
    // Setup Real Auth via E2E Backdoor
    let userId = "fake-user-id";
    let cleanupUserId: string | null = null;

    try {
      const response = await page.request.post("/api/e2e/auth");
      const session = await response.json();

      console.log("Auth API Response:", { status: response.status(), session });

      if (session?.user?.id) {
        userId = session.user.id;
        cleanupUserId = userId; // Mark for cleanup
        
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
        const projectRef = supabaseUrl.match(/https:\/\/(.*?)\./)?.[1];
        
        console.log("Setup Real Auth:", { userId, projectRef, supabaseUrl });

        if (projectRef) {
          const cookieName = `sb-${projectRef}-auth-token`;
          const cookieValue = JSON.stringify(session);
          
          const cookie = {
            name: cookieName,
            value: cookieValue,
            url: "http://localhost:3000",
            sameSite: "Lax" as const,
          };

          console.log("Injecting Auth Cookie:", { name: cookieName, url: cookie.url });
          
          await page.context().addCookies([cookie]);
        } else {
            console.warn("Could not extract projectRef from URL for auth cookie");
        }
      }
    } catch (e) {
              console.warn("Failed to setup real auth via API, falling back to UI bypass:", e);
              // Do not throw, let the test try the UI bypass
            }

            // Mock Supabase Rest API (Database) to provide profile for the authenticated user
    // We still mock 'players' table interactions to avoid creating real profiles if not needed,
    // or to control the profile state.
    let currentProfile = {
      id: userId,
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

      // Allow real DB calls for games (created by Server Action)
      if (url.includes("games")) {
         await route.continue();
         return;
      }

      // Allow real DB calls for players table to support Server Action verification and Profile Loading
      // We previously mocked this, but now that we create real profiles in route.ts, we should let it flow.
      // However, to speed up tests or avoid flakiness, we could mock it.
      // But since the Server Action checks the DB for the profile, and the Client checks the DB,
      // keeping them in sync via mocks is hard. Better to use the real DB with the real user we just created.
      if (url.includes("players")) {
         await route.continue();
         return;
      }
      
      // For other requests, continue to real DB or mock if needed
      await route.continue();
    });

    // Provide the fixture to the test
    await use({
      userId,
      goto: async () => {
        await page.goto("/");
      },
      verifyElements: async () => verifyHomePageElements(page),
      verifyStatus: async () => verifySystemStatus(),
    });

    // Teardown: Cleanup User
    if (cleanupUserId) {
      try {
        await page.request.delete("/api/e2e/auth", {
          data: { userId: cleanupUserId },
        });
        console.log(`Cleaned up E2E user: ${cleanupUserId}`);
      } catch (e) {
        console.error(`Failed to clean up E2E user ${cleanupUserId}:`, e);
      }
    }
  },
});
