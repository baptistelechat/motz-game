# Story 2.1: Création de Salle (Room) & Routage

Status: completed

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a joueur hôte,
I want créer une nouvelle salle de jeu privée avec un code sécurisé,
so that pouvoir inviter mes amis sans que des inconnus ne devinent le code.

## Acceptance Criteria

1. **Given** un joueur authentifié (anonymement) sur la page d'accueil
   **When** il clique sur "Créer une partie"
   **Then** une nouvelle entrée est créée dans la table `public.games` avec un `status` = 'LOBBY'
   **And** un `code` unique et non-prédictible est généré (ex: 6 caractères alphanumériques `A7x9P2`)
   **And** le joueur est défini comme `host_id` de la partie
   **And** le joueur est redirigé vers `/room/[code]`

2. **Given** le joueur redirigé sur la page de room
   **When** la page se charge
   **Then** le code de la salle est affiché clairement
   **And** un QR Code est généré (via `react-qr-code`) pour faciliter le partage mobile
   **And** un bouton "Copier le lien" est disponible

3. **Given** la base de données
   **When** la table `games` est créée
   **Then** elle contient les champs : `id` (UUID), `code` (Text, Unique, Index), `host_id` (UUID), `status` (Enum), `created_at`
   **And** RLS est activé (Lecture publique si on a le code? ou Auth. Insert Auth. Update Host only).

## Tasks / Subtasks

- [x] Database Schema & RLS
  - [x] Créer l'enum `game_status` ('LOBBY', 'PLAYING', 'FINISHED').
  - [x] Créer la table `public.games`.
    - Columns: `id` (uuid, default gen_random_uuid()), `code` (text, unique), `host_id` (uuid, ref auth.users), `status` (game_status, default 'LOBBY'), `created_at`, `updated_at`.
  - [x] Activer RLS.
  - [x] Policies:
    - `INSERT`: Authenticated users (`auth.uid() = host_id`).
    - `SELECT`: Public (Permettre de rejoindre si on a le code). _Note: On pourrait restreindre, mais pour l'instant Public simplifie le "Rejoindre"._
    - `UPDATE`: Host only (`auth.uid() = host_id`).

- [x] Server Action & Logic
  - [x] Installer `nanoid` (et `react-qr-code`).
  - [x] Créer `src/lib/utils/game-code.ts` : Fonction de génération de code (6 chars, alphanum, uppercase).
  - [x] Créer `src/app/actions/game-actions.ts` :
    - `createGame()` : Génère code, Insère en DB, Retourne le code.
    - Gestion d'erreur (Collision de code -> Retry).

- [x] UI Implementation
  - [x] Modifier `src/app/page.tsx` : Ajouter bouton "Créer une partie" (Call `createGame`).
  - [x] Créer la page `src/app/room/[code]/page.tsx`.
    - Server Component : Fetch game details by code.
    - 404 si code invalide.
  - [x] Créer `src/components/game/lobby-header.tsx` : Affiche le Code et le QR Code.
  - [x] Intégrer `react-qr-code`.

## Dev Notes

### Architecture Patterns

- **Server Actions** pour la mutation (Création).
- **Server Component** pour le fetch initial de la page Room (`/room/[code]`).
- **RLS** : La sécurité repose sur l'ID de l'utilisateur. `host_id` est crucial pour les permissions futures (Lancer la partie).

### Project Structure Notes

- URL: `/room/[code]` (Conforme Story).
- File: `src/app/room/[code]/page.tsx` (Nouvelle route).
- Utils: `src/lib/utils/` pour le générateur.

### Libraries

- `nanoid`: Pour générer des IDs courts (`customAlphabet`).
- `react-qr-code`: Pour l'affichage QR.

### References

- [Architecture: Data Architecture](file:///c:\Users\DM\Desktop\DEV\perso\motz-game_bmad-output\planning-artifacts\architecture.md#L131)
- [Story 2.1 Source](file:///c:\Users\DM\Desktop\DEV\perso\motz-game_bmad-output\planning-artifacts\epics.md#L200)

## Dev Agent Record

### Agent Model Used

Gemini-3-Pro-Preview

### Completion Notes List

- Implemented games table with RLS.
- Used nanoid for game code generation with retry logic in Server Action.
- Updated Home page with "Créer une partie" button using useTransition.
- Created Room page with LobbyHeader displaying Code and QR Code.
- Added unit tests for game-code utility and page components.
- Added E2E test file for game creation flow.
