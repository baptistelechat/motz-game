"use server";

import { ROUND_DURATION_MS } from "@/lib/game/constants";
import { generateRoundConstraints } from "@/lib/game/constraint-generation";
import { calculateWordScore } from "@/lib/game/scoring";
import { THEMES } from "@/lib/game/themes";
import { validateWordServer } from "@/lib/game/validation-server";
import { submitWordSchema } from "@/lib/schemas/submission-schema";
import { createClient } from "@/lib/supabase/server";
import { Database, Json } from "@/types/database.types";
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

  // 1. Start first round (Create round BEFORE updating status)
  // RPC was removed, logic moved to TS as per memory/migration
  const { data: rounds } = await supabase
    .from("rounds")
    .select("round_number")
    .eq("game_id", gameId)
    .order("round_number", { ascending: false })
    .limit(1);

  const nextRoundNumber = (rounds?.[0]?.round_number || 0) + 1;
  const constraints = generateRoundConstraints(THEMES.map((t) => t.label));
  const endsAt = new Date(Date.now() + ROUND_DURATION_MS).toISOString();

  const { error: insertError } = await supabase.from("rounds").insert({
    game_id: gameId,
    round_number: nextRoundNumber,
    constraints: constraints as unknown as Json,
    status: "PLAYING",
    ends_at: endsAt,
  });

  if (insertError) {
    console.error("Error creating round:", insertError);
    throw new Error("Erreur lors du lancement de la manche.");
  }

  // 2. Update status
  const { error: updateError } = await supabase
    .from("games")
    .update({ status: "PLAYING", started_at: new Date().toISOString() })
    .eq("id", gameId);

  if (updateError) throw updateError;
}

export async function debugRegenerateRound(roundId: string) {
  const supabase = await createClient();

  // 0. Verify permissions (Host only)
  // Retrieve the game associated with the round to check the host
  const { data: round } = await supabase
    .from("rounds")
    .select("game_id, games!inner(host_id)")
    .eq("id", roundId)
    .single();

  if (!round) throw new Error("Round not found");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (round.games.host_id !== user?.id) {
    throw new Error("Seul l'hôte peut réinitialiser la manche.");
  }

  // 1. Delete all submissions for this round (Reset)
  const { error: deleteError } = await supabase
    .from("submissions")
    .delete()
    .eq("round_id", roundId);

  if (deleteError) {
    console.error("Error deleting submissions:", deleteError);
    throw new Error("Impossible de réinitialiser les soumissions");
  }

  // 2. Regenerate constraints
  // RPC was removed, logic moved to TS
  const constraints = generateRoundConstraints(THEMES.map((t) => t.label));

  const { error } = await supabase
    .from("rounds")
    .update({ constraints: constraints as unknown as Json })
    .eq("id", roundId);

  if (error) throw error;
}

export async function getServerTime() {
  return Date.now();
}

export async function debugForceThemeConstraint(roundId: string) {
  const supabase = await createClient();

  // 0. Verify permissions (Host only)
  const { data: round } = await supabase
    .from("rounds")
    .select("game_id, games!inner(host_id)")
    .eq("id", roundId)
    .single();

  if (!round) throw new Error("Round not found");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (round.games.host_id !== user?.id) {
    throw new Error("Seul l'hôte peut forcer le thème.");
  }

  // 1. Delete all submissions for this round (Reset)
  const { error: deleteError } = await supabase
    .from("submissions")
    .delete()
    .eq("round_id", roundId);

  if (deleteError) {
    console.error("Error deleting submissions:", deleteError);
    throw new Error("Impossible de réinitialiser les soumissions");
  }

  // 2. Generate Theme Constraints
  // Helper to get random char (duplicate logic but simple enough)
  const getRandomChar = () =>
    String.fromCharCode(65 + Math.floor(Math.random() * 26));
  const imposed_letter = getRandomChar();
  let forbidden_letter = getRandomChar();
  while (forbidden_letter === imposed_letter) {
    forbidden_letter = getRandomChar();
  }

  const themeLabel =
    THEMES[Math.floor(Math.random() * THEMES.length)]?.label || "Général";

  const constraints: RoundConstraints = {
    imposed_letter,
    forbidden_letter,
    constraint_card: {
      type: "theme",
    },
    theme: themeLabel,
  };

  const { error } = await supabase
    .from("rounds")
    .update({ constraints: constraints as unknown as Json })
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
    success: validation.isValid,
    message: validation.isValid
      ? undefined
      : validation.error || "Mot invalide",
    submission: submissionData,
    validationError: validation.isValid ? undefined : validation.error,
  };
}

export async function finishRound(roundId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Verify host
  const { data: round } = await supabase
    .from("rounds")
    .select("game_id, constraints, games!inner(host_id)")
    .eq("id", roundId)
    .single();

  if (!round || round.games.host_id !== user.id) {
    throw new Error("Only host can finish round");
  }

  const constraints = round.constraints as unknown as RoundConstraints;
  // constraints is an object, not an array. Check the 'theme' property.
  const hasTheme = !!constraints.theme;

  // Check if there are any submissions
  const { count } = await supabase
    .from("submissions")
    .select("*", { count: "exact", head: true })
    .eq("round_id", roundId);

  const hasSubmissions = count !== null && count > 0;

  // Explicitly cast the status string to match the enum type if needed
  const nextStatus = hasTheme && hasSubmissions ? "VALIDATING" : "COMPLETED";

  const { error } = await supabase
    .from("rounds")
    .update({
      status: nextStatus as Database["public"]["Enums"]["round_status"],
    })
    .eq("id", roundId);

  if (error) throw error;
}

export async function toggleVote(submissionId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase.rpc("toggle_vote", {
    p_submission_id: submissionId,
  });

  if (error) throw error;
}

export async function finalizeValidation(roundId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Verify host
  const { data: round } = await supabase
    .from("rounds")
    .select("game_id, constraints, games!inner(host_id)")
    .eq("id", roundId)
    .single();

  if (!round || round.games.host_id !== user.id) {
    throw new Error("Only host can finalize validation");
  }

  // Fetch submissions first to determine active players
  const { data: submissions } = await supabase
    .from("submissions")
    .select("*")
    .eq("round_id", roundId);

  // Calculate threshold based on ACTIVE players (submitters + voters)
  // This avoids "ghost" players inflating the count
  const activePlayers = new Set<string>();

  submissions?.forEach((sub) => {
    // Add submitter
    activePlayers.add(sub.player_id);
    // Add voters
    if (sub.votes && Array.isArray(sub.votes)) {
      sub.votes.forEach((voterId: string) => activePlayers.add(voterId));
    }
  });

  const activeCount = Math.max(activePlayers.size, 1);
  const threshold = Math.ceil(activeCount / 2);

  if (submissions) {
    for (const sub of submissions) {
      if ((sub.votes?.length || 0) >= threshold) {
        await supabase
          .from("submissions")
          .update({
            is_valid: false,
            score: 0,
            rejection_reason: "social_consensus",
          })
          .eq("id", sub.id);
      }
    }
  }

  // --- RECALCUL DES BONUS DE VITESSE ---
  // On récupère toutes les soumissions valides triées par ordre de soumission (created_at)
  const { data: validSubmissions } = await supabase
    .from("submissions")
    .select("*")
    .eq("round_id", roundId)
    .eq("is_valid", true)
    .order("created_at", { ascending: true });

  if (validSubmissions && validSubmissions.length > 0) {
    for (let i = 0; i < validSubmissions.length; i++) {
      const sub = validSubmissions[i];
      const newRank = i + 1;

      // Calcul du nouveau bonus de vitesse
      let newSpeedBonus = 0;
      if (newRank === 1) newSpeedBonus = 10;
      else if (newRank === 2) newSpeedBonus = 8;
      else if (newRank === 3) newSpeedBonus = 5;
      else if (newRank === 4) newSpeedBonus = 3;
      else if (newRank === 5) newSpeedBonus = 1;

      // Récupération du score de base (mot) depuis points_details ou recalcul si nécessaire
      // On suppose que points_details.word_score est correct.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const details = sub.points_details as any;
      const wordScore = details?.word_score || 0;

      const newTotalScore = wordScore + newSpeedBonus;

      // Mise à jour des points_details avec le nouveau rang et bonus
      const newDetails = {
        ...details,
        rank: newRank,
        speed_bonus: newSpeedBonus,
        total_score: newTotalScore,
      };

      // Update DB
      await supabase
        .from("submissions")
        .update({
          score: newTotalScore,
          points_details: newDetails,
        })
        .eq("id", sub.id);
    }
  }

  const { error } = await supabase
    .from("rounds")
    .update({ status: "COMPLETED" })
    .eq("id", roundId);

  if (error) throw error;
}

export async function startNextRound(currentRoundId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Verify host and get gameId
  const { data: round } = await supabase
    .from("rounds")
    .select("game_id, round_number, games!inner(host_id)")
    .eq("id", currentRoundId)
    .single();

  if (!round || round.games.host_id !== user.id) {
    throw new Error("Only host can start next round");
  }

  // Generate new constraints
  const nextRoundNumber = round.round_number + 1;
  const constraints = generateRoundConstraints(THEMES.map((t) => t.label));
  const endsAt = new Date(Date.now() + ROUND_DURATION_MS).toISOString();

  const { error } = await supabase.from("rounds").insert({
    game_id: round.game_id,
    round_number: nextRoundNumber,
    constraints: constraints as unknown as Json,
    status: "PLAYING",
    ends_at: endsAt,
  });

  if (error) throw error;
}
