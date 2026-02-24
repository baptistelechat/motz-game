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
    updateRoundSubmission,
    removeRoundSubmission,
  } = useGameStore();
  const [supabase] = useState(() => createClient());

  const fetchPlayers = useCallback(async () => {
    // console.log("Fetching players for game:", gameId);
    const { data: players } = await supabase
      .from("game_players")
      .select(`*, player:players(*)`)
      .eq("game_id", gameId)
      .order("joined_at", { ascending: true });

    if (players) {
      // console.log("Fetched players count:", players.length);
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
          created_at: round.created_at,
          ends_at: round.ends_at,
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
    // Clear submissions immediately when round changes to prevent stale data
    // causing premature round completion in game-client logic
    setRoundSubmissions([]);

    if (!currentRound?.id) {
      return;
    }

    const fetchSubmissions = async () => {
      const { data } = await supabase
        .from("submissions")
        .select("*")
        .eq("round_id", currentRound.id);

      if (data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setRoundSubmissions(data as any[]);
      }
    };

    fetchSubmissions();
  }, [currentRound?.id, currentRound?.status, supabase, setRoundSubmissions]);

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
          table: "submissions",
          filter: `game_id=eq.${gameId}`,
        },
        (payload) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if (payload.new && (payload.new as any).id) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            updateRoundSubmission(payload.new as any);
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
              created_at: round.created_at,
              ends_at: round.ends_at,
            });
          } else {
            setCurrentRound(null);
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
        (payload) => {
          // If the current user was deleted from game_players, trigger refresh
          // The refresh/fetchPlayers logic might not be enough if we want to redirect
          // But GameClient monitors players list?
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
    updateRoundSubmission,
    removeRoundSubmission,
  ]);

  return { refresh: fetchGameData };
}
