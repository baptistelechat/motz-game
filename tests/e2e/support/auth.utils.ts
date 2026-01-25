import { Page } from "@playwright/test";

export async function setupE2EAuth(
  page: Page,
  options: { force?: boolean } = {},
) {
  let userId = "fake-user-id";
  let cleanupUserId: string | null = null;

  // Set E2E mode flag in localStorage
  await page.addInitScript(() => {
    window.localStorage.setItem("motz-e2e-mode", "true");
  });

  // Debug: Log all requests to see what's happening
  // Registered first so it has lower priority than specific routes (Playwright checks in reverse order)
  await page.route("**", async (route) => {
    // Use fallback to allow other handlers to process the request if they match
    await route.continue();
  });

  try {
    const url = options.force ? "/api/e2e/auth?force=true" : "/api/e2e/auth";
    const response = await page.request.post(url);
    const session = await response.json();

    if (session?.user?.id) {
      userId = session.user.id;
      cleanupUserId = userId;

      // Forcefully set cookies in context from the API response
      // This ensures that even if page.request didn't sync automatically, we have them.
      const headers = await response.headersArray();

      const setCookieHeaders = headers.filter(
        (h) => h.name.toLowerCase() === "set-cookie",
      );

      if (setCookieHeaders.length > 0) {
        // Cookies are automatically handled by the browser context when using page.request
        // We do not manually add them anymore as it causes issues and they are already in the context
      }

      // Cookies should be automatically set in the context by the API response
      // because page.request shares storage state with page.context()
      await page.context().cookies();

      // We still keep the mock route just in case the client-side code triggers a signup
      // (e.g. if cookies are missing or ignored for some reason)
      await page.route(/\/auth\/v1\/signup/, async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(session),
        });
      });
    }
  } catch (e) {
    console.warn(
      "Failed to setup real auth via API, falling back to UI bypass:",
      e,
    );
  }

  // Route interception for data
  await page.route("**/rest/v1/**", async (route) => {
    const url = route.request().url();
    if (url.includes("games") || url.includes("players")) {
      await route.continue();
      return;
    }
    await route.continue();
  });

  return { userId, cleanupUserId };
}

export async function teardownE2EAuth(page: Page, userId: string) {
  try {
    await page.request.delete("/api/e2e/auth", {
      data: { userId },
    });
    console.log(`Cleaned up E2E user: ${userId}`);
  } catch (e) {
    console.error(`Failed to clean up E2E user ${userId}:`, e);
  }
}
