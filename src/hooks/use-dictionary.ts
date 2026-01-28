import { useState, useEffect } from 'react';
import { normalizeString } from '@/lib/utils/string';
import { DictionaryManager } from '@/lib/game/dictionary-manager';

interface DictionaryState {
  isLoading: boolean;
  isReady: boolean;
  error: Error | null;
  has: (word: string) => boolean;
}

// For testing purposes
export function resetDictionaryCache() {
  DictionaryManager.getInstance().resetForTests();
}

export function useDictionary(): DictionaryState {
  const manager = DictionaryManager.getInstance();
  const [isLoading, setIsLoading] = useState<boolean>(!manager.getFilter());
  const [isReady, setIsReady] = useState<boolean>(!!manager.getFilter());
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // If already loaded, no need to wait
    if (manager.getFilter()) {
      setIsLoading(false);
      setIsReady(true);
      return;
    }

    setIsLoading(true);
    manager.init()
      .then(() => {
        setIsLoading(false);
        setIsReady(true);
      })
      .catch((err) => {
        setIsLoading(false);
        setError(err);
      });
  }, []);

  const has = (word: string): boolean => {
    const filter = manager.getFilter();
    if (!filter) return false;
    const normalized = normalizeString(word);
    return filter.has(normalized);
  };

  return { isLoading, isReady, error, has };
}
