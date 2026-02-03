"use client";

import { DictionaryManager } from "@/lib/game/dictionary-manager";
import { useEffect } from "react";

/**
 * Invisible component that triggers the dictionary loading in the background.
 * Used in key entry points (Home, Room) to ensure dictionary is ready before gameplay.
 */
export function DictionaryLoader() {
  useEffect(() => {
    // Fire and forget - the manager handles singleton logic and caching
    // We don't need to await this or handle errors here as the game components
    // will handle their own "isReady" state if it's still loading.
    DictionaryManager.getInstance()
      .init()
      .then(() => {
        console.log("[DictionaryLoader] Background pre-load complete");
      })
      .catch((err) => {
        // We log it but don't show UI error here (would be intrusive)
        // The actual GameInput will show an error if it fails later
        console.warn("[DictionaryLoader] Background pre-load failed", err);
      });
  }, []);

  return null;
}
