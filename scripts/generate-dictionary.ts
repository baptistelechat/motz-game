import { BloomFilter } from "bloom-filters";
import fs from "fs";
import path from "path";

// Utility to normalize string (duplicated here to avoid import issues in script context if tsconfig paths are not set up for scripts)
function normalizeString(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();
}

const DICT_PATH = path.join(
  process.cwd(),
  "src",
  "assets",
  "dictionary",
  "dictionary.txt",
);
const OUTPUT_PATH = path.join(
  process.cwd(),
  "public",
  "assets",
  "dictionary",
  "dictionary.json",
);

async function generateDictionary() {
  console.log("📖 Reading dictionary from:", DICT_PATH);

  if (!fs.existsSync(DICT_PATH)) {
    console.error("❌ Dictionary file not found!");
    process.exit(1);
  }

  const content = fs.readFileSync(DICT_PATH, "utf-8");
  const words = content
    .split("\n")
    .map((w) => normalizeString(w))
    .filter((w) => w.length > 0);

  const uniqueWords = new Set(words);
  console.log(`✅ Found ${uniqueWords.size} unique words.`);

  // Create Bloom Filter
  // n = number of items, p = error probability
  // 0.1% error rate (1 in 1000) for better quality
  const ERROR_RATE = 0.001;
  const filter = BloomFilter.create(uniqueWords.size, ERROR_RATE);

  console.log("⚙️ Adding words to Bloom Filter...");
  for (const word of uniqueWords) {
    filter.add(word);
  }

  const json = filter.saveAsJSON();
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(json));

  // Generate Metadata for Versioning
  const meta = {
    version: Date.now(),
    errorRate: ERROR_RATE,
    size: uniqueWords.size,
  };
  const META_PATH = path.join(
    process.cwd(),
    "public",
    "assets",
    "dictionary",
    "dictionary-meta.json",
  );
  fs.writeFileSync(META_PATH, JSON.stringify(meta, null, 2));

  const originalSize = fs.statSync(DICT_PATH).size / 1024 / 1024;
  const newSize = fs.statSync(OUTPUT_PATH).size / 1024 / 1024;

  console.log(`🎉 Dictionary generated at: ${OUTPUT_PATH}`);
  console.log(`📝 Metadata generated at: ${META_PATH}`);
  console.log(`📊 Stats:`);
  console.log(`   - Original Size (TXT): ${originalSize.toFixed(2)} MB`);
  console.log(`   - New Size (JSON): ${newSize.toFixed(2)} MB`);
  console.log(
    `   - Reduction: ${((1 - newSize / originalSize) * 100).toFixed(1)}%`,
  );
}

generateDictionary();
