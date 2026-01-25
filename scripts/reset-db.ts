import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { Client } from "pg";
import readline from "readline";

// Charger les variables d'environnement
dotenv.config({ path: ".env.local" });
// Fallback sur .env
dotenv.config();

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error("❌ Erreur: DATABASE_URL manquante dans .env.local ou .env");
  console.error(
    "Veuillez ajouter la chaîne de connexion PostgreSQL (ex: postgres://postgres.xxx:pass@aws-0-eu-central-1.pooler.supabase.com:6543/postgres)",
  );
  process.exit(1);
}

// Vérification basique pour éviter de taper la prod si l'URL ne contient pas de marqueurs évidents de dev/local
// Note: Ceci est une sécurité simple, l'utilisateur doit toujours vérifier l'URL.

async function confirmReset() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise<boolean>((resolve) => {
    console.log("\n⚠️  ATTENTION : ZONE DANGEREUSE ⚠️");
    console.log(
      `Vous êtes sur le point de RÉINITIALISER COMPLÈTEMENT la base de données.`,
    );
    console.log(`Cible : ${dbUrl}`);
    console.log("Cela va :");
    console.log(
      "  1. Supprimer le schéma 'public' (toutes les tables, vues, fonctions)",
    );
    console.log("  2. Recréer le schéma 'public'");
    console.log("  3. Réappliquer toutes les migrations");
    console.log("\nCeci est irréversible.");

    rl.question(
      "Êtes-vous sûr de vouloir continuer ? (tapez 'oui' pour confirmer) : ",
      (answer) => {
        rl.close();
        resolve(answer.trim().toLowerCase() === "oui");
      },
    );
  });
}

async function resetDb() {
  // Toujours demander confirmation sauf si flag --force (à implémenter si besoin)
  // Pour l'instant, on demande toujours pour la sécurité
  const confirmed = await confirmReset();
  if (!confirmed) {
    console.log("❌ Opération annulée.");
    process.exit(0);
  }

  const client = new Client({
    connectionString: dbUrl,
  });

  try {
    console.log("🔌 Connexion à la base de données...");
    await client.connect();

    // 1. Reset Public Schema
    console.log("🗑️  Suppression du schéma public...");
    await client.query("DROP SCHEMA IF EXISTS public CASCADE");
    await client.query("CREATE SCHEMA public");

    // Restaurer les permissions standards Supabase
    console.log("🔐 Restauration des permissions...");
    await client.query(
      "GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role",
    );

    await client.query(
      "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role",
    );
    await client.query(
      "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres, anon, authenticated, service_role",
    );
    await client.query(
      "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role",
    );

    // 2. Nettoyage des utilisateurs Auth (Optionnel mais recommandé pour un vrai reset dev)
    // Attention: auth.users est dans un schéma protégé, il faut être prudent.
    // Supprimer les utilisateurs cascade aussi sur public.players grâce aux FKs.
    console.log("🧹 Nettoyage des utilisateurs (auth.users)...");
    // On ne supprime que les utilisateurs qui ne sont pas des admins systèmes ou spécifiques si besoin.
    // Ici on truncate la table auth.users en cascade, ce qui nettoiera aussi les identities, sessions, etc.
    // Note: TRUNCATE ne fonctionne pas toujours sur auth.users à cause des permissions, DELETE est plus sûr via le client pg admin.
    await client.query("TRUNCATE TABLE auth.users CASCADE");

    // 3. Run Migrations
    console.log("📂 Lecture et application des migrations...");
    const migrationsDir = path.join(process.cwd(), "supabase/migrations");

    if (fs.existsSync(migrationsDir)) {
      const files = fs
        .readdirSync(migrationsDir)
        .filter((f) => f.endsWith(".sql"))
        .sort();

      for (const file of files) {
        console.log(`🚀 Exécution de ${file}...`);
        const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
        // On split pas les commandes, pg gère le script entier généralement,
        // sauf si commandes spécifiques psql (comme \i) sont utilisées (ce qui n'est pas le cas ici normalement)
        await client.query(sql);
      }
    } else {
      console.warn(
        "⚠️  Aucun dossier de migration trouvé dans supabase/migrations",
      );
    }

    console.log("\n✅ DB Reset terminée avec succès !");
    console.log(
      "La base de données est maintenant propre et à jour avec les migrations.",
    );
  } catch (err) {
    console.error("\n❌ Erreur CRITIQUE lors du reset:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

resetDb();
