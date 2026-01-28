import { COMMON_ANGLICISMS } from "@/lib/constants/commonAnglicisms";
import fs from "fs";
import path from "path";

const DICTIONARY_PATH = path.join(
  process.cwd(),
  "src/assets/dictionary/dictionary.txt",
);

async function analyze() {
  console.log("🔍 Analyzing dictionary...");

  if (!fs.existsSync(DICTIONARY_PATH)) {
    console.error("❌ Dictionary not found at:", DICTIONARY_PATH);
    return;
  }

  const content = fs.readFileSync(DICTIONARY_PATH, "utf-8");
  const words = content.split("\n").filter((w) => w.trim());

  console.log(`📊 Total words: ${words.length}`);

  // 1. Length Analysis
  const wordsByLength: Record<number, string[]> = {};
  const veryLongWords: string[] = [];

  words.forEach((word) => {
    const len = word.length;
    if (!wordsByLength[len]) wordsByLength[len] = [];
    wordsByLength[len].push(word);

    if (len >= 25) veryLongWords.push(word);
  });

  console.log("\n📏 Length Distribution:");
  const lengthStats = Object.keys(wordsByLength)
    .map(Number)
    .sort((a, b) => a - b)
    .map((len) => {
      const count = wordsByLength[len].length;
      const percent = ((count / words.length) * 100).toFixed(5) + "%";
      return { Length: len, Number: count, Percent: percent };
    });

  console.table(lengthStats);

  // 2. Character Frequency
  const charFreq: Record<string, number> = {};
  const palindromes: string[] = [];
  let totalChars = 0;

  words.forEach((word) => {
    // Char freq
    for (const char of word) {
      charFreq[char] = (charFreq[char] || 0) + 1;
      totalChars++;
    }

    // Palindromes
    const reversed = word.split("").reverse().join("");
    if (word === reversed && word.length > 2) {
      palindromes.push(word);
    }
  });

  console.log("\n🔤 Character Frequency:");
  console.table(
    Object.entries(charFreq)
      .sort(([a], [b]) => a.localeCompare(b))
      .reduce(
        (acc, [char, count]) => {
          acc[char] = ((count / totalChars) * 100).toFixed(2) + "%";
          return acc;
        },
        {} as Record<string, string>,
      ),
  );

  console.log(`\n🔄 Palindromes (>2 chars) [${palindromes.length}]:`);
  console.log(
    palindromes.slice(0, 50).join(", ") +
      (palindromes.length > 50 ? "..." : ""),
  );

  // 3. Anglicism Analysis
  const potentialAnglicisms: string[] = [];
  words.forEach((word) => {
    const lowerWord = word.toLowerCase();
    // Check direct match
    if (COMMON_ANGLICISMS.has(lowerWord)) {
      potentialAnglicisms.push(word);
    }
    // Check endings common in English but rare/anglicism in French
    else if (
      lowerWord.endsWith("ing") &&
      lowerWord.length > 5 &&
      !lowerWord.endsWith("oing")
    ) {
      // oing like 'poing'
      potentialAnglicisms.push(word);
    }
  });

  console.log(
    `\n🇬🇧 Potential Anglicisms found [${potentialAnglicisms.length}]:`,
  );
  // Show top 100 to avoid spam
  console.log(potentialAnglicisms.slice(0, 100).join(", "));
  if (potentialAnglicisms.length > 100) {
    console.log(`... and ${potentialAnglicisms.length - 100} more.`);
  }

  // 3. Spammy words (vowels only)
  const vowelsOnly = words.filter(
    (w) => /^[aeiouy]+$/i.test(w) && w.length > 1,
  );

  console.log(`\n🗣️ Vowels-only words [${vowelsOnly.length}]:`);
  console.log(vowelsOnly.join(", "));
}

analyze();
