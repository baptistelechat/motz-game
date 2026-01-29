import { createClient } from "@/lib/supabase/client";
import { GamePlayer, useGameStore } from "@/store/use-game-store";
import { useCallback, useEffect, useState } from "react";

export function useRealtimeGame(gameId: string) {
  const {
    setPlayers,
    setStatus,
    setCurrentRound,
    setIsLoading,
    setHostId,
    setGameId,
  } = useGameStore();
  const [supabase] = useState(() => createClient());

  const fetchPlayers = useCallback(async () => {
    const { data: players } = await supabase
      .from("game_players")
      .select(`*, player:players(*)`)
      .eq("game_id", gameId)
      .order("joined_at", { ascending: true });

    if (players) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const formattedPlayers: GamePlayer[] = players.map((p: any) => ({
        id: p.player.id,
        pseudo: p.player.pseudo,
        avatar_config: p.player.avatar_config,
        is_ready: p.is_ready,
        joined_at: p.joined_at,
      }));
      setPlayers(formattedPlayers);
    }
  }, [gameId, supabase, setPlayers]);

  const fetchGameData = useCallback(async () => {
    setIsLoading(true);

    try {
      // Fetch game status and host
      const { data: game } = await supabase
        .from("games")
        .select("status, host_id")
        .eq("id", gameId)
        .single();

      if (game) {
        setStatus(game.status);
        setHostId(game.host_id);
      }

      // Fetch players
      await fetchPlayers();

      // Fetch current round
      const { data: round } = await supabase
        .from("rounds")
        .select("*")
        .eq("game_id", gameId)
        .order("round_number", { ascending: false })
        .limit(1)
        .single();

      if (round) {
        setCurrentRound({
          id: round.id,
          round_number: round.round_number,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          constraints: round.constraints as any,
          status: round.status,
        });
      }
    } catch (error) {
      console.error("Error fetching game data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [
    gameId,
    supabase,
    fetchPlayers,
    setStatus,
    setHostId,
    setCurrentRound,
    setIsLoading,
  ]);

  useEffect(() => {
    if (!gameId) return;

    setGameId(gameId);
    fetchGameData();

    const channel = supabase
      .channel(`game_main:${gameId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "games",
          filter: `id=eq.${gameId}`,
        },
        (payload) => {
          if (payload.new && "status" in payload.new) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setStatus(payload.new.status as any);
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "rounds",
          filter: `game_id=eq.${gameId}`,
        },
        async () => {
          const { data: round } = await supabase
            .from("rounds")
            .select("*")
            .eq("game_id", gameId)
            .order("round_number", { ascending: false })
            .limit(1)
            .single();

          if (round) {
            setCurrentRound({
              id: round.id,
              round_number: round.round_number,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              constraints: round.constraints as any,
              status: round.status,
            });
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_players",
          filter: `game_id=eq.${gameId}`,
        },
        () => {
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
          fetchPlayers();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [
    gameId,
    supabase,
    fetchGameData,
    fetchPlayers,
    setStatus,
    setCurrentRound,
    setGameId,
  ]);

  return { refresh: fetchGameData };
}
