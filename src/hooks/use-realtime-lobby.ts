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
  // Create a stable supabase client instance
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    const fetchPlayers = async () => {
      const { data, error } = await supabase
        .from("game_players")
        .select(
          `
        *,
        player:players(id, pseudo, avatar_config)
      `,
        )
        .eq("game_id", gameId)
        .order("joined_at", { ascending: true });

      if (!error && data) {
        // Transform data to match LobbyPlayer type if necessary
        // Supabase returns array of objects, need to ensure type safety
        setPlayers(data as unknown as LobbyPlayer[]);
      }
      setIsLoading(false);
    };

    fetchPlayers();

    const channel = supabase
      .channel(`game_players:${gameId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_players",
          filter: `game_id=eq.${gameId}`,
        },
        () => {
          // On any change in lobby, re-fetch
          fetchPlayers();
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
          // When ANY player updates their profile, check if they are in our lobby
          // If so, refresh the lobby data to show new avatar/pseudo
          // We can't access current 'players' state easily here without refs, 
          // but re-fetching is safe and ensures consistency.
          // To optimize, we could check if payload.new.id is in the list, 
          // but for now, simple is better.
          fetchPlayers();
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("Realtime connected for lobby:", gameId);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, supabase]);

  return { players, isLoading };
}
