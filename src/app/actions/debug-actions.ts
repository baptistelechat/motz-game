"use server";

import { getServerDictionary } from "@/lib/game/server-dictionary";

export async function getDebugDictionary() {
  // Security check: Only allow in development
  if (process.env.NODE_ENV !== "development") {
    return [];
  }
  return getServerDictionary();
}
