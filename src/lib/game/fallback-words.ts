"use server";

import { getServerDictionary } from "@/lib/game/server-dictionary";
import { validateWord } from "@/lib/game/validation";
import { RoundConstraints } from "@/types/game";

/**
 * Generates fallback solutions by searching the server dictionary
 * for words that satisfy the given constraints.
 */
export async function findFallbackSolutions(
  constraints: RoundConstraints,
  count: number = 3,
): Promise<string[]> {
  try {
    const words = await getServerDictionary();

    // Filter words that satisfy all constraints
    // We pass () => true for the dictionary check because we are iterating
    // over the dictionary itself, so we know the word exists.
    const validWords = words.filter((word) => {
      return validateWord(word, constraints, () => true).isValid;
    });

    if (validWords.length === 0) {
      return ["AUCUNE_SOLUTION"];
    }

    // Shuffle and pick
    const shuffled = validWords.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  } catch (error) {
    console.error("Error finding fallback solutions:", error);
    return ["ERREUR_DICTIONNAIRE"];
  }
}
