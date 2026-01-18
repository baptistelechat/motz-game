# Story 1.4: Gestion Profil (Pseudo & Avatar)

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a joueur identifié (anonymement),
I want choisir un pseudo et un avatar,
so that me différencier des autres joueurs dans le lobby.

## Acceptance Criteria

1. **Given** un joueur authentifié anonymement
   **When** il accède à l'application pour la première fois
   **Then** un pseudo aléatoire "Animal Adjectif" (ex: "Renard Rapide") lui est suggéré
   **And** un avatar par défaut est sélectionné

2. **Given** un joueur sur le formulaire de profil
   **When** il modifie son pseudo
   **Then** le pseudo est validé (3-15 caractères, alphanumérique)

3. **Given** un joueur satisfaisant
   **When** il valide son profil
   **Then** une entrée est créée/mise à jour dans la table `public.players` de Supabase
   **And** la table `players` contient : `id` (FK auth.users), `pseudo`, `avatar_config`, `last_seen`
   **And** une politique RLS assure qu'il ne peut modifier que sa propre ligne

4. **Given** un joueur revenant sur le site
   **When** il est authentifié
   **Then** son profil (pseudo/avatar) est récupéré automatiquement depuis Supabase

## Tâches / Sous-tâches

- [x] Database & RLS (AC: 3)
  - [x] Créer la migration SQL pour la table `public.players`.
    - Columns: `id` (uuid, PK, references auth.users), `pseudo` (text), `avatar_config` (jsonb), `last_seen` (timestamptz).
  - [x] Activer RLS sur `public.players`.
  - [x] Créer les policies :
    - `SELECT`: Public (tout le monde peut voir les profils des autres joueurs). `true`
    - `INSERT/UPDATE`: Authenticated users only for their own `id`. `auth.uid() = id` with `check (auth.uid() = id)`

- [x] Zod Schema & Types (AC: 2)
  - [x] Créer `src/lib/schemas/player-schema.ts`.
  - [x] Définir `playerProfileSchema`:
    - `pseudo`: min 3, max 15, regex `^[a-zA-Z0-9_-]+$` (Alphanum + Tiret + Underscore).
      - _Note UX :_ Si l'utilisateur tape un espace, le remplacer dynamiquement par `_` ou `-`.
    - `avatar_config`: Object `{ animal: string, color: string }`.
      - _Note :_ `color` correspond à la couleur de fond du cadre de l'avatar (ex: palette Pixel-Pop #39FF14, #FF00FF, etc.).
  - [x] Générer les types TypeScript associés.

- [x] Logic & Hooks (AC: 1, 3, 4)
  - [x] Créer `src/lib/utils/random-pseudo.ts` pour générer "Animal + Adjectif" (liste en dur pour l'instant).
  - [x] Créer `src/hooks/use-player-profile.ts`.
  - [x] Utiliser `useAnonymousAuth` (Story 1.3) ou `supabase.auth.getUser()` pour récupérer l'ID courant.
  - [x] Implémenter `fetchProfile` (SELECT) et `updateProfile` (UPSERT).
  - [x] Gérer l'état de chargement et les erreurs.

- [x] UI Components (AC: 1, 2)
  - [x] Créer `src/components/profile/profile-form.tsx`.
  - [x] Intégrer Shadcn `Input` (style Pixel-Pop).
  - [x] Créer un sélecteur d'avatar simple (Grille d'icônes ou Randomizer).
  - [x] Bouton "Valider" (style Pixel-Pop).

- [x] Intégration (AC: 4)
  - [x] Ajouter la vérification du profil dans `src/app/page.tsx` (ou Layout).
  - [x] Si pas de profil -> **Création silencieuse** : Générer Pseudo + Avatar aléatoires et sauvegarder en DB immédiatement.
  - [x] Afficher "Bonjour [Pseudo]" dans le header/UI.
  - [x] Ajouter un bouton d'accès au profil pour permettre la modification (Formulaire d'édition).

- [x] Tests
  - [x] Test unitaire du générateur de pseudo.
  - [x] Test d'intégration du hook `usePlayerProfile` (mock Supabase).

## Notes de développement

- **Architecture DB :** La table `players` est séparée de `auth.users`. `auth.users` gère l'auth technique (Supabase), `public.players` gère les données métier. C'est une bonne pratique Supabase.
- **Avatar Config :** Pour l'instant, stocker un JSON simple `{ "id": "fox", "color": "orange" }` ou juste une string ID `"fox"`. Prévoir l'extensibilité.
- **Pixel Art Icons :** Utiliser une librairie comme `@nsmr/pixelart-react` ou des SVGs locaux pour les avatars 8-bit.
- **Random Pseudo :** Utiliser deux tableaux simples : `ANIMALS` et `ADJECTIVES`.

### Technical Stack & Versions

- **Supabase :** Utiliser les types générés (`Database` interface).
- **Zod :** Validation stricte côté client avant envoi.
- **Shadcn/UI :** Utiliser `Form`, `FormControl`, `FormField` pour la gestion du formulaire avec `react-hook-form`.

### Références

- [Architecture: Data Architecture](file:///c:\Users\ASUS\Desktop\DEV\Projet_perso\motz-game_bmad-output\planning-artifacts\architecture.md#L131)
- [UX Spec: Instant Join](file:///c:\Users\ASUS\Desktop\DEV\Projet_perso\motz-game_bmad-output\planning-artifacts\ux-design-specification.md#L232)
- [Supabase Auth & RLS](https://supabase.com/docs/guides/auth/row-level-security)
