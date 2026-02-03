import fs from "fs";
import { glob } from "glob";
import path from "path";

const DICT_DIR = path.join(process.cwd(), "src", "assets", "dictionary");
const SOURCE_DIR = path.join(DICT_DIR, "temp");
const OUTPUT_PATH = path.join(DICT_DIR, "dictionary.txt");

function normalizeString(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();
}

async function mergeDictionaries() {
  console.log("🔍 Scanning for dictionary sources...");

  // Only look for .txt files since download-dictionaries.ts normalizes everything
  const patterns = ["source-*.txt"];
  const sourceFiles = await glob(patterns, { cwd: SOURCE_DIR });

  if (sourceFiles.length === 0) {
    console.error("❌ No source files found in", SOURCE_DIR);
    process.exit(1);
  }

  console.log(
    `📂 Found ${sourceFiles.length} source files in ${SOURCE_DIR}:`,
    sourceFiles,
  );

  const uniqueWords = new Set<string>();
  const stats: Record<
    string,
    {
      count: number;
      added: number;
      rejectedShort: number;
      rejectedNoVowels: number;
    }
  > = {};

  for (const file of sourceFiles) {
    console.log(`📖 Processing ${file}...`);
    const filePath = path.join(SOURCE_DIR, file);
    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n");

    let count = 0;
    let added = 0;
    let rejectedShort = 0;
    let rejectedNoVowels = 0;

    for (const rawWord of lines) {
      if (!rawWord || !rawWord.trim()) continue;

      const normalized = normalizeString(rawWord);

      // Must contain only letters A-Z
      if (!/^[A-Z]+$/.test(normalized)) {
        continue;
      }

      // Filter: length > 2
      if (normalized.length <= 2) {
        rejectedShort++;
        continue;
      }

      // Filter: MUST contain at least one vowel
      if (!/[AEIOUY]/.test(normalized)) {
        rejectedNoVowels++;
        continue;
      }

      // If we got here, the word is valid
      count++;
      if (!uniqueWords.has(normalized)) {
        uniqueWords.add(normalized);
        added++;
      }
    }

    stats[file] = { count, added, rejectedShort, rejectedNoVowels };
    console.log(`   - Raw words: ${lines.length}`);
    console.log(`   - Valid words: ${count}`);
    console.log(`   - New unique words: ${added}`);
    console.log(`   - Rejected (<= 2 chars): ${rejectedShort}`);
    console.log(`   - Rejected (no vowels): ${rejectedNoVowels}`);
  }

  console.log("💾 Writing merged dictionary...");
  const sortedWords = Array.from(uniqueWords).sort();
  fs.writeFileSync(OUTPUT_PATH, sortedWords.join("\n"));

  console.log(`✅ Dictionary merged successfully!`);
  console.log(`📊 Total unique words: ${uniqueWords.size}`);
  console.log(`📝 Output: ${OUTPUT_PATH}`);

  // Print summary table
  console.table(stats);
}

mergeDictionaries();
