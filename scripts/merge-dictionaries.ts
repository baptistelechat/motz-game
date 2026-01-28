import fs from "fs";
import { glob } from "glob";
import path from "path";

const DICT_DIR = path.join(process.cwd(), "src", "assets", "dictionary");
const OUTPUT_PATH = path.join(DICT_DIR, "dictionary.txt");

function normalizeString(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();
}

type Parser = (content: string, filePath: string) => string[];

const parsers: Record<string, Parser> = {
  ".txt": (content) => content.split("\n"),

  ".json": (content, filePath) => {
    try {
      const data = JSON.parse(content);
      if (Array.isArray(data)) {
        // Assume array of strings
        return data.filter((item) => typeof item === "string");
      }
      console.warn(
        `⚠️ [${path.basename(filePath)}] JSON is not an array. Skipping.`,
      );
      return [];
    } catch (e) {
      console.error(`❌ [${path.basename(filePath)}] Invalid JSON:`, e);
      return [];
    }
  },

  ".csv": (content, filePath) => {
    const lines = content.split("\n");
    if (lines.length < 2) return [];

    const fileName = path.basename(filePath);

    // Special handling for hbenbel-dictionary.csv which has no header
    if (fileName.includes("hbenbel-dictionary.csv")) {
      return lines
        .map((line) => line.trim())
        .filter(
          (line) =>
            line &&
            !line.startsWith("&") &&
            !line.startsWith("/") &&
            !line.startsWith("-"),
        );
    }

    const header = lines[0].toLowerCase();
    const columns = header.split(",").map((c) => c.trim().replace(/"/g, ""));

    // Detect column index for word
    // Common headers: "word", "ortho", "forme", "mot"
    let wordIndex = columns.findIndex((c) =>
      ["word", "ortho", "forme", "mot", "form"].includes(c),
    );

    if (wordIndex === -1) {
      console.warn(
        `⚠️ [${path.basename(filePath)}] No 'word'/'ortho' column found in CSV. Using first column.`,
      );
      wordIndex = 0;
    }

    const words: string[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Basic CSV split (handling quotes would be better but this might suffice for simple lists)
      // If we encounter complex CSVs, we might need a proper parser library.
      // For now, let's assume standard comma separation without commas in values.
      const cols = line.split(",");
      if (cols.length > wordIndex) {
        let w = cols[wordIndex];
        // Strip quotes if present
        if (w.startsWith('"') && w.endsWith('"')) {
          w = w.slice(1, -1);
        }
        if (w) words.push(w);
      }
    }
    return words;
  },
};

async function mergeDictionaries() {
  console.log("🔍 Scanning for dictionary sources...");

  // Match all supported extensions
  const patterns = ["source-*.txt", "source-*.json", "source-*.csv"];
  const sourceFiles = await glob(patterns, { cwd: DICT_DIR });

  if (sourceFiles.length === 0) {
    console.error("❌ No source files found in", DICT_DIR);
    process.exit(1);
  }

  console.log(`📂 Found ${sourceFiles.length} source files:`, sourceFiles);

  const uniqueWords = new Set<string>();
  const stats: Record<string, { count: number; added: number }> = {};

  for (const file of sourceFiles) {
    console.log(`📖 Processing ${file}...`);
    const filePath = path.join(DICT_DIR, file);
    const content = fs.readFileSync(filePath, "utf-8");
    const ext = path.extname(file).toLowerCase();

    const parser = parsers[ext];
    if (!parser) {
      console.warn(`⚠️ No parser for extension ${ext}. Skipping ${file}.`);
      continue;
    }

    const words = parser(content, filePath);

    let count = 0;
    let added = 0;

    for (const rawWord of words) {
      if (!rawWord) continue;

      const normalized = normalizeString(rawWord);

      // Filter: length > 1 and only letters A-Z
      if (normalized.length > 1 && /^[A-Z]+$/.test(normalized)) {
        count++;
        if (!uniqueWords.has(normalized)) {
          uniqueWords.add(normalized);
          added++;
        }
      }
    }

    stats[file] = { count, added };
    console.log(`   - Raw words: ${words.length}`);
    console.log(`   - Valid words: ${count}`);
    console.log(`   - New unique words: ${added}`);
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
