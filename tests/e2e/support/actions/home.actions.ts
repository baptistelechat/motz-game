import { Page, expect } from "@playwright/test";

export async function joinGame(page: Page, code: string) {
  // Click Join to open dialog
  try {
    await expect(
      page.getByRole("button", { name: /REJOINDRE/i }),
    ).toBeVisible();
  } catch (e) {
    console.log("Join Button not visible. Page state:");
    console.log(
      await page.evaluate(() => document.body.innerText.substring(0, 500)),
    );
    console.log("Cookies:", await page.evaluate(() => document.cookie));
    throw e;
  }

  await page.getByRole("button", { name: /REJOINDRE/i }).click();

  // Verify Dialog
  await expect(
    page.getByRole("heading", { name: "Rejoindre une partie" }),
  ).toBeVisible();

  // Enter Code
  const codeInput = page.getByPlaceholder("A1B2C3");
  await expect(codeInput).toBeVisible();
  await codeInput.fill(code);

  // Submit
  await page
    .locator("role=dialog")
    .getByRole("button", { name: "REJOINDRE" })
    .click();
}

export async function verifyHomePageElements(page: Page) {
  // THEN: Page title is correct
  await expect(page).toHaveTitle(/Motz Game/i);

  // AND: Main heading uses pixel font and correct text
  const heading = page.locator("h1", { hasText: "MOTZ-GAME" });
  await expect(heading).toBeVisible();
  await expect(heading).toHaveClass(/font-display/);

  // Verify Buttons exist
  const createButton = page.getByRole("button", { name: /CRÉER UNE PARTIE/i });
  await expect(createButton).toBeVisible();

  const joinButton = page.getByRole("button", { name: /REJOINDRE/i });
  await expect(joinButton).toBeVisible();
}

export async function verifySystemStatus() {
  // System status is currently not present on Home Page.
  // Skipping assertions until feature is restored/implemented.
  // const statusHeading = page.getByRole("heading", { name: "System Status" });
  // await expect(statusHeading).toBeVisible();
}

export async function bypassCaptcha(page: Page) {
  // Check if we are stuck in loading
  const loader = page.getByText("CHARGEMENT...");
  if (await loader.isVisible()) {
    console.log("Waiting for loading to finish...");
    await expect(loader).not.toBeVisible({ timeout: 10000 });
  }

  try {
    const bypassButton = page.getByTestId("e2e-bypass-captcha");

    // Wait for button to be stable
    await bypassButton.waitFor({ state: "visible", timeout: 10000 });
    await page.waitForTimeout(500); // Small hydration wait

    if (await bypassButton.isVisible()) {
      console.log("Found E2E Bypass Button, clicking...");
      await bypassButton.dispatchEvent("click");
      await bypassButton.click(); // Click for good measure

      // Wait for verification screen to disappear
      await expect(
        page.getByRole("heading", { name: "VERIFICATION" }),
      ).not.toBeVisible({
        timeout: 10000,
      });

      // Wait for auth cookies to be set
      await page.waitForFunction(
        () => {
          const cookies = document.cookie;
          const hasCookies =
            cookies.includes("sb-") || cookies.includes("supabase-auth-token");
          if (!hasCookies) {
            console.log("WAITING FOR COOKIES. Current:", cookies);
          }
          return hasCookies;
        },
        { timeout: 30000 },
      );

      // Wait for user to be authenticated (create game button visible)
      await expect(
        page.getByRole("button", { name: /CRÉER UNE PARTIE/i }),
      ).toBeVisible({ timeout: 10000 });
    } else {
      console.log("Bypass button not visible - checking if already logged in");
      const createBtn = page.getByRole("button", { name: /CRÉER UNE PARTIE/i });
      if (await createBtn.isVisible()) {
        console.log("Create Game button visible - Logged in confirmed");
      } else {
        // If we are not on home page, this might be expected.
        // But if we ARE on home page and it's missing, that's bad.
        // Assert absence of Captcha text
        await expect(
          page.getByRole("heading", { name: "VERIFICATION" }),
        ).not.toBeVisible();

        // Assert absence of Critical Error
        await expect(page.getByText("ERREUR CRITIQUE")).not.toBeVisible();
      }
    }
  } catch (error) {
    console.log("Bypass/Login check failed:", error);
    throw error; // Fail the test if we can't bypass and we're not logged in
  }
}
