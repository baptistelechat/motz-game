import { PointsDetails } from "@/lib/schemas/submission-schema";

const LETTER_POINT_VALUES: Record<string, number> = {
  // Tier 1 (> 5%)
  E: 1, S: 1, A: 1, I: 1, R: 1, N: 1, T: 1, O: 1,
  // Tier 2 (3-5%)
  L: 2, U: 2, C: 2,
  // Tier 3 (1-3%)
  M: 3, D: 3, P: 3, G: 3, B: 3, H: 3, F: 3,
  // Tier 4 (0.5-1%)
  Z: 5, V: 5, Q: 5,
  // Tier 5 (< 0.5%)
  Y: 10, X: 10, J: 10, K: 10, W: 10
};

const SPEED_BONUS_BY_RANK: Record<number, number> = {
  1: 10,
  2: 8,
  3: 5,
  4: 3,
  5: 1
};

export function calculateWordScore(word: string): { word_score: number; letters: { char: string; score: number }[] } {
  const upperWord = word.toUpperCase();
  const letters: { char: string; score: number }[] = [];
  let word_score = 0;

  for (const char of upperWord) {
    const score = LETTER_POINT_VALUES[char] || 0;
    letters.push({ char, score });
    word_score += score;
  }
  return { word_score, letters };
}

export function calculateScore(word: string, rank: number): PointsDetails {
  const { word_score, letters } = calculateWordScore(word);
  const speed_bonus = SPEED_BONUS_BY_RANK[rank] || 0;
  const total_score = word_score + speed_bonus;

  return {
    word_score,
    speed_bonus,
    total_score,
    letters,
    rank
  };
}
