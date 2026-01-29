import { normalizeString } from "@/lib/utils/string";
import { RoundConstraints, ValidationResult } from "@/types/game";

const VOWELS = new Set(["A", "E", "I", "O", "U", "Y"]);

function countVowels(word: string): number {
  let count = 0;
  for (const char of word) {
    if (VOWELS.has(char)) count++;
  }
  return count;
}

export function validateWord(
  word: string,
  constraints: RoundConstraints,
  dictionaryCheck: (w: string) => boolean,
): ValidationResult {
  const normalizedWord = normalizeString(word);

  // 0. Basic Sanity
  if (!normalizedWord) {
    return { isValid: false, error: "Vide" };
  }

  // 1. Dictionary Check
  // Note: We strip accents for dictionary check usually, but let's assume dictionaryCheck handles normalization or expects normalized input.
  // The hook we wrote normalizes.
  if (!dictionaryCheck(normalizedWord)) {
    return { isValid: false, error: "Mot inconnu" };
  }

  // Determine effective constraints (Inversion)
  const isInverted = constraints.constraint_card.type === "invert_letters";
  const effectiveImposed = isInverted
    ? constraints.forbidden_letter
    : constraints.imposed_letter;
  const effectiveForbidden = isInverted
    ? constraints.imposed_letter
    : constraints.forbidden_letter;

  // Normalize letters just in case
  const imposed = effectiveImposed.toUpperCase();
  const forbidden = effectiveForbidden.toUpperCase();

  // 2. Imposed Letter Check
  if (!normalizedWord.includes(imposed)) {
    return { isValid: false, error: `Doit contenir ${imposed}` };
  }

  // 3. Forbidden Letter Check
  if (normalizedWord.includes(forbidden)) {
    return { isValid: false, error: `Ne doit pas contenir ${forbidden}` };
  }

  // 4. Constraint Card Check
  const { type, value } = constraints.constraint_card;

  switch (type) {
    case "min_len":
      if (value && normalizedWord.length < value) {
        return { isValid: false, error: `Minimum ${value} lettres` };
      }
      break;
    case "max_len":
      if (value && normalizedWord.length > value) {
        return { isValid: false, error: `Maximum ${value} lettres` };
      }
      break;
    case "exact_len":
      if (value && normalizedWord.length !== value) {
        return { isValid: false, error: `Exactement ${value} lettres` };
      }
      break;
    case "starts_with_imposed":
      if (!normalizedWord.startsWith(imposed)) {
        return { isValid: false, error: `Doit commencer par ${imposed}` };
      }
      break;
    case "ends_with_imposed":
      if (!normalizedWord.endsWith(imposed)) {
        return { isValid: false, error: `Doit finir par ${imposed}` };
      }
      break;
    case "unique_chars":
      if (new Set(normalizedWord).size !== normalizedWord.length) {
        return { isValid: false, error: "Lettres doivent être uniques" };
      }
      break;
    case "min_vowels":
      if (value && countVowels(normalizedWord) < value) {
        return { isValid: false, error: `Minimum ${value} voyelles` };
      }
      break;
    case "free":
    case "invert_letters":
      // No extra check
      break;
    case "theme":
      // Validation sociale : le thème n'est plus validé algorithmiquement.
      break;
  }

  return { isValid: true };
}
