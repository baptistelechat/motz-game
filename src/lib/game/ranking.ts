import { GamePlayer, RoundSubmission } from "@/store/use-game-store";

export interface RankedPlayer {
  player: GamePlayer;
  submission?: RoundSubmission;
  score: number;
  word: string;
  rank: number;
  isValid: boolean;
  duration?: number; // Duration in seconds
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
  roundStartTime?: string,
): RankedPlayer[] {
  // 1. Map players to their submissions and basic stats
  const mapped = players.map((player) => {
    const submission = submissions.find((s) => s.player_id === player.id);

    let duration: number | undefined;
    if (submission && roundStartTime && submission.created_at) {
      const start = new Date(roundStartTime).getTime();
      const end = new Date(submission.created_at).getTime();
      duration = Math.max(0, (end - start) / 1000);
    }

    return {
      player,
      submission,
      score: submission?.score || 0,
      word: submission?.word || "-",
      isValid: submission ? submission.is_valid !== false : false,
      duration,
    };
  });

  // 2. Sort the mapped players
  const sorted = mapped.sort((a, b) => {
    // Valid first (if submission exists and is valid)
    // If a has no submission, a.isValid is false.
    if (a.isValid && !b.isValid) return -1;
    if (!a.isValid && b.isValid) return 1;

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
