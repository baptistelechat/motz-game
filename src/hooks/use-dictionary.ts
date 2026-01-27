import { useState, useEffect } from 'react';
import { BloomFilter } from 'bloom-filters';
import { normalizeString } from '@/lib/utils/string';

interface DictionaryState {
  isLoading: boolean;
  isReady: boolean;
  error: Error | null;
  has: (word: string) => boolean;
}

// Global cache to avoid re-fetching/re-parsing across component mounts
let dictionaryCache: BloomFilter | null = null;
let fetchPromise: Promise<BloomFilter> | null = null;

// For testing purposes
export function resetDictionaryCache() {
  dictionaryCache = null;
  fetchPromise = null;
}

export function useDictionary(): DictionaryState {
  const [isLoading, setIsLoading] = useState<boolean>(!dictionaryCache);
  const [isReady, setIsReady] = useState<boolean>(!!dictionaryCache);
  const [error, setError] = useState<Error | null>(null);
  // Force update to ensure re-render when global cache is ready
  const [, setTick] = useState(0);

  useEffect(() => {
    if (dictionaryCache) {
      setIsLoading(false);
      setIsReady(true);
      return;
    }

    if (!fetchPromise) {
      setIsLoading(true);
      fetchPromise = fetch('/assets/dictionary.json')
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to load dictionary: ${response.statusText}`);
          }
          return response.json();
        })
        .then((json) => {
          const filter = BloomFilter.fromJSON(json);
          dictionaryCache = filter;
          return filter;
        })
        .catch((err) => {
          fetchPromise = null; // Allow retry
          throw err;
        });
    }

    fetchPromise
      .then(() => {
        setIsLoading(false);
        setIsReady(true);
        setTick((t) => t + 1);
      })
      .catch((err) => {
        setIsLoading(false);
        setError(err instanceof Error ? err : new Error('Unknown error loading dictionary'));
      });
  }, []);

  const has = (word: string): boolean => {
    if (!dictionaryCache) return false;
    // Normalize: remove accents, uppercase
    const normalized = normalizeString(word);
    return dictionaryCache.has(normalized);
  };

  return { isLoading, isReady, error, has };
}
