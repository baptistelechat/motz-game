import { BloomFilter } from "bloom-filters";
import fs from "fs";
import path from "path";

const themeCache: Map<string, BloomFilter> = new Map();

export async function getServerThemeFilter(slug: string): Promise<BloomFilter | null> {
  if (themeCache.has(slug)) {
    return themeCache.get(slug)!;
  }

  try {
    const themePath = path.join(
      process.cwd(),
      "public",
      "assets",
      "themes",
      `${slug}.json`
    );

    if (!fs.existsSync(themePath)) {
      // If the file doesn't exist, it might mean the theme hasn't been generated yet
      // or it's "General" which has no filter.
      return null;
    }

    const content = await fs.promises.readFile(themePath, "utf-8");
    const json = JSON.parse(content);
    const filter = BloomFilter.fromJSON(json);
    
    themeCache.set(slug, filter);
    return filter;
  } catch (error) {
    console.error(`[ServerTheme] Failed to load theme filter for ${slug}:`, error);
    return null;
  }
}

export async function getServerThemes(): Promise<string[]> {
  try {
    const themesPath = path.join(process.cwd(), "src", "assets", "themes.json");
    const content = await fs.promises.readFile(themesPath, "utf-8");
    const themes = JSON.parse(content);
    return themes.map((t: { label: string }) => t.label);
  } catch (error) {
    console.error("[ServerTheme] Failed to load themes list:", error);
    return ["Général"];
  }
}
