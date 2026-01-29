import { RoundConstraints, ValidationResult } from "@/types/game";
import { validateWord } from "./validation";
import { getServerDictionarySet } from "./server-dictionary";

export async function validateWordServer(
  word: string,
  constraints: RoundConstraints
): Promise<ValidationResult> {
  // Ensure dictionary is loaded
  const dict = await getServerDictionarySet();
  
  // Create synchronous check function
  const check = (w: string) => dict.has(w.toUpperCase());
  
  // Run validation
  return validateWord(word, constraints, check);
}
