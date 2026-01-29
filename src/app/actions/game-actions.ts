"use server";

import { generateRoundConstraints } from "@/lib/game/constraint-generation";
import { calculateWordScore } from "@/lib/game/scoring";
import { validateWordServer } from "@/lib/game/validation-server";
import { submitWordSchema } from "@/lib/schemas/submission-schema";
import { createClient } from "@/lib/supabase/server";
import { RoundConstraints } from "@/types/game";
import { customAlphabet } from "nanoid";
import { redirect } from "next/navigation";
import { z } from "zod";

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

  // Create game
  const { data: game, error: gameError } = await supabase
    .from("games")
    .insert({
      code,
      host_id: user.id,
      status: "LOBBY",
    })
    .select()
    .single();

  if (gameError) {
    console.error("Error creating game:", gameError);
    throw new Error("Erreur lors de la création de la partie.");
  }

  // Add host as player
  const { error: playerError } = await supabase.from("game_players").insert({
    game_id: game.id,
    player_id: user.id,
    is_ready: false, // Host is not ready by default? Or yes? Usually explicit ready.
  });

  if (playerError) {
    console.error("Error adding host:", playerError);
    throw new Error("Erreur lors de l'ajout du joueur.");
  }

  redirect(`/room/${code}`);
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

  // Find game
  const { data: game, error: gameError } = await supabase
    .from("games")
    .select("id, status")
    .eq("code", code.toUpperCase())
    .single();

  if (gameError || !game) {
    throw new Error("Partie introuvable.");
  }

  if (game.status !== "LOBBY") {
    throw new Error("La partie a déjà commencé ou est terminée.");
  }

  // Check if already joined
  const { data: existing } = await supabase
    .from("game_players")
    .select("player_id")
    .eq("game_id", game.id)
    .eq("player_id", user.id)
    .single();

  if (!existing) {
    const { error: joinError } = await supabase.from("game_players").insert({
      game_id: game.id,
      player_id: user.id,
    });

    if (joinError) {
      console.error("Error joining game:", joinError);
      throw new Error("Impossible de rejoindre la partie.");
    }
  }

  redirect(`/room/${code.toUpperCase()}`);
}

export async function toggleReady(gameId: string, isReady: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("game_players")
    .update({ is_ready: isReady })
    .eq("game_id", gameId)
    .eq("player_id", user.id);

  if (error) throw error;

  // Revalidate is tricky with dynamic routes, usually client updates via realtime.
  // But for good measure:
  // revalidatePath(`/room/${...}`);
  // We don't have code here easily without query.
  // Realtime should handle it.
}

export async function startGame(gameId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User must be authenticated");

  // Verify host
  const { data: game } = await supabase
    .from("games")
    .select("host_id, code")
    .eq("id", gameId)
    .single();

  if (!game) {
    throw new Error("Game not found");
  }

  if (game.host_id !== user.id) {
    throw new Error("Only the host can start the game");
  }

  // Check if all players are ready
  const { count } = await supabase
    .from("game_players")
    .select("*", { count: "exact", head: true })
    .eq("game_id", gameId)
    .eq("is_ready", false);

  if (count !== null && count > 0) {
    throw new Error("Not all players are ready");
  }

  // 1. Update status
  const { error: updateError } = await supabase
    .from("games")
    .update({ status: "PLAYING", started_at: new Date().toISOString() })
    .eq("id", gameId);

  if (updateError) throw updateError;

  // 2. Start first round
  // RPC was removed, logic moved to TS as per memory/migration
  const { data: rounds } = await supabase
    .from("rounds")
    .select("round_number")
    .eq("game_id", gameId)
    .order("round_number", { ascending: false })
    .limit(1);

  const nextRoundNumber = (rounds?.[0]?.round_number || 0) + 1;
  const constraints = generateRoundConstraints();

  const { error: insertError } = await supabase.from("rounds").insert({
    game_id: gameId,
    round_number: nextRoundNumber,
    constraints: constraints as unknown as Record<string, unknown>,
    status: "PLAYING",
  });

  if (insertError) {
    console.error("Error creating round:", insertError);
    throw new Error("Erreur lors du lancement de la manche.");
  }

  redirect(`/game/${game.code}`);
}

export async function debugRegenerateRound(roundId: string) {
  const supabase = await createClient();

  // RPC was removed, logic moved to TS
  const constraints = generateRoundConstraints();

  const { error } = await supabase
    .from("rounds")
    .update({ constraints: constraints as unknown as Record<string, unknown> })
    .eq("id", roundId);

  if (error) throw error;
}

export type SubmitWordResult = {
  success: boolean;
  message?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  submission?: any;
  validationError?: string;
};

export async function submitWord(
  input: z.infer<typeof submitWordSchema>,
): Promise<SubmitWordResult> {
  const result = submitWordSchema.safeParse(input);
  if (!result.success) {
    return { success: false, message: "Données invalides" };
  }

  const { gameId, roundId, word } = result.data;
  const supabase = await createClient();

  // 1. Auth check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, message: "Non autorisé" };
  }

  // 2. Get Round Constraints
  const { data: round, error: roundError } = await supabase
    .from("rounds")
    .select("constraints, status")
    .eq("id", roundId)
    .single();

  if (roundError || !round) {
    return { success: false, message: "Manche introuvable" };
  }

  if (round.status !== "PLAYING") {
    return { success: false, message: "La manche est terminée" };
  }

  // 3. Validate Word
  const constraints = round.constraints as unknown as RoundConstraints;
  let validation;

  try {
    validation = validateWordServer(word, constraints);
  } catch (e) {
    console.error("Validation error:", e);
    return { success: false, message: "Erreur de validation serveur" };
  }

  // 4. Calculate Score
  let baseScore = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let letterDetails: any[] = [];

  if (validation.isValid) {
    const scoreData = calculateWordScore(word);
    baseScore = scoreData.word_score;
    letterDetails = scoreData.letters;
  }

  // 5. Call RPC
  const { data: submissionData, error: rpcError } = await supabase.rpc(
    "submit_word",
    {
      p_game_id: gameId,
      p_round_id: roundId,
      p_player_id: user.id,
      p_word: word,
      p_base_score: baseScore,
      p_letter_details: letterDetails,
      p_is_valid: validation.isValid,
      p_rejection_reason: validation.error || null,
    },
  );

  if (rpcError) {
    console.error("Submit word RPC error:", rpcError);
    return { success: false, message: "Erreur lors de la soumission" };
  }

  return {
    success: true,
    submission: submissionData,
    validationError: validation.isValid ? undefined : validation.error,
  };
}
