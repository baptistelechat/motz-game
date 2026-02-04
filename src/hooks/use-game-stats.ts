import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export interface GameStats {
  bestWord: {
    word: string;
    score: number;
    playerId: string;
  } | null;
  longestWord: {
    word: string;
    length: number;
    playerId: string;
  } | null;
  totalWords: number;
  averageScore: number;
}

export function useGameStats(gameId: string) {
  const [stats, setStats] = useState<GameStats>({
    bestWord: null,
    longestWord: null,
    totalWords: 0,
    averageScore: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    if (!gameId) return;

    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const { data: submissions, error } = await supabase
          .from("submissions")
          .select("player_id, word, score, is_valid")
          .eq("game_id", gameId)
          .eq("is_valid", true); // Only valid words count for positive stats

        if (error) {
          console.error("Error fetching stats:", error);
          return;
        }

        if (!submissions || submissions.length === 0) {
          setIsLoading(false);
          return;
        }

        let bestWord = null;
        let longestWord = null;
        let totalScore = 0;

        submissions.forEach((sub) => {
          // Best word (highest score)
          if (!bestWord || sub.score > bestWord.score) {
            bestWord = {
              word: sub.word,
              score: sub.score,
              playerId: sub.player_id,
            };
          }

          // Longest word
          if (!longestWord || sub.word.length > longestWord.length) {
            longestWord = {
              word: sub.word,
              length: sub.word.length,
              playerId: sub.player_id,
            };
          }

          totalScore += sub.score;
        });

        setStats({
          bestWord,
          longestWord,
          totalWords: submissions.length,
          averageScore: Math.round(totalScore / submissions.length),
        });
      } catch (err) {
        console.error("Stats fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [gameId, supabase]);

  return { stats, isLoading };
}
