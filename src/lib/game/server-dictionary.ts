import fs from "fs";
import path from "path";

let cachedDictionary: string[] | null = null;

export async function getServerDictionary(): Promise<string[]> {
  if (cachedDictionary) {
    return cachedDictionary;
  }

  try {
    const dictionaryPath = path.join(
      process.cwd(),
      "src",
      "assets",
      "dictionary",
      "dictionary.txt",
    );
    const text = await fs.promises.readFile(dictionaryPath, "utf-8");

    const words = text
      .split("\n")
      .map((w) => w.trim())
      .filter((w) => w.length > 0);

    cachedDictionary = words;
    return words;
  } catch (error) {
    console.error("[ServerDictionary] Failed to load dictionary:", error);
    return [];
  }
}
