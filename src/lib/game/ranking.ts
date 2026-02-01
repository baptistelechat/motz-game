import { GamePlayer, RoundSubmission } from "@/store/use-game-store";

export interface RankedPlayer {
  player: GamePlayer;
  submission?: RoundSubmission;
  score: number;
  word: string;
  rank: number;
  isValid: boolean;
}

/**
 * Calculates player rankings based on score (descending) and submission time (ascending).
 * Valid submissions always rank higher than invalid ones (or non-submissions).
 *
 * Logic:
 * 1. Valid submissions > Invalid/No submissions
 * 2. Higher score > Lower score
 * 3. Earlier submission > Later submission
 */
export function calculatePlayerRankings(
  players: GamePlayer[],
  submissions: RoundSubmission[],
): RankedPlayer[] {
  // 1. Map players to their submissions and basic stats
  const mapped = players.map((player) => {
    const submission = submissions.find((s) => s.player_id === player.id);
    return {
      player,
      submission,
      score: submission?.score || 0,
      word: submission?.word || "-",
      // Default validity is true unless explicitly false (to handle pending validation states if needed)
      // But usually, if submission exists, is_valid is boolean. If no submission, effectively invalid for ranking.
      isValid: submission ? submission.is_valid !== false : false,
    };
  });

  // 2. Sort the mapped players
  const sorted = mapped.sort((a, b) => {
    // Valid first (if submission exists and is valid)
    // If a has no submission, a.isValid is false.
    if (a.isValid && !b.isValid) return -1;
    if (!a.isValid && b.isValid) return 1;

    // If both are valid (or both invalid/no-submission)
    // Note: If both are invalid, we might want to keep original order or just sort by name?
    // But assuming we are ranking valid players mostly.

    // Higher score first
    if (b.score !== a.score) return b.score - a.score;

    // Tie-breaker: Time (Faster/Lower timestamp first)
    const timeA = a.submission?.created_at
      ? new Date(a.submission.created_at).getTime()
      : Infinity;
    const timeB = b.submission?.created_at
      ? new Date(b.submission.created_at).getTime()
      : Infinity;

    return timeA - timeB;
  });

  // 3. Assign Rank based on position in sorted list
  // Only assign rank if the player has a valid submission (or at least a submission?)
  // Usually we only rank valid submissions.
  return sorted.map((item, index) => ({
    ...item,
    rank: item.isValid ? index + 1 : 999,
  }));
}
