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
    const url = route.request().url();
    if (url.includes("auth")) {
      console.log("NETWORK REQ:", route.request().method(), url);
    }
    // Use fallback to allow other handlers to process the request if they match
    // But route.fallback() is only available in recent Playwright versions.
    // If we use continue(), it goes to network.
    // So we MUST register this FIRST, so later routes (added last) take precedence.
    // Wait, "Last added route is checked first".
    // So if I add this FIRST, it is checked LAST.
    // If I add "signup" LAST, it is checked FIRST.
    // If "signup" matches, it handles it.
    // If "signup" doesn't match, this one (checked last) matches and logs/continues.
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
      console.log(
        "🔒 E2E Auth: Response Headers:",
        headers.map((h) => h.name),
      );

      const setCookieHeaders = headers.filter(
        (h) => h.name.toLowerCase() === "set-cookie",
      );

      console.log(
        `🔒 E2E Auth: Found ${setCookieHeaders.length} Set-Cookie headers`,
      );

      if (setCookieHeaders.length > 0) {
        const cookiesToAdd = setCookieHeaders.map((h) => {
          const parts = h.value.split(";");
          const [name, value] = parts[0].split("=");
          console.log(
            `🔒 E2E Auth: Parsing cookie: ${name}=${value.substring(0, 10)}...`,
          );
          return {
            name: name.trim(),
            value: value.trim(),
            url: "http://localhost:3000",
            path: "/",
            sameSite: "Lax" as const,
            secure: false,
          };
        });
        await page.context().addCookies(cookiesToAdd);
        console.log(
          "Manually added cookies to context (restored):",
          cookiesToAdd.map((c) => c.name),
        );
      }

      // Cookies should be automatically set in the context by the API response
      // because page.request shares storage state with page.context()
      const cookies = await page.context().cookies();
      console.log(
        "Cookies in context after API call:",
        cookies.map((c) => `${c.name}=${c.value.substring(0, 10)}...`),
      );

      // We still keep the mock route just in case the client-side code triggers a signup
      // (e.g. if cookies are missing or ignored for some reason)
      console.log("Registering Signup Mock Route");
      await page.route(/\/auth\/v1\/signup/, async (route) => {
        console.log("Mocking Auth Signup for:", route.request().url());
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
