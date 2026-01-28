import { getDebugDictionary } from "@/app/actions/debug-actions";

let cachedDictionary: string[] | null = null;

/**
 * Loads the full dictionary list via Server Action.
 *
 * NOTE: This is distinct from `useDictionary` hook!
 * - `useDictionary` uses a Bloom Filter for efficient, memory-safe existence checks (O(k)) during gameplay.
 * - `getDictionary` loads the raw word list (~3MB) via Server Action (DEV ONLY).
 *
 * Use this function ONLY for:
 * 1. "Solver" logic (checking if a round is possible by iterating all words)
 * 2. Cheating/Hint features (finding specific valid words)
 *
 * DO NOT use this for simple word validation in the UI, use `useDictionary` instead.
 */
export async function getDictionary(): Promise<string[]> {
  if (cachedDictionary) {
    return cachedDictionary;
  }

  try {
    const words = await getDebugDictionary();
    if (!words || words.length === 0) {
      console.warn(
        "Dictionary not available (Production mode or missing file)",
      );
      return [];
    }

    cachedDictionary = words;
    return words;
  } catch (error) {
    console.error("Error loading dictionary:", error);
    return [];
  }
}
