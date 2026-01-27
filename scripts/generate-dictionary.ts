
import fs from 'fs';
import path from 'path';
import { BloomFilter } from 'bloom-filters';

// Utility to normalize string (duplicated here to avoid import issues in script context if tsconfig paths are not set up for scripts)
function normalizeString(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim();
}

const DICT_PATH = path.join(process.cwd(), 'public', 'assets', 'dictionary.txt');
const OUTPUT_PATH = path.join(process.cwd(), 'public', 'assets', 'dictionary.json');

async function generateDictionary() {
  console.log('📖 Reading dictionary from:', DICT_PATH);

  if (!fs.existsSync(DICT_PATH)) {
    console.error('❌ Dictionary file not found!');
    process.exit(1);
  }

  const content = fs.readFileSync(DICT_PATH, 'utf-8');
  const words = content.split('\n')
    .map(w => normalizeString(w))
    .filter(w => w.length > 0);

  const uniqueWords = new Set(words);
  console.log(`✅ Found ${uniqueWords.size} unique words.`);

  // Create Bloom Filter
  // n = number of items, p = error probability
  const errorRate = 0.01; // 1% error rate is acceptable for a game (1 in 100 invalid words accepted)
  // If we want stricter, 0.001 (0.1%)
  // Let's try 0.001 for better quality, checks size later.
  const filter = BloomFilter.create(uniqueWords.size, 0.001);

  console.log('⚙️ Adding words to Bloom Filter...');
  for (const word of uniqueWords) {
    filter.add(word);
  }

  const json = filter.saveAsJSON();
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(json));

  const originalSize = fs.statSync(DICT_PATH).size / 1024 / 1024;
  const newSize = fs.statSync(OUTPUT_PATH).size / 1024 / 1024;

  console.log(`🎉 Dictionary generated at: ${OUTPUT_PATH}`);
  console.log(`📊 Stats:`);
  console.log(`   - Original Size (TXT): ${originalSize.toFixed(2)} MB`);
  console.log(`   - New Size (JSON): ${newSize.toFixed(2)} MB`);
  console.log(`   - Reduction: ${((1 - newSize / originalSize) * 100).toFixed(1)}%`);
}

generateDictionary();
