import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export interface LeaderboardEntry {
  playerId: string;
  totalScore: number;
  rank: number;
  lastRoundScore: number; // For "Score de la manche puis score total" logic
}

export function useLeaderboard(gameId: string, currentRoundId?: string) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    if (!gameId) return;

    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        const { data: submissions, error } = await supabase
          .from("submissions")
          .select("player_id, score, round_id")
          .eq("game_id", gameId);

        if (error) {
          console.error("Error fetching leaderboard:", error);
          return;
        }

        if (!submissions) return;

        // Group by player
        const playerScores: Record<
          string,
          { total: number; lastRound: number }
        > = {};

        submissions.forEach((sub) => {
          if (!playerScores[sub.player_id]) {
            playerScores[sub.player_id] = { total: 0, lastRound: 0 };
          }
          playerScores[sub.player_id].total += sub.score;

          if (sub.round_id === currentRoundId) {
            playerScores[sub.player_id].lastRound = sub.score;
          }
        });

        // Convert to array and sort
        const entries: LeaderboardEntry[] = Object.entries(playerScores).map(
          ([playerId, scores]) => ({
            playerId,
            totalScore: scores.total,
            lastRoundScore: scores.lastRound,
            rank: 0, // Will assign after sort
          }),
        );

        entries.sort((a, b) => b.totalScore - a.totalScore);

        // Assign rank
        entries.forEach((entry, index) => {
          entry.rank = index + 1;
        });

        setLeaderboard(entries);
      } catch (err) {
        console.error("Leaderboard fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();

    // Realtime subscription for score updates
    const channel = supabase
      .channel(`leaderboard:${gameId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "submissions",
          filter: `game_id=eq.${gameId}`,
        },
        () => {
          fetchLeaderboard();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, currentRoundId, supabase]);

  return { leaderboard, isLoading };
}
