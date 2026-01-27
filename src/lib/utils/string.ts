
/**
 * Normalizes a string by removing accents and converting to uppercase.
 * Useful for consistent comparisons in game logic.
 * 
 * Example: "Été" -> "ETE"
 */
export function normalizeString(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim();
}
