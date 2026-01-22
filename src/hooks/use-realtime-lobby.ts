import { createClient } from "@/lib/supabase/client";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

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

export type GameStatus = "LOBBY" | "PLAYING" | "FINISHED";

export function useRealtimeLobby(gameId: string, currentUserId?: string) {
  const [players, setPlayers] = useState<LobbyPlayer[]>([]);
  const [gameStatus, setGameStatus] = useState<GameStatus>("LOBBY");
  const [isLoading, setIsLoading] = useState(true);
  // Keep supabase instance stable across renders
  const [supabase] = useState(() => createClient());

  // Refs for tracking changes to emit toasts
  const previousPlayersRef = useRef<LobbyPlayer[]>([]);
  const isFirstLoadRef = useRef(true);
  const fetchRequestId = useRef(0);

  // Effect to detect new players and show toasts
  useEffect(() => {
    if (players.length > 0) {
      if (isFirstLoadRef.current) {
        previousPlayersRef.current = players;
        isFirstLoadRef.current = false;
        return;
      }

      // Find new players
      const newJoiners = players.filter(
        (p) =>
          !previousPlayersRef.current.some(
            (prev) => prev.player_id === p.player_id,
          ) && p.player_id !== currentUserId,
      );

      newJoiners.forEach((joiner) => {
        toast.success(`${joiner.player.pseudo} a rejoint la partie !`);
      });

      // Find players who left
      const leavers = previousPlayersRef.current.filter(
        (prev) =>
          !players.some((p) => p.player_id === prev.player_id) &&
          prev.player_id !== currentUserId,
      );

      leavers.forEach((leaver) => {
        toast.info(`${leaver.player.pseudo} a quitté la partie.`);
      });

      // Update ref
      previousPlayersRef.current = players;
    }
  }, [players, currentUserId]);

  const fetchPlayers = useCallback(async () => {
    if (!gameId) return;

    const requestId = ++fetchRequestId.current;

    const { data, error } = await supabase
      .from("game_players")
      .select(`*, player:players(id, pseudo, avatar_config)`)
      .eq("game_id", gameId)
      .order("joined_at", { ascending: true });

    // Ignore outdated responses to prevent race conditions
    if (requestId !== fetchRequestId.current) return;

    if (error) {
      console.error("Error fetching players:", error);
    } else if (data) {
      setPlayers(data as unknown as LobbyPlayer[]);
    }
  }, [gameId, supabase]);

  const fetchGameStatus = useCallback(async () => {
    if (!gameId) return;
    const { data, error } = await supabase
      .from("games")
      .select("status")
      .eq("id", gameId)
      .single();

    if (error) {
      console.error("Error fetching game status:", error);
    } else if (data) {
      setGameStatus(data.status as GameStatus);
    }
  }, [gameId, supabase]);

  useEffect(() => {
    if (!gameId) return;

    // Initial fetch
    Promise.all([fetchPlayers(), fetchGameStatus()]).then(() => {
      setIsLoading(false);
    });

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
          console.log("🔄 Realtime update received (game_players), fetching players...");
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
          // Refresh if any player profile updates (avatar/pseudo)
          fetchPlayers();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "games",
          filter: `id=eq.${gameId}`,
        },
        (payload) => {
          console.log("🔄 Realtime update received (games), updating status...");
          if (payload.new && "status" in payload.new) {
            setGameStatus(payload.new.status as GameStatus);
          }
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log(`✅ Subscribed to game_players:${gameId}`);
        } else if (status === "CHANNEL_ERROR") {
          console.error(`❌ Failed to subscribe to game_players:${gameId}`);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, supabase, fetchPlayers, fetchGameStatus]);

  return { players, gameStatus, isLoading, refreshPlayers: fetchPlayers };
}
