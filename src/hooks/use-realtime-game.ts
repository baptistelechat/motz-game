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
    currentRound,
    setRoundSubmissions,
    addRoundSubmission,
    removeRoundSubmission,
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
    if (!currentRound?.id) {
      setRoundSubmissions([]);
      return;
    }

    const fetchSubmissions = async () => {
      const { data } = await supabase
        .from("submissions")
        .select("*")
        .eq("round_id", currentRound.id)
        .eq("is_valid", true);

      if (data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setRoundSubmissions(data as any[]);
      }
    };

    fetchSubmissions();
  }, [currentRound?.id, supabase, setRoundSubmissions]);

  useEffect(() => {
    if (!gameId) return;

    setGameId(gameId);
    fetchGameData();

    const channel = supabase
      .channel(`game_main:${gameId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "submissions",
          filter: `game_id=eq.${gameId}`,
        },
        (payload) => {
          const currentRound = useGameStore.getState().currentRound;
          if (
            payload.new &&
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (payload.new as any).is_valid &&
            currentRound &&
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (payload.new as any).round_id === currentRound.id
          ) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            addRoundSubmission(payload.new as any);
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "submissions",
        },
        (payload) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if (payload.old && (payload.old as any).id) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            removeRoundSubmission((payload.old as any).id);
          }
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
    addRoundSubmission,
    removeRoundSubmission,
  ]);

  return { refresh: fetchGameData };
}
