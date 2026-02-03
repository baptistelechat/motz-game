import fs from "fs";
import http from "http";
import https from "https";
import path from "path";
import readline from "readline";
console.log("Script starting...");

const DICT_DIR = path.join(process.cwd(), "src", "assets", "dictionary");
const TEMP_DIR = path.join(DICT_DIR, "temp");

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

interface Source {
  name: string;
  url: string;
  filename: string;
  type: "txt" | "json" | "jsonl" | "csv" | "tsv";
  column?: number; // For CSV/TSV
  isZip?: boolean;
}

const SOURCES: Source[] = [
  // Major Dictionaries
  {
    name: "Lexique383",
    url: "http://www.lexique.org/databases/Lexique383/Lexique383.tsv",
    filename: "source-lexique383.txt", // Output filename
    type: "tsv",
    column: 0, // 'ortho' is usually first
  },
  {
    name: "Kaikki (Wiktionnaire)",
    url: "https://kaikki.org/dictionary/French/kaikki.org-dictionary-French.jsonl",
    filename: "source-kaikki.txt",
    type: "jsonl",
  },

  // GitHub Sources
  {
    name: "ODS8 (Scrabble)",
    url: "https://raw.githubusercontent.com/Thecoolsim/French-Scrabble-ODS8/main/French%20ODS%20dictionary.txt",
    filename: "source-ods8.txt",
    type: "txt",
  },
  {
    name: "Gutenberg",
    url: "https://raw.githubusercontent.com/chrplr/openlexicon/master/datasets-info/Liste-de-mots-francais-Gutenberg/liste.de.mots.francais.frgut.txt",
    filename: "source-gutenberg.txt",
    type: "txt",
  },
  {
    name: "Taknok",
    url: "https://raw.githubusercontent.com/Taknok/French-Wordlist/master/francais.txt",
    filename: "source-taknok.txt",
    type: "txt",
  },
  {
    name: "Words (JSON)",
    url: "https://raw.githubusercontent.com/words/an-array-of-french-words/master/index.json",
    filename: "source-words.txt",
    type: "json",
  },
  {
    name: "Hbenbel (Dictionary)",
    url: "https://raw.githubusercontent.com/hbenbel/French-Dictionary/master/dictionary/dictionary.csv",
    filename: "source-hbenbel.txt",
    type: "csv",
  },
];

async function downloadFile(urlString: string, dest: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const url = new URL(urlString);
    const client = url.protocol === "https:" ? https : http;
    const options = {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    };

    client
      .get(url, options, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          downloadFile(response.headers.location!, dest)
            .then(resolve)
            .catch(reject);
          return;
        }

        if (response.statusCode !== 200) {
          reject(
            new Error(
              `Failed to download ${urlString}: Status Code ${response.statusCode}`,
            ),
          );
          return;
        }

        response.pipe(file);
        file.on("finish", () => {
          file.close();
          resolve(dest);
        });
      })
      .on("error", (err) => {
        fs.unlink(dest, () => {});
        reject(err);
      });
  });
}

function normalizeWord(str: string): string {
  return str.trim(); // We keep normalization minimal here, let merge-dictionaries do the heavy lifting (accents, upper, etc)
  // Actually, merge-dictionaries expects clean words? No, it calls normalizeString.
  // So we just need to extract the "raw" word.
}

async function processSource(source: Source) {
  console.log(`\n⬇️  Downloading ${source.name}...`);
  const tempDownloadPath = path.join(TEMP_DIR, `temp_${source.filename}`);
  const finalPath = path.join(TEMP_DIR, source.filename);

  try {
    await downloadFile(source.url, tempDownloadPath);
    console.log(`✅ Downloaded. Processing...`);

    const processingPath = tempDownloadPath;

    const outputStream = fs.createWriteStream(finalPath);
    let count = 0;

    if (source.type === "json") {
      // JSON is special, we need to read the whole file usually
      // But for "an-array-of-french-words", it's a simple array.
      // Let's read the whole file for JSON.
      const content = fs.readFileSync(processingPath, "utf-8");
      const words = JSON.parse(content);
      if (Array.isArray(words)) {
        words.forEach((w) => {
          if (typeof w === "string") {
            outputStream.write(w + "\n");
            count++;
          }
        });
      }
    } else {
      const fileStream = fs.createReadStream(processingPath);
      const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
      });

      // Stream processing for line-based formats
      for await (const line of rl) {
        let word = "";

        if (source.type === "txt") {
          word = line;
        } else if (source.type === "tsv") {
          const parts = line.split("\t");
          // Lexique: ortho is col 0
          if (parts.length > 0) word = parts[0];
        } else if (source.type === "csv") {
          // Hbenbel CSVs are "word,tags" or similar
          // We only want the first column (the word)
          const parts = line.split(",");
          if (parts.length > 0) {
            word = parts[0].replace(/"/g, ""); // Remove quotes
          } else {
            word = line.replace(/"/g, "");
          }
        } else if (source.type === "jsonl") {
          try {
            if (!line.trim()) continue;
            const data = JSON.parse(line);
            if (data.word) word = data.word;
          } catch (e) {
            console.log(`❌ Error parsing JSON line: ${e}`);
            continue;
          }
        }

        word = normalizeWord(word);
        if (word) {
          outputStream.write(word + "\n");
          count++;
        }
      }
    }

    outputStream.end();
    console.log(`✨ Extracted ${count} words to ${source.filename}`);

    // Cleanup raw download and extracted files
    fs.unlinkSync(tempDownloadPath);
  } catch (error) {
    console.error(`❌ Error processing ${source.name}:`, error);
  }
}

async function main() {
  console.log("🚀 Starting Dictionary Download & Normalization...");
  console.log(`📂 Output Directory: ${TEMP_DIR}`);

  for (const source of SOURCES) {
    await processSource(source);
  }

  console.log("\n✅ All downloads completed!");
  console.log(
    "👉 You can now run 'pnpm dictionary:merge' to merge these sources.",
  );
}

main();
