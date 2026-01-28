import { expect } from "@playwright/test";
import { BloomFilter } from "bloom-filters";
import { setupE2EAuth, teardownE2EAuth } from "./support/auth.utils";
import { test } from "./support/fixtures/home-fixture";

test.describe("Game Input & Validation", () => {
  let userId: string;

  test.beforeEach(async ({ page }) => {
    const auth = await setupE2EAuth(page, { force: true });
    userId = auth.userId;
  });

  test.afterEach(async ({ page }) => {
    if (userId) {
      await teardownE2EAuth(page, userId);
    }
  });

  test("should validate words locally and show feedback", async ({
    page,
    homePage,
  }) => {
    // 1. Mock Dictionary with a comprehensive set of test words
    await page.route("**/assets/dictionary/dictionary.json", (route) => {
      // Create a larger filter to minimize false positives, though for this specific set it's fine
      const filter = BloomFilter.create(1000, 0.001);

      // Add repetitive patterns for lengths 1-10 for all letters: "A", "AA", ..., "ZZZZZZZZZZ"
      const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      for (const char of alphabet) {
        let word = "";
        for (let i = 0; i < 10; i++) {
          word += char;
          filter.add(word);
        }
      }

      // Add unique char words
      filter.add("ABCDE");
      filter.add("FGHIJ");
      filter.add("KLMNO");
      filter.add("PQRST");
      filter.add("UVWXY");

      // Add vowel heavy words
      filter.add("AEIOU");
      filter.add("EAU");
      filter.add("OUI");

      // Add specific test words
      filter.add("TEST");
      filter.add("VALID");
      filter.add("MOTZ");

      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(filter.saveAsJSON()),
      });
    });

    // 2. Start a game
    await homePage.goto();
    await page.getByRole("button", { name: "CRÉER UNE PARTIE" }).click();
    await expect(page).toHaveURL(/\/room\/[A-Z0-9]{6}/, { timeout: 20000 });

    const readyButton = page.getByRole("button", { name: "Prêt ?" });
    await readyButton.click();
    await page.waitForTimeout(1000); // Wait for server
    await page.reload(); // Ensure state sync

    const startButton = page.getByRole("button", { name: "Lancer" });
    await expect(startButton).toBeEnabled({ timeout: 10000 });
    await startButton.click();
    await expect(page).toHaveURL(/\/game\/[A-Z0-9]{6}/, { timeout: 20000 });

    // 3. Locate Input & Constraints
    await expect(page.getByText("MANCHE 1")).toBeVisible({ timeout: 10000 });
    const input = page.getByRole("textbox");
    await expect(input).toBeVisible();
    await expect(input).toBeFocused();

    // Get Imposed Letter
    const imposedLetterEl = page.locator(
      ".font-display.text-4xl.md\\:text-6xl.text-allow",
    );
    await expect(imposedLetterEl).toBeVisible();
    const imposedLetter = (await imposedLetterEl.innerText()).trim();

    // Get Forbidden Letter
    const forbiddenLetterEl = page.locator(
      ".font-display.text-4xl.md\\:text-6xl.text-disallow",
    );
    await expect(forbiddenLetterEl).toBeVisible();
    const forbiddenLetter = (await forbiddenLetterEl.innerText()).trim();

    // Get Constraint Card text
    const constraintCardEl = page.locator(".bg-muted\\/50 .text-3xl");
    await expect(constraintCardEl).toBeVisible();
    const constraintText = (await constraintCardEl.innerText()).trim();

    console.log(
      `[TEST] Constraints: Imposed=${imposedLetter}, Forbidden=${forbiddenLetter}, Card=${constraintText}`,
    );

    // Handle Inversion Logic
    let activeImposed = imposedLetter;
    let activeForbidden = forbiddenLetter;
    if (constraintText.includes("INVERSION")) {
      console.log("[TEST] Inversion active! Swapping constraints.");
      activeImposed = forbiddenLetter;
      activeForbidden = imposedLetter;
    }

    // 4. Test INVALID Word (Not in Dictionary)
    // We used a loop up to 10 chars in mock dict. So 11 chars is definitely not in dict.
    // Also, it's unlikely to be valid for any length constraint unless "Min 11" which is rare/impossible for this game.
    const invalidWord = "A".repeat(11);
    await input.fill(invalidWord);

    // Check for "Shake" logic - we expect Error state (Pink Border) on Submit
    await input.press("Enter");
    await expect(input).toHaveClass(/border-\[#FF00FF\]/); // Hot Pink

    // 5. Test VALID Word
    // We need to find a word from our mock dict that satisfies:
    // - Contains activeImposed
    // - No activeForbidden
    // - Matches Card

    // Strategy: Determine candidate based on constraints
    // Default to SKIP to avoid false positives on complex constraints
    let candidate = "SKIP";

    // 1. Handle Content Constraints (Vowels, Unique) first as they are most restrictive
    if (constraintText.includes("VOYELLES")) {
      // Needs vowels.
      // "MINI 4 VOYELLES" -> Needs word with >= 4 vowels.
      // Our mock has "AEIOU" (5 vowels). "EAU" (3), "OUI" (3).
      const vowels = ["AEIOU", "EAU", "OUI"];
      const found = vowels.find(
        (w) =>
          w.includes(activeImposed) &&
          !w.includes(activeForbidden) &&
          // Basic check: if it asks for 4 vowels, ensure we have enough.
          (!constraintText.includes("4") || w.length >= 4), // Crude heuristic
      );
      if (found) candidate = found;
    } else if (
      constraintText.includes("DIFFERENTES") ||
      constraintText.includes("UNIQUE")
    ) {
      // Needs unique chars. "ABCDE" etc.
      const candidates = ["ABCDE", "FGHIJ", "KLMNO", "PQRST", "UVWXY"];
      const found = candidates.find(
        (w) => w.includes(activeImposed) && !w.includes(activeForbidden),
      );
      if (found) candidate = found;
    } else {
      // 2. Handle Length/Simple Constraints (if no content constraint was matched)
      // Default to simple repetition
      candidate = activeImposed.repeat(5);

      if (constraintText.includes("MIN")) {
        // "LONGUEUR MIN 6" -> use 6 chars (we have up to 10 in mock)
        candidate = activeImposed.repeat(7);
      } else if (constraintText.includes("MAX")) {
        // "LONGUEUR MAX 4" -> use 3 chars
        candidate = activeImposed.repeat(3);
      } else if (
        constraintText.includes("EXACTE") ||
        (!constraintText.includes("MIN") &&
          !constraintText.includes("MAX") &&
          /\d+/.test(constraintText))
      ) {
        // "LONGUEUR 5" or "8 LETTRES" -> extract number
        const match = constraintText.match(/\d+/);
        const len = match ? parseInt(match[0]) : 5;
        // Ensure we don't exceed our mock data (repetition up to 10 is safe)
        candidate = activeImposed.repeat(Math.min(len, 10));
      }
    }

    if (candidate !== "SKIP" && !candidate.includes(activeForbidden)) {
      console.log(`[TEST] Trying valid candidate: ${candidate}`);
      await input.fill(candidate);

      // After filling a valid word, border should turn Yellow (Optimistic)
      // Note: The previous test failed on invalid border check.
      // If this valid check fails, check the class name in source.
      await expect(input).toHaveClass(/border-\[#FFFF00\]/);
    } else {
      console.log(
        "[TEST] Skipping Valid Word test due to complex constraints mismatch with mock dict",
      );
    }

    // 6. Verify Constraint Badge Visibility
    await expect(page.getByText("IMPOSEE")).toBeVisible();
    await expect(page.getByText("INTERDITE")).toBeVisible();
  });
});
