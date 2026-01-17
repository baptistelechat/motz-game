import { expect, test } from "@playwright/test";

test.describe("Project Infrastructure", () => {
  test("[P0] should load homepage with correct design system", async ({
    page,
  }) => {
    // GIVEN: User navigates to home page
    await page.goto("/");

    // THEN: Page title is correct
    await expect(page).toHaveTitle(/Motz Game/);

    // AND: Main heading uses display font
    const heading = page.locator("h1", { hasText: "Motz Game" });
    await expect(heading).toBeVisible();
    await expect(heading).toHaveClass(/font-display/);

    // AND: System status card is visible
    const statusHeading = page.getByRole("heading", { name: "System Status" });
    await expect(statusHeading).toBeVisible();

    const statusCard = page
      .locator("div.border-pixel")
      .filter({ has: statusHeading });
    await expect(statusCard).toBeVisible();
    // Check for custom border class defined in globals.css/tailwind config
    await expect(statusCard).toHaveClass(/border-pixel/);
    await expect(statusCard).toHaveClass(/shadow-hard/);
  });
});
