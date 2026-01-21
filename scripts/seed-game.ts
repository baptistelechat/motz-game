import { generateRandomPlayer } from "@/lib/utils/generate-player";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { generateGameCode } from "../src/lib/utils/game-code";

// Charger les variables d'environnement
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "❌ Les variables d'environnement NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requises.",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function createPlayer(gameId: string) {
  // Utiliser l'API Admin pour créer un utilisateur sans restriction de rate limit
  const fakeEmail = `bot-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;

  const { data, error: userError } = await supabase.auth.admin.createUser({
    email: fakeEmail,
    email_confirm: true,
    user_metadata: { is_bot: true },
  });

  if (userError || !data.user) {
    console.error(
      "❌ Erreur lors de la création d'un joueur (Admin API):",
      userError,
    );
    return null;
  }

  const userId = data.user.id;

  // Créer le profil public
  const { error: profileError } = await supabase.from("players").insert({
    id: userId,
    ...generateRandomPlayer("Bot"),
  });

  if (profileError) {
    console.warn(
      `⚠️ Impossible de créer le profil pour ${userId}:`,
      profileError.message,
    );
  }

  // Rejoindre la partie
  const { error: joinError } = await supabase.from("game_players").insert({
    game_id: gameId,
    player_id: userId,
    is_ready: false, // Par défaut
  });

  if (joinError) {
    console.warn(
      `⚠️ Impossible de rejoindre la partie pour ${userId}:`,
      joinError.message,
    );
  }

  return data.user;
}

async function seedGame() {
  const argv = await yargs(hideBin(process.argv))
    .option("players", {
      alias: "p",
      type: "number",
      description: "Nombre de joueurs supplémentaires à ajouter",
      default: 3,
    })
    .option("code", {
      alias: "c",
      type: "string",
      description: "Code d'une partie existante à rejoindre",
    })
    .help()
    .alias("help", "h").argv;

  console.log("🌱 Initialisation de la partie...");

  let gameCode = argv.code;
  let gameId: string;
  let hostUser;

  if (!gameCode) {
    // 1. Créer un utilisateur hôte (anonyme)
    const { data: user, error: userError } =
      await supabase.auth.signInAnonymously();

    if (userError || !user.user) {
      console.error(
        "❌ Erreur lors de la création de l'utilisateur hôte:",
        userError,
      );
      return;
    }
    hostUser = user.user;
    console.log(`✅ Hôte créé: ${hostUser.id}`);

    // Créer le profil de l'hôte
    const { error: hostProfileError } = await supabase.from("players").insert({
      id: hostUser.id,
      ...generateRandomPlayer("Host"),
    });

    if (hostProfileError) {
      console.warn(
        `⚠️ Impossible de créer le profil hôte: ${hostProfileError.message}`,
      );
    }

    // 2. Créer une partie
    gameCode = generateGameCode();
    const { data: game, error: gameError } = await supabase
      .from("games")
      .insert({
        code: gameCode,
        host_id: hostUser.id,
        status: "LOBBY",
      })
      .select()
      .single();

    if (gameError) {
      console.error("❌ Erreur lors de la création de la partie:", gameError);
      return;
    }
    gameId = game.id;
    console.log(`✅ Partie créée: ${game.code} (ID: ${game.id})`);
    console.log(
      `🔑 Hôte Token: ${user.session?.access_token?.substring(0, 20)}...`,
    );

    // Ajouter l'hôte à game_players
    const { error: hostJoinError } = await supabase
      .from("game_players")
      .insert({
        game_id: gameId,
        player_id: hostUser.id,
        is_ready: false,
      });
    if (hostJoinError) {
      console.warn(
        `⚠️ L'hôte n'a pas pu rejoindre la table game_players: ${hostJoinError.message}`,
      );
    }
  } else {
    console.log(`ℹ️  Utilisation de la partie existante: ${gameCode}`);
    // Vérifier si la partie existe
    const { data: game, error: gameError } = await supabase
      .from("games")
      .select()
      .eq("code", gameCode)
      .single();

    if (gameError || !game) {
      console.error("❌ Partie non trouvée:", gameCode);
      return;
    }
    gameId = game.id;
  }

  console.log(
    `\n🔗 Lien pour rejoindre: http://localhost:3000/room/${gameCode}`,
  );

  // 3. Ajouter des joueurs supplémentaires
  if (argv.players > 0) {
    console.log(`\n👥 Ajout de ${argv.players} joueurs supplémentaires...`);
    for (let i = 0; i < argv.players; i++) {
      // Pause minimale pour éviter de spammer la console ou la DB
      if (i > 0) await delay(200);

      const player = await createPlayer(gameId);
      if (player) {
        console.log(`   🤖 Joueur ${i + 1} créé: ${player.id}`);
      }
    }
  }

  console.log("\n✅ Terminé !");
}

seedGame();
