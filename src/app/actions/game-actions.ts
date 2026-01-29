"use server";

import { generateRoundConstraints } from "@/lib/game/constraint-generation";
import { getServerDictionary } from "@/lib/game/server-dictionary";
import { getServerThemeFilter, getServerThemes } from "@/lib/game/server-theme";
import { validateWord } from "@/lib/game/validation";
import { createClient } from "@/lib/supabase/server";
import { generateGameCode } from "@/lib/utils/game-code";
import { normalizeString, slugify } from "@/lib/utils/string";
import { RoundConstraints } from "@/types/game";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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
    .select("host_id, status")
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

  await startNewRoundLogic(supabase, gameId);

  return { success: true };
}

export async function forceStartGame(gameId: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("User must be authenticated");

  // Only allow in E2E/Dev mode
  if (
    process.env.NEXT_PUBLIC_IS_E2E !== "true" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error("Action not allowed");
  }

  try {
    await startNewRoundLogic(supabase, gameId);
    return { success: true };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw new Error(`Failed to force start game: ${error.message}`);
  }
}

export async function debugRegenerateRound(roundId: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("User must be authenticated");

  // Only allow in E2E/Dev mode
  if (
    process.env.NEXT_PUBLIC_IS_E2E !== "true" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error("Action not allowed");
  }

  // Verify host ownership via the round -> game relationship
  const { data: round, error: roundError } = await supabase
    .from("rounds")
    .select("game_id, games!inner(host_id)")
    .eq("id", roundId)
    .single();

  if (roundError || !round) throw new Error("Round not found");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((round.games as any).host_id !== user.id) {
    throw new Error("Only the host can regenerate the round");
  }

  try {
    const constraints = await generateSolvableConstraints();

    const { error: updateError } = await supabase
      .from("rounds")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update({ constraints: constraints as any })
      .eq("id", roundId);

    if (updateError) {
      throw new Error(`Failed to update round: ${updateError.message}`);
    }

    return { success: true };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw new Error(`Failed to regenerate round: ${error.message}`);
  }
}

async function generateSolvableConstraints() {
  // 1. Load Dictionary (Cached in memory)
  const dictionary = await getServerDictionary();
  const dictionarySet = new Set(dictionary.map((w) => normalizeString(w)));
  const dictionaryCheck = (w: string) => dictionarySet.has(w);

  // 2. Fetch Themes
  const themes = await getServerThemes();

  // 3. Generate Valid Constraints (Loop)
  let constraints: RoundConstraints | undefined;
  let attempts = 0;
  const MAX_ATTEMPTS = 50;
  let validFound = false;

  while (attempts < MAX_ATTEMPTS) {
    constraints = generateRoundConstraints(themes);
    const currentConstraints = constraints;

    // Prepare Theme Check
    let themeCheck: ((w: string) => boolean) | undefined;
    if (currentConstraints.theme && currentConstraints.theme !== "Général") {
      const slug = slugify(currentConstraints.theme);
      const filter = await getServerThemeFilter(slug);
      if (filter) {
        themeCheck = (w: string) => filter.has(normalizeString(w));
      }
    }

    // Check if at least one word exists
    const hasSolution = dictionary.some((word) => {
      // validateWord normalizes internaly, and calls dictionaryCheck with normalized word
      // dictionaryCheck checks against normalized set.
      return validateWord(word, currentConstraints, dictionaryCheck, themeCheck)
        .isValid;
    });

    if (hasSolution) {
      validFound = true;
      break;
    }
    attempts++;
  }

  if (!validFound) {
    throw new Error(
      "Failed to generate a solvable round after multiple attempts.",
    );
  }

  return constraints;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function startNewRoundLogic(supabase: any, gameId: string) {
  const constraints = await generateSolvableConstraints();

  // 4. Update Game Status (if LOBBY)
  // Fetch current game status to decide
  const { data: game } = await supabase
    .from("games")
    .select("status")
    .eq("id", gameId)
    .single();

  if (game?.status === "LOBBY") {
    await supabase
      .from("games")
      .update({ status: "PLAYING", started_at: new Date().toISOString() })
      .eq("id", gameId);
  }

  // 5. Determine Round Number
  const { data: rounds } = await supabase
    .from("rounds")
    .select("round_number")
    .eq("game_id", gameId)
    .order("round_number", { ascending: false })
    .limit(1);

  const nextRoundNumber = (rounds?.[0]?.round_number || 0) + 1;

  // 6. Insert Round
  const { error: insertError } = await supabase.from("rounds").insert({
    game_id: gameId,
    round_number: nextRoundNumber,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constraints: constraints as any,
    status: "PLAYING",
  });

  if (insertError)
    throw new Error(`Failed to create round: ${insertError.message}`);
}
