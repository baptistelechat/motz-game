let cachedDictionary: string[] | null = null;

/**
 * Loads the full dictionary list.
 *
 * NOTE: This is distinct from `useDictionary` hook!
 * - `useDictionary` uses a Bloom Filter for efficient, memory-safe existence checks (O(k)) during gameplay.
 * - `getDictionary` loads the raw word list (~3MB).
 *
 * Use this function ONLY for:
 * 1. "Solver" logic (checking if a round is possible by iterating all words)
 * 2. Cheating/Hint features (finding specific valid words)
 * 3. Server-side validation (if we ever move logic there)
 *
 * DO NOT use this for simple word validation in the UI, use `useDictionary` instead.
 */
export async function getDictionary(): Promise<string[]> {
  if (cachedDictionary) {
    return cachedDictionary;
  }

  try {
    const response = await fetch("/assets/dictionary.txt");
    if (!response.ok) {
      throw new Error("Failed to load dictionary");
    }
    const text = await response.text();
    const words = text
      .split("\n")
      .map((w) => w.trim())
      .filter((w) => w.length > 0);

    cachedDictionary = words;
    return words;
  } catch (error) {
    console.error("Error loading dictionary:", error);
    return [];
  }
}
