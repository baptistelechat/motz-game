"use server";

import { MAX_ROUNDS, ROUND_DURATION_MS } from "@/lib/game/constants";
import { generateRoundConstraints } from "@/lib/game/constraint-generation";
import { calculateWordScore } from "@/lib/game/scoring";
import { THEMES } from "@/lib/game/themes";
import { validateWordServer } from "@/lib/game/validation-server";
import { submitWordSchema } from "@/lib/schemas/submission-schema";
import { createClient } from "@/lib/supabase/server";
import { Database, Json } from "@/types/database.types";
import { RoundConstraints } from "@/types/game";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import filter from "leo-profanity";
import { customAlphabet } from "nanoid";
import { redirect } from "next/navigation";
import { z } from "zod";

// Initialize profanity filter
filter.loadDictionary("fr");

const generateGameCode = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  6,
);

interface ReputationStatus {
  allowed: boolean;
  remainingMinutes?: number;
}

async function checkPlayerReputation(
  userId: string,
): Promise<ReputationStatus> {
  const adminClient = createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { count } = await adminClient
    .from("kick_sessions")
    .select("*", { count: "exact", head: true })
    .eq("target_id", userId)
    .eq("status", "completed")
    .gte("created_at", sevenDaysAgo.toISOString());

  // Increase ban threshold to > 5 kicks (was 3)
  if (count && count > 5) {
    // Check time of last kick
    const { data: lastKick } = await adminClient
      .from("kick_sessions")
      .select("created_at")
      .eq("target_id", userId)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (lastKick) {
      const lastKickTime = new Date(lastKick.created_at);
      const now = new Date();
      const diffMinutes =
        (now.getTime() - lastKickTime.getTime()) / (1000 * 60);

      // Keep 30 minutes cooldown
      if (diffMinutes < 30) {
        return {
          allowed: false,
          remainingMinutes: Math.ceil(30 - diffMinutes),
        };
      }
      // If cooldown passed, allow access but do NOT reset history
    }
  }

  return { allowed: true };
}

export async function getPlayersReputation(playerIds: string[]) {
  const adminClient = createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const reputations: Record<string, "normal" | "warning"> = {};

  const { data: kicks } = await adminClient
    .from("kick_sessions")
    .select("target_id")
    .in("target_id", playerIds)
    .eq("status", "completed")
    .gte("created_at", sevenDaysAgo.toISOString());

  const counts: Record<string, number> = {};
  kicks?.forEach((k) => {
    counts[k.target_id] = (counts[k.target_id] || 0) + 1;
  });

  playerIds.forEach((id) => {
    // Lower warning threshold to > 2 (was 3) so warnings appear before ban
    reputations[id] = (counts[id] || 0) > 2 ? "warning" : "normal";
  });

  return reputations;
}

export async function createGame() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Vous devez être connecté pour créer une partie.");
  }

  // Check reputation
  const reputation = await checkPlayerReputation(user.id);
  if (!reputation.allowed) {
    throw new Error(
      `Vous êtes temporairement suspendu. Réessayez dans ${reputation.remainingMinutes} minute(s).`,
    );
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

  // Check reputation
  const reputation = await checkPlayerReputation(user.id);
  if (!reputation.allowed) {
    throw new Error(
      `Vous êtes temporairement suspendu. Réessayez dans ${reputation.remainingMinutes} minute(s).`,
    );
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

  // Check if kicked from this game
  const adminClient = createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: kickRecord } = await adminClient
    .from("kick_sessions")
    .select("id")
    .eq("game_id", game.id)
    .eq("target_id", user.id)
    .eq("status", "completed")
    .limit(1)
    .maybeSingle();

  if (kickRecord) {
    throw new Error("Vous avez été exclu de cette partie.");
  }

  // Check if already joined
  const { data: existing } = await supabase
    .from("game_players")
    .select("player_id")
    .eq("game_id", game.id)
    .eq("player_id", user.id)
    .single();

  if (!existing && game.status !== "LOBBY") {
    throw new Error("La partie a déjà commencé ou est terminée.");
  }

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
  const { data: rounds } = await supabase
    .from("rounds")
    .select("round_number")
    .eq("game_id", gameId)
    .order("round_number", { ascending: false })
    .limit(1);

  console.log("Existing rounds for game", gameId, ":", rounds);

  const nextRoundNumber = (rounds?.[0]?.round_number || 0) + 1;
  console.log("Next round number:", nextRoundNumber);
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
    throw new Error(
      `Erreur lors du lancement de la manche: ${insertError.message} (${insertError.code})`,
    );
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

export async function leaveGame(gameId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("Attempted to leave game without user session");
    return;
  }

  console.log(`User ${user.id} leaving game ${gameId}`);

  // Use Admin Client to ensure deletion works regardless of RLS or status
  const adminClient = createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { error } = await adminClient
    .from("game_players")
    .delete()
    .eq("game_id", gameId)
    .eq("player_id", user.id);

  if (error) {
    console.error("Error leaving game:", error);
    throw new Error("Erreur lors de la tentative de quitter la partie");
  }

  console.log(`User ${user.id} successfully removed from game ${gameId}`);
}

export async function resetGame(gameId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Use Admin Client to bypass RLS and ensure complete cleanup
  const adminClient = createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // Verify game exists
  const { data: game } = await supabase
    .from("games")
    .select("host_id, code")
    .eq("id", gameId)
    .single();

  if (!game) {
    throw new Error("Game not found");
  }

  // 1. Delete all submissions for this game directly (using game_id)
  const { error: deleteSubmissionsError } = await adminClient
    .from("submissions")
    .delete()
    .eq("game_id", gameId);

  if (deleteSubmissionsError) {
    console.error("Error deleting submissions:", deleteSubmissionsError);
    throw new Error("Failed to reset game submissions");
  }

  // 2. Delete rounds
  const { error: deleteError } = await adminClient
    .from("rounds")
    .delete()
    .eq("game_id", gameId);

  if (deleteError) {
    console.error("Error deleting rounds:", deleteError);
    throw new Error("Failed to reset game rounds");
  }

  // 3. Reset players status
  const { error: playersError } = await adminClient
    .from("game_players")
    .update({ is_ready: false })
    .eq("game_id", gameId);

  if (playersError) {
    console.error("Error resetting players:", playersError);
    throw new Error("Failed to reset players");
  }

  // 4. Update game status
  const { error: updateError } = await adminClient
    .from("games")
    .update({ status: "LOBBY" })
    .eq("id", gameId);

  if (updateError) throw updateError;
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

  // 3.1 Check for profanity
  if (filter.check(word)) {
    return {
      success: false,
      message: "Mot inapproprié",
      validationError: "PROFANITY_DETECTED",
    };
  }

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

  if (nextRoundNumber > MAX_ROUNDS) {
    const { error: updateGameError } = await supabase
      .from("games")
      .update({ status: "FINISHED" })
      .eq("id", round.game_id);

    if (updateGameError) throw updateGameError;
    return;
  }

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

// --- Vote Kick System ---

export async function initiateVoteKick(gameId: string, targetId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Vous devez être connecté.");

  // 1. Check if vote already active
  const { data: existingSession } = await supabase
    .from("kick_sessions")
    .select("id")
    .eq("game_id", gameId)
    .eq("target_id", targetId)
    .eq("status", "active")
    .single();

  if (existingSession) {
    throw new Error("Un vote est déjà en cours contre ce joueur.");
  }

  // 2. Create kick session
  // Expires in 2 minutes
  const expiresAt = new Date(Date.now() + 2 * 60 * 1000).toISOString();

  const { data: session, error } = await supabase
    .from("kick_sessions")
    .insert({
      game_id: gameId,
      target_id: targetId,
      initiator_id: user.id,
      status: "active",
      expires_at: expiresAt,
    })
    .select()
    .single();

  if (error) {
    console.error("Error initiating vote kick:", error);
    throw new Error("Impossible de lancer le vote.");
  }

  // 3. Auto-cast YES vote for initiator
  await castVote(session.id, true);

  return session;
}

export async function castVote(sessionId: string, vote: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Vous devez être connecté.");

  // 1. Validate session
  const { data: session } = await supabase
    .from("kick_sessions")
    .select("*, games!inner(id)")
    .eq("id", sessionId)
    .single();

  if (!session) throw new Error("Session de vote introuvable.");

  if (session.status !== "active") {
    throw new Error("Ce vote est terminé.");
  }

  if (new Date(session.expires_at) < new Date()) {
    // Expire it lazily using adminClient to bypass RLS
    const adminClient = createSupabaseClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    await adminClient
      .from("kick_sessions")
      .update({ status: "expired" })
      .eq("id", sessionId);
    throw new Error("Ce vote a expiré.");
  }

  // 1.5 Check if voter is target
  if (user.id === session.target_id) {
    throw new Error("La cible ne peut pas voter.");
  }

  // 2. Record vote
  const { error: voteError } = await supabase.from("kick_votes").upsert({
    session_id: sessionId,
    voter_id: user.id,
    vote: vote,
  });

  if (voteError) {
    console.error("Error casting vote:", voteError);
    throw new Error("Erreur lors du vote.");
  }

  // 3. Check for majority
  // Count YES votes
  const { count: yesVotes } = await supabase
    .from("kick_votes")
    .select("*", { count: "exact", head: true })
    .eq("session_id", sessionId)
    .eq("vote", true);

  // Count TOTAL votes
  const { count: totalVotes } = await supabase
    .from("kick_votes")
    .select("*", { count: "exact", head: true })
    .eq("session_id", sessionId);

  // Count Total Players in Game
  const { count: totalPlayers } = await supabase
    .from("game_players")
    .select("*", { count: "exact", head: true })
    .eq("game_id", session.game_id);

  if (yesVotes !== null && totalPlayers !== null && totalVotes !== null) {
    // Majority > 50%
    const majority = Math.floor(totalPlayers / 2) + 1;

    if (yesVotes >= majority) {
      await executeKick(session.game_id, session.target_id, session.id);
    } else {
      // Check if all eligible voters have voted (everyone except target)
      // If target CANNOT vote, eligible = totalPlayers - 1.
      // If target CAN vote, eligible = totalPlayers.
      // Based on UI, target is excluded.
      const eligibleVoters = totalPlayers - 1;

      if (totalVotes >= eligibleVoters) {
        // Vote failed - Close session
        const adminClient = createSupabaseClient<Database>(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
        );

        await adminClient
          .from("kick_sessions")
          .update({ status: "rejected" })
          .eq("id", sessionId);
      }
    }
  }
}

async function executeKick(
  gameId: string,
  targetId: string,
  sessionId: string,
) {
  const supabase = await createClient();
  const adminClient = createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // 1. Create Report (System report or attributed to initiator?)
  // Let's attribute to initiator for now, or system.
  // We need initiator_id from session.
  const { data: session } = await supabase
    .from("kick_sessions")
    .select("initiator_id")
    .eq("id", sessionId)
    .single();

  if (session) {
    await adminClient.from("player_reports").insert({
      game_id: gameId,
      reported_id: targetId,
      reporter_id: session.initiator_id,
      reason: "toxic", // Default reason for vote kick
    });
  }

  // 2. Close session FIRST to avoid race conditions or reopening
  await adminClient
    .from("kick_sessions")
    .update({ status: "completed" })
    .eq("id", sessionId);

  // 3. Remove player from game
  await adminClient
    .from("game_players")
    .delete()
    .eq("game_id", gameId)
    .eq("player_id", targetId);

  // 4. Check if game empty or only 1 player left?
  // If < 2 players, maybe end game?
  const { count: remaining } = await adminClient
    .from("game_players")
    .select("*", { count: "exact", head: true })
    .eq("game_id", gameId);

  if (remaining !== null && remaining < 2) {
    await adminClient
      .from("games")
      .update({ status: "FINISHED" })
      .eq("id", gameId);
  }
}

const reportWordSchema = z.object({
  gameId: z.string().uuid(),
  roundId: z.string().uuid(),
  word: z.string().min(1),
  reason: z.string().optional().default("offensive"),
});

export async function reportWord(
  gameId: string,
  roundId: string,
  word: string,
  reason: string = "offensive",
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const result = reportWordSchema.safeParse({
    gameId,
    roundId,
    word,
    reason,
  });

  if (!result.success) {
    throw new Error("Invalid input");
  }

  const { error } = await supabase.from("word_reports").insert({
    game_id: gameId,
    round_id: roundId,
    reporter_id: user.id,
    reported_word: word,
    reason: reason,
  });

  if (error) {
    console.error("Error reporting word:", error);
    throw new Error("Failed to report word");
  }

  return { success: true };
}
