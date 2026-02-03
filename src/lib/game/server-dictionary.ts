import fs from "fs";
import path from "path";

let cachedDictionaryList: string[] | null = null;
let cachedDictionarySet: Set<string> | null = null;

async function loadDictionary() {
  if (cachedDictionaryList && cachedDictionarySet) return;

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
      .map((w) => w.trim().toUpperCase())
      .filter((w) => w.length > 0);

    cachedDictionaryList = words;
    cachedDictionarySet = new Set(words);
  } catch (error) {
    console.error("[ServerDictionary] Failed to load dictionary:", error);
    cachedDictionaryList = [];
    cachedDictionarySet = new Set();
  }
}

export async function getServerDictionary(): Promise<string[]> {
  await loadDictionary();
  return cachedDictionaryList || [];
}

export async function getServerDictionarySet(): Promise<Set<string>> {
  await loadDictionary();
  return cachedDictionarySet || new Set();
}

export async function checkWordServer(word: string): Promise<boolean> {
  await loadDictionary();
  return cachedDictionarySet?.has(word.toUpperCase()) || false;
}
