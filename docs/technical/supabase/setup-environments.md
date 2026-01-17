# Guide de Configuration Supabase & Gestion des Environnements

Ce guide explique comment gérer la base de données Supabase pour le développement local et la production, ainsi que la manière de récupérer les configurations nécessaires.

## 1. Stratégie de Gestion des Environnements (Dev vs Prod)

Pour éviter de casser la base de données de production pendant le développement, la bonne pratique est de **créer deux projets distincts** dans Supabase :

1.  **Projet Development (`motz-game-dev`)** :
    - Utilisé pour le développement local et les tests.
    - C'est ici que vous pouvez casser des choses, tester des migrations, et ajouter des fausses données.
    - Connecté à votre environnement local via `.env.local`.

2.  **Projet Production (`motz-game-prod`)** :
    - Utilisé uniquement par l'application déployée (ex: Vercel).
    - Ne contient que des données réelles.
    - Les changements de schéma (tables, colonnes) sont appliqués ici uniquement après avoir été validés en dev.

## 2. Comment récupérer les Identifiants (URL & Keys)

Supabase met à jour son interface régulièrement. Voici comment trouver les infos selon votre version :

### Interface Actuelle (Nouveau Système)

1.  Allez dans **Settings** (⚙️) > **API**.
2.  **URL** : Regardez tout en haut de la page, section **Project URL**.
3.  **Clés** : Regardez la section **API Keys**.
    - Si vous avez des onglets, choisissez **Publishable and secret API keys**.
    - Copiez la clé **Publishable** (c'est l'équivalent de la clé `anon`).
    - _Note : La clé `Secret` correspond à l'ancien `service_role` (ne jamais utiliser côté client)._

### Méthode Alternative (Bouton "Connect")

Si vous ne trouvez pas l'URL :

1.  Regardez tout en haut à droite du dashboard.
2.  Cliquez sur le bouton vert **Connect**.
3.  Allez dans l'onglet **App Frameworks** -> **Next.js**.
4.  Supabase vous affichera directement les variables à copier :
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (ou `PUBLISHABLE_KEY`)

## 3. Activation de l'Authentification Anonyme (Important)

Pour que les utilisateurs puissent jouer sans créer de compte, vous devez activer l'authentification anonyme :

1.  Allez dans le dashboard Supabase.
2.  Cliquez sur l'icône **Authentication** (🔐) dans le menu de gauche.
3.  Allez dans la section **Providers**.
4.  Dans la liste des fournisseurs, cliquez sur **Anonymous**.
5.  Activez l'option **Enable Anonymous Sign-ins**.
6.  Cliquez sur **Save**.

### Note sur l'Avertissement de Sécurité (RLS & Captcha)

Lorsque vous activez cette option, Supabase affiche un avertissement. Voici ce qu'il signifie pour nous :

- **"Anonymous users will use the authenticated role"** : C'est le comportement attendu. Un utilisateur anonyme est considéré comme "connecté" mais sans email. Nos règles de sécurité (RLS) devront simplement autoriser le rôle `authenticated` à jouer.
- **"We highly recommend enabling captcha"** : Pour le développement et le lancement initial (MVP), **nous n'activons pas le Captcha** pour ne pas nuire à l'expérience utilisateur ("frictionless"). Nous pourrons l'activer plus tard si nous détectons des abus (bots).

Sans cette étape, l'application renverra une erreur `AuthApiError: Anonymous sign-ins are disabled`.

## 4. Configuration de l'Application

### En Local (Développement)

Créez ou modifiez le fichier `.env.local` à la racine du projet :

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=votre_url_projet_dev
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=votre_clé_anon_projet_dev
```

### En Production (Déploiement Vercel/Netlify)

Dans les paramètres de votre hébergeur (ex: Vercel > Settings > Environment Variables), ajoutez les mêmes variables mais avec les valeurs de votre **projet de Production** :

- `NEXT_PUBLIC_SUPABASE_URL` : URL du projet Prod
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` : Clé anon du projet Prod

## 4. Gestion des Données et du Schéma (Migrations)

Pour s'assurer que la base de données de production a la même structure que celle de développement, on utilise généralement les **Migrations Supabase** (via le CLI Supabase), mais pour débuter, voici l'approche simple :

1.  Faites vos modifications (ajout de tables, RLS policies) sur le projet **Dev** via l'interface Supabase (Table Editor).
2.  Une fois satisfait, reproduisez ces changements sur le projet **Prod** (manuellement ou via SQL Editor).
3.  Pour les données de test, vous pouvez utiliser des scripts de "seed" ou les ajouter manuellement en Dev.

## Résumé

| Environnement   | Fichier Config         | Projet Supabase  | Données     |
| :-------------- | :--------------------- | :--------------- | :---------- |
| **Local (Dev)** | `.env.local`           | `motz-game-dev`  | Fake / Test |
| **Production**  | Variables d'env Vercel | `motz-game-prod` | Réelles     |
