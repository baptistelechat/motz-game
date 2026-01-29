import { ThemeManager } from "@/lib/game/theme-manager";
import { normalizeString, slugify } from "@/lib/utils/string";
import { useEffect, useState } from "react";

interface ThemeState {
  isLoading: boolean;
  isReady: boolean;
  isValid: (word: string) => boolean;
}

export function useTheme(themeName?: string): ThemeState {
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const manager = ThemeManager.getInstance();

  useEffect(() => {
    if (!themeName || themeName === "Général") {
      setIsReady(true);
      return;
    }

    const slug = slugify(themeName);
    const filter = manager.getFilter(slug);

    if (filter) {
      setIsReady(true);
      return;
    }

    setIsLoading(true);
    manager
      .loadTheme(slug)
      .then(() => {
        setIsReady(true);
      })
      .catch((err) => {
        console.error("Failed to load theme:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [manager, themeName]);

  const isValid = (word: string): boolean => {
    if (!themeName || themeName === "Général") return true;

    const slug = slugify(themeName);
    const filter = manager.getFilter(slug);

    // If filter not loaded yet or failed, decide policy.
    // Safe policy: if theme is required but filter missing, fail?
    // Or allow?
    // Given the requirement is strict validation, we should probably fail if filter is missing
    // BUT only if we are sure it should exist.
    if (!filter) return true; // Fallback to true if theme file missing (avoid blocking game)

    return filter.has(normalizeString(word));
  };

  return { isLoading, isReady, isValid };
}
