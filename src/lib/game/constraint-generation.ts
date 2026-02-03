import { ConstraintCard, ConstraintType, RoundConstraints } from "@/types/game";

const CARD_TYPES: ConstraintType[] = [
  "free",
  "min_len",
  "max_len",
  "exact_len",
  "starts_with_imposed",
  "ends_with_imposed",
  "unique_chars",
  "min_vowels",
  "invert_letters",
  "theme",
];

function getRandomChar(): string {
  // A-Z
  return String.fromCharCode(65 + Math.floor(Math.random() * 26));
}

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function generateRoundConstraints(
  themes: string[] = ["Général"],
): RoundConstraints {
  const imposed_letter = getRandomChar();

  let forbidden_letter = getRandomChar();
  while (forbidden_letter === imposed_letter) {
    forbidden_letter = getRandomChar();
  }

  const cardType = getRandomElement(CARD_TYPES);
  let cardValue: number | undefined;
  let selectedTheme: string | undefined;

  switch (cardType) {
    case "min_len":
      cardValue = 4 + Math.floor(Math.random() * 5); // 4 to 8
      break;
    case "max_len":
      cardValue = 6 + Math.floor(Math.random() * 5); // 6 to 10
      break;
    case "exact_len":
      cardValue = 5 + Math.floor(Math.random() * 4); // 5 to 8
      break;
    case "min_vowels":
      cardValue = 2 + Math.floor(Math.random() * 3); // 2 to 4
      break;
    case "theme":
      selectedTheme = getRandomElement(themes);
      break;
  }

  const constraint_card: ConstraintCard = {
    type: cardType,
    value: cardValue,
  };

  return {
    imposed_letter,
    forbidden_letter,
    constraint_card,
    theme: selectedTheme,
  };
}
