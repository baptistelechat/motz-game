
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

/**
 * Converts a string to a URL-friendly slug.
 * 
 * Example: "Sport & Loisirs" -> "sport-loisirs"
 */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
