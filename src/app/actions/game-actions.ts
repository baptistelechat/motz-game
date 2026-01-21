"use server";

import { createClient } from "@/lib/supabase/server";
import { generateGameCode } from "@/lib/utils/game-code";
import { generateRandomPlayer } from "@/lib/utils/generate-player";
import { redirect } from "next/navigation";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function ensurePlayerProfile(supabase: any, userId: string) {
  const { data: player } = await supabase
    .from("players")
    .select("id")
    .eq("id", userId)
    .single();

  if (!player) {
    const { error } = await supabase.from("players").insert({
      id: userId,
      ...generateRandomPlayer(),
    });
    if (error) {
      console.error("Failed to create default profile:", error);
      // We don't throw here, hoping it might have been a race condition
      // and let the next step (FK constraint) catch it if it really failed
    }
  }
}

export async function createGame() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("User must be authenticated to create a game");
  }

  // Ensure profile exists before creating game/joining
  await ensurePlayerProfile(supabase, user.id);

  let code: string;
  let retries = 0;
  const maxRetries = 5;

  while (retries < maxRetries) {
    code = generateGameCode();

    const { data, error } = await supabase
      .from("games")
      .insert({
        code,
        host_id: user.id,
        status: "LOBBY",
      })
      .select("code, id")
      .single();

    if (!error && data) {
      // Add host to game_players immediately
      const { error: joinError } = await supabase.from("game_players").insert({
        game_id: data.id,
        player_id: user.id,
        is_ready: false,
      });

      if (joinError) {
        // If host cannot join, we might want to cleanup the game or log error
        console.error("Failed to add host to game_players", joinError);
        // But we still redirect, as the user can probably "join" again by visiting the page
      }

      redirect(`/room/${data.code}`);
    }

    if (error?.code === "23505") {
      // Postgres unique_violation
      retries++;
      continue;
    }

    throw new Error(`Failed to create game: ${error.message}`);
  }

  throw new Error(
    "Failed to generate a unique game code after multiple attempts",
  );
}

export async function joinGame(code: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("User must be authenticated to join a game");
  }

  // Ensure profile exists before joining
  await ensurePlayerProfile(supabase, user.id);

  // 1. Fetch game details
  const { data: game, error: gameError } = await supabase
    .from("games")
    .select("id, status")
    .eq("code", code)
    .single();

  if (gameError || !game) {
    throw new Error("Game not found");
  }

  if (game.status !== "LOBBY") {
    throw new Error("Game is already started or finished");
  }

  // 2. Insert into game_players
  const { error: joinError } = await supabase.from("game_players").insert({
    game_id: game.id,
    player_id: user.id,
  });

  if (joinError) {
    // Ignore duplicate key error (player already joined)
    if (joinError.code === "23505") {
      return { success: true, gameId: game.id };
    }
    throw new Error(`Failed to join game: ${joinError.message}`);
  }

  return { success: true, gameId: game.id };
}
