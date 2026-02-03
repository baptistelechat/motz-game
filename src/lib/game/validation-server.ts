import { BloomFilter } from 'bloom-filters';
import fs from 'fs';
import path from 'path';
import { validateWord } from './validation';
import { RoundConstraints } from '@/types/game';

let filter: BloomFilter | null = null;

function getFilter() {
  if (filter) return filter;

  try {
    const dictPath = path.join(process.cwd(), 'public', 'assets', 'dictionary', 'dictionary.json');
    if (!fs.existsSync(dictPath)) {
        console.error("Dictionary not found at", dictPath);
        throw new Error("Dictionary not found");
    }
    const fileContent = fs.readFileSync(dictPath, 'utf-8');
    const json = JSON.parse(fileContent);
    filter = BloomFilter.fromJSON(json);
  } catch (e) {
    console.error("Failed to load dictionary:", e);
    throw e;
  }
  return filter;
}

export function validateWordServer(word: string, constraints: RoundConstraints) {
  const f = getFilter();
  if (!f) throw new Error("Dictionary not initialized");

  const dictionaryCheck = (w: string) => {
    return f.has(w);
  };

  return validateWord(word, constraints, dictionaryCheck);
}
