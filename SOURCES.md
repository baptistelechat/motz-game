# Dictionary Sources

This project aggregates French words from multiple open-source dictionaries to create a comprehensive wordlist for the game.

## Sources

| Source File | Origin | Description | License |
|---|---|---|---|
| `source-gh-Thecoolsim-French-Scrabble-ODS8.txt` | [GitHub - Thecoolsim/French-Scrabble-ODS8](https://github.com/Thecoolsim/French-Scrabble-ODS8) | Scrabble ODS8 valid words | Unspecified |
| `source-gh-chrplr-openlexicon-gutenberg.txt` | [GitHub - chrplr/openlexicon](https://github.com/chrplr/openlexicon) | Gutenberg corpus word frequencies | MIT |
| `source-gh-Taknok-French-Wordlist.txt` | [GitHub - Taknok/French-Wordlist](https://github.com/Taknok/French-Wordlist) | Large French wordlist | MIT |
| `source-gh-hbenbel-dictionary.csv` | [GitHub - hbenbel/French-Dictionary](https://github.com/hbenbel/French-Dictionary) | General dictionary with IPA | MIT |
| `source-gh-hbenbel-noun.csv` | [GitHub - hbenbel/French-Dictionary](https://github.com/hbenbel/French-Dictionary) | Nouns with metadata | MIT |
| `source-gh-hbenbel-verb.csv` | [GitHub - hbenbel/French-Dictionary](https://github.com/hbenbel/French-Dictionary) | Verbs with conjugations | MIT |
| `source-gh-hbenbel-adj.csv` | [GitHub - hbenbel/French-Dictionary](https://github.com/hbenbel/French-Dictionary) | Adjectives | MIT |
| `source-gh-hbenbel-adv.csv` | [GitHub - hbenbel/French-Dictionary](https://github.com/hbenbel/French-Dictionary) | Adverbs | MIT |
| `source-gh-words-an-array-of-french-words.json` | [GitHub - words/an-array-of-french-words](https://github.com/words/an-array-of-french-words) | JSON array of ~13k words | MIT |

## Processing Pipeline

1. **Merge**: `scripts/merge-dictionaries.ts` reads all `source-*` files.
   - Normalizes text (NFD, uppercase, trim).
   - Filters invalid characters (only A-Z allowed).
   - Deduplicates words.
   - Outputs `src/assets/dictionary/dictionary.txt`.

2. **Generate**: `scripts/generate-dictionary.ts` processes `dictionary.txt`.
   - Creates a Bloom Filter for efficient lookup.
   - Optimizes the word list for the game.
   - Outputs `src/assets/dictionary/dictionary.json` (or `.bin`).

## Adding a New Source

1. Download the file to `src/assets/dictionary/`.
2. Name it `source-gh-<username>-<repo>.<ext>`.
3. If it's a new format, update `scripts/merge-dictionaries.ts` parsers.
4. Run `npm run dictionary:merge`.
5. Run `npm run dictionary:generate`.
