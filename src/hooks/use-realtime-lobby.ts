import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export type LobbyPlayer = {
  game_id: string;
  player_id: string;
  is_ready: boolean;
  joined_at: string;
  player: {
    id: string;
    pseudo: string;
    avatar_config: { animal: string; color: string };
  };
};

export function useRealtimeLobby(gameId: string) {
  const [players, setPlayers] = useState<LobbyPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Keep supabase instance stable across renders
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    if (!gameId) return;

    const fetchPlayers = async () => {
      const { data, error } = await supabase
        .from("game_players")
        .select(`*, player:players(id, pseudo, avatar_config)`)
        .eq("game_id", gameId)
        .order("joined_at", { ascending: true });

      if (error) {
        console.error("Error fetching players:", error);
      } else if (data) {
        setPlayers(data as unknown as LobbyPlayer[]);
      }
      setIsLoading(false);
    };

    // Initial fetch
    fetchPlayers();

    const channel = supabase
      .channel(`game_players:${gameId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_players",
        },
        (payload) => {
          const newRecord = payload.new as { game_id: string } | null;
          const oldRecord = payload.old as { game_id: string } | null;

          if (
            (newRecord && newRecord.game_id === gameId) ||
            (oldRecord && oldRecord.game_id === gameId)
          ) {
            fetchPlayers();
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "players",
        },
        () => {
          // Refresh if any player profile updates (avatar/pseudo)
          // Ideally we should filter by players IN this game, but fetching is cheap here
          fetchPlayers();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, supabase]);

  return { players, isLoading };
}
