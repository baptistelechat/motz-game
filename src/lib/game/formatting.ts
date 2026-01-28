import { ConstraintCard } from "@/types/game";

/**
 * Generates a human-readable label for a given constraint card.
 * Used in the UI to display round requirements.
 */
export function getConstraintLabel(
  card: ConstraintCard,
  theme?: string,
  imposedLetter?: string,
): string {
  switch (card.type) {
    case "free":
      return "LIBRE";
    case "min_len":
      return `MINI. ${card.value} LETTRES`;
    case "max_len":
      return `MAXI. ${card.value} LETTRES`;
    case "exact_len":
      return `${card.value} LETTRES`;
    case "starts_with_imposed":
      return `DEBUTE PAR ${imposedLetter?.toUpperCase() || "IMPOSEE"}`;
    case "ends_with_imposed":
      return `FINIT PAR ${imposedLetter?.toUpperCase() || "IMPOSEE"}`;
    case "unique_chars":
      return "LETTRES UNIQUES";
    case "min_vowels":
      return `MINI. ${card.value} VOYELLES`;
    case "invert_letters":
      return "INVERSION";
    case "theme":
      return `THEME : ${theme || "AUCUN"}`;
    default:
      return "INCONNU";
  }
}
