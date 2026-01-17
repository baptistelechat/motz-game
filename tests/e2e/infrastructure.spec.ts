import { test } from "./support/fixtures";

test.describe("Project Infrastructure", () => {
  test("[P0] should load homepage with correct design system", async ({
    homePage,
  }) => {
    // GIVEN: User navigates to home page
    await homePage.goto();

    // THEN: Page title is correct and elements are visible
    await homePage.verifyElements();

    // AND: System status card is visible
    await homePage.verifyStatus();
  });
});
