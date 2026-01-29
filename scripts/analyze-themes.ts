import { BloomFilter } from "bloom-filters";
import fs from "fs";
import path from "path";

const DICTIONARY_PATH = path.join(
  process.cwd(),
  "src",
  "assets",
  "dictionary",
  "dictionary.txt",
);

const THEMES_SOURCE_PATH = path.join(
  process.cwd(),
  "src",
  "assets",
  "themes.json",
);

const THEMES_OUTPUT_DIR = path.join(
  process.cwd(),
  "public",
  "assets",
  "themes",
);

const THEMES_LIST_DIR = path.join(
  process.cwd(),
  "src",
  "assets",
  "themes",
  "lists",
);

const OLLAMA_API = "http://localhost:11434/api/embeddings";
const MODEL = "nomic-embed-text";
const SIMILARITY_THRESHOLD = 0.55;
const ERROR_RATE = 0.01; // 1% error rate is enough for themes (smaller set)

// ----------------------------------------------------------------------------
// Types & Helpers
// ----------------------------------------------------------------------------

interface ThemeSource {
  id: string;
  label: string;
  locale: string;
}

interface Theme extends ThemeSource {
  slug: string;
  embedding?: number[];
}

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function normalizeString(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();
}

function dotProduct(a: number[], b: number[]): number {
  return a.reduce((sum, val, i) => sum + val * b[i], 0);
}

function magnitude(v: number[]): number {
  return Math.sqrt(v.reduce((sum, val) => sum + val * val, 0));
}

function cosineSimilarity(a: number[], b: number[]): number {
  return dotProduct(a, b) / (magnitude(a) * magnitude(b));
}

async function getEmbedding(text: string): Promise<number[] | null> {
  try {
    const response = await fetch(OLLAMA_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        prompt: text,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.embedding;
  } catch (error) {
    console.error(`Failed to embed "${text}":`, error);
    return null;
  }
}

// ----------------------------------------------------------------------------
// Main Logic
// ----------------------------------------------------------------------------

async function main() {
  console.log("🚀 Starting Offline Semantic Analysis...");

  // 0. Ensure output dirs exists
  if (!fs.existsSync(THEMES_OUTPUT_DIR)) {
    fs.mkdirSync(THEMES_OUTPUT_DIR, { recursive: true });
  }
  if (!fs.existsSync(THEMES_LIST_DIR)) {
    fs.mkdirSync(THEMES_LIST_DIR, { recursive: true });
  }

  // 1. Check Ollama
  try {
    await fetch("http://localhost:11434");
    console.log("✅ Ollama is running");
  } catch (e) {
    console.error("❌ Ollama is NOT running at http://localhost:11434");
    console.error(e);
    console.error("Please start Ollama with:");
    console.error(`> ollama serve`);
    console.error(`> ollama pull ${MODEL}`);
    process.exit(1);
  }

  // 2. Load Dictionary
  console.log("📖 Loading dictionary...");
  const dictContent = fs.readFileSync(DICTIONARY_PATH, "utf-8");
  const allWords = dictContent
    .split("\n")
    .map((w) => w.trim())
    .filter((w) => w.length > 0);

  console.log(`ℹ️ Dictionary size: ${allWords.length} words`);

  // 3. Load Themes (Local JSON)
  console.log("🌍 Loading themes from src/assets/themes.json...");
  if (!fs.existsSync(THEMES_SOURCE_PATH)) {
    console.error("❌ Themes file not found at:", THEMES_SOURCE_PATH);
    process.exit(1);
  }

  const themesData: ThemeSource[] = JSON.parse(
    fs.readFileSync(THEMES_SOURCE_PATH, "utf-8"),
  );

  console.log(`ℹ️ Found ${themesData.length} themes.`);

  // 4. Compute Theme Embeddings AND Check for existing lists
  console.log("🧠 Computing theme embeddings and checking lists...");
  const themes: Theme[] = [];

  // Identify which themes need analysis
  const themesToAnalyze: Theme[] = [];
  const themeWords: Record<string, Set<string>> = {};

  for (const t of themesData) {
    if (t.locale !== "fr") continue;

    const slug = slugify(t.label);
    const listPath = path.join(THEMES_LIST_DIR, `${slug}.txt`);
    const themeObj = { ...t, slug };

    if (fs.existsSync(listPath)) {
      console.log(`   - ${t.label} 📂 Found existing list (skipping analysis)`);
      const content = fs.readFileSync(listPath, "utf-8");
      const words = new Set(
        content
          .split("\n")
          .map((w) => w.trim())
          .filter((w) => w.length > 0),
      );
      themeWords[t.id] = words;
      themes.push(themeObj);
    } else {
      console.log(`   - ${t.label} 🔍 Needs analysis`);
      const embedding = await getEmbedding(t.label);
      if (embedding) {
        themes.push({ ...themeObj, embedding });
        themesToAnalyze.push({ ...themeObj, embedding });
        themeWords[t.id] = new Set();
      } else {
        console.warn(`   - ${t.label} ❌ (Failed to embed)`);
      }
    }
  }

  // 5. Process Words (Only if needed)
  if (themesToAnalyze.length > 0) {
    console.log(`🔄 Processing words for ${themesToAnalyze.length} themes...`);

    let processed = 0;
    const total = allWords.length;

    for (const word of allWords) {
      processed++;
      if (processed % 1000 === 0) {
        process.stdout.write(
          `\rProgress: ${((processed / total) * 100).toFixed(1)}%`,
        );
      }

      // Skip very short words for semantic analysis
      if (word.length < 3) continue;

      const wordEmbedding = await getEmbedding(word);
      if (!wordEmbedding) continue;

      for (const theme of themesToAnalyze) {
        if (!theme.embedding) continue;

        const similarity = cosineSimilarity(wordEmbedding, theme.embedding);
        if (similarity >= SIMILARITY_THRESHOLD) {
          themeWords[theme.id].add(normalizeString(word));
        }
      }
    }
    console.log("\n✅ Processing complete.");

    // Save generated lists
    console.log("💾 Saving intermediate lists...");
    for (const theme of themesToAnalyze) {
      const words = Array.from(themeWords[theme.id]).sort();
      const listPath = path.join(THEMES_LIST_DIR, `${theme.slug}.txt`);
      fs.writeFileSync(listPath, words.join("\n"));
      console.log(`   - Saved ${theme.label} list to ${listPath}`);
    }
  } else {
    console.log(
      "✅ All theme lists already exist. Skipping semantic analysis.",
    );
  }

  // 6. Generate Bloom Filters

  // 6. Generate Bloom Filters
  console.log("💾 Generating Bloom Filters...");

  for (const theme of themes) {
    const words = themeWords[theme.id];
    if (!words || words.size === 0) {
      console.log(`⚠️ Theme "${theme.label}" has 0 words.`);
      continue;
    }

    console.log(`   - ${theme.label}: ${words.size} words`);

    // Create Bloom Filter
    const filter = BloomFilter.create(words.size, ERROR_RATE);
    for (const w of words) {
      filter.add(w);
    }

    const json = filter.saveAsJSON();
    const outputPath = path.join(THEMES_OUTPUT_DIR, `${theme.slug}.json`);

    fs.writeFileSync(outputPath, JSON.stringify(json));
  }

  console.log(`🎉 All themes generated in ${THEMES_OUTPUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
