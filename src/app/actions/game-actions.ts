"use server";

import { createClient } from "@/lib/supabase/server";
import { customAlphabet } from "nanoid";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Generate a short code for the game (6 chars, uppercase + numbers)
const generateGameCode = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  6,
);

export async function createGame() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Vous devez être connecté pour créer une partie.");
  }

  const code = generateGameCode();

  const { data: game, error: createError } = await supabase
    .from("games")
    .insert({
      code,
      host_id: user.id,
      status: "LOBBY",
    })
    .select("id, code")
    .single();

  if (createError) {
    console.error("Error creating game:", createError);
    throw new Error("Impossible de créer la partie.");
  }

  // Auto-join the host
  const { error: joinError } = await supabase.from("game_players").insert({
    game_id: game.id,
    player_id: user.id,
    is_ready: false,
  });

  if (joinError) {
    console.error("Error joining game as host:", joinError);
    throw new Error("Impossible de rejoindre la partie créée.");
  }

  redirect(`/room/${game.code}`);
}

export async function joinGame(code: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Vous devez être connecté pour rejoindre une partie.");
  }

  // Get game ID from code
  const { data: game, error: gameError } = await supabase
    .from("games")
    .select("id, status")
    .eq("code", code)
    .single();

  if (gameError || !game) {
    throw new Error("Partie introuvable.");
  }

  if (game.status !== "LOBBY") {
    throw new Error("La partie a déjà commencé ou est terminée.");
  }

  // Check if already joined
  const { data: existingPlayer } = await supabase
    .from("game_players")
    .select("game_id")
    .eq("game_id", game.id)
    .eq("player_id", user.id)
    .single();

  if (existingPlayer) {
    return { success: true, message: "Déjà dans la partie" };
  }

  const { error: joinError } = await supabase.from("game_players").insert({
    game_id: game.id,
    player_id: user.id,
  });

  if (joinError) {
    console.error("Error joining game:", joinError);
    throw new Error("Impossible de rejoindre la partie.");
  }

  revalidatePath(`/room/${code}`);
  return { success: true };
}

export async function toggleReady(gameId: string, isReady: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("User must be authenticated");

  const { error } = await supabase
    .from("game_players")
    .update({ is_ready: isReady })
    .eq("game_id", gameId)
    .eq("player_id", user.id);

  if (error) throw new Error(`Failed to update ready status: ${error.message}`);

  return { success: true };
}

export async function startGame(gameId: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("User must be authenticated");

  const { data: game, error: gameError } = await supabase
    .from("games")
    .select("host_id")
    .eq("id", gameId)
    .single();

  if (gameError || !game) throw new Error("Game not found");

  if (game.host_id !== user.id)
    throw new Error("Only the host can start the game");

  const { data: players, error: playersError } = await supabase
    .from("game_players")
    .select("is_ready")
    .eq("game_id", gameId);

  if (playersError || !players) throw new Error("Failed to fetch players");

  const allReady = players.every((p) => p.is_ready);

  if (!allReady) throw new Error("Not all players are ready");

  const { error: rpcError } = await supabase.rpc("start_new_round", {
    p_game_id: gameId,
  });

  if (rpcError)
    throw new Error(`Failed to start game: ${rpcError.message}`);

  return { success: true };
}
