export type ConstraintType =
  | "free"
  | "min_len"
  | "max_len"
  | "exact_len"
  | "starts_with_imposed"
  | "ends_with_imposed"
  | "unique_chars"
  | "min_vowels"
  | "invert_letters"
  | "theme";

export interface ConstraintCard {
  type: ConstraintType;
  value?: number; // For len constraints or min_vowels
}

export interface RoundConstraints {
  imposed_letter: string;
  forbidden_letter: string;
  constraint_card: ConstraintCard;
  theme?: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string; // Human readable error key or message
}
