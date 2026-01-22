# Story 2.3: Gestion État "Prêt" & Lancement

Status: ready-for-dev

## Story

As a joueur (et Hôte pour le lancement),
I want signaler que je suis prêt et voir quand tout le monde l'est,
So that synchroniser le début de la partie.

## Acceptance Criteria

1. **Given** plusieurs joueurs dans le lobby
   **When** un joueur clique sur le bouton "Prêt"
   **Then** son statut `is_ready` passe à `true` dans `game_players` et l'UI se met à jour pour tous (indicateur vert)
   **And** le bouton "Lancer la partie" n'est visible/actif QUE pour l'Hôte (`host_id`)
   **And** l'Hôte ne peut cliquer sur "Lancer" QUE si tous les joueurs présents sont `is_ready`
   **And** au lancement, le statut de la `games` passe à 'PLAYING', ce qui déclenche la navigation vers l'écran de jeu pour tous les connectés (via écouteur Realtime)

## Tasks / Subtasks

- [ ] Database Policies Verification
  - [ ] Vérifier/Ajouter Policy RLS sur `games` pour `UPDATE` (Host only).
    - `UPDATE`: Authenticated users where `auth.uid() = host_id`.
    - Colonnes autorisées : `status`, `started_at` uniquement?

- [ ] Server Actions & Logic
  - [ ] Créer `toggleReady(gameId: string, isReady: boolean)` dans `game-actions.ts`
    - `UPDATE` `game_players` set `is_ready = isReady` where `game_id` and `player_id`.
  - [ ] Créer `startGame(gameId: string)` dans `game-actions.ts`
    - Vérifier que l'utilisateur est `host_id` (via `games` table).
    - (Validation) Vérifier que tous les joueurs dans `game_players` sont `is_ready`.
    - `UPDATE` `games` set `status = 'PLAYING', started_at = now()`.

- [ ] UI Implementation
  - [ ] Mettre à jour `src/hooks/use-realtime-lobby.ts`
    - Ajouter une subscription sur la table `games` (row level via `game_id`).
    - Écouter les changements de `status`.
    - Retourner le `gameStatus` dans le hook.
  - [ ] Mettre à jour `src/app/room/[code]/page.tsx` (ou composant Lobby)
    - `useEffect`: Si `gameStatus === 'PLAYING'`, router.push(`/game/[code]`).
  - [ ] Créer `src/components/game/lobby-controls.tsx`
    - Props: `gameId`, `playerId`, `isHost`, `players` (pour calculer `allReady`), `isMyPlayerReady`.
    - Bouton "Je suis prêt" / "Pas prêt" (Toggle).
      - Utiliser `useTransition` pour appel server action.
    - Bouton "Lancer la partie" (Host Only).
      - Disabled si `!allPlayersReady`.
  - [ ] Mettre à jour `src/components/game/lobby-player-list.tsx`
    - Afficher l'indicateur "Prêt" sur les avatars (ex: bordure verte ou icone check).

## Dev Notes

### Architecture Patterns

- **Realtime Orchestration**:
  - Il faut DEUX subscriptions (ou une channel avec deux filters si possible, mais Supabase sépare souvent par table).
  - 1. `game_players`: pour la liste des joueurs et leur statut `is_ready`.
  - 2. `games`: pour le statut global de la partie (`PLAYING`).
- **Navigation Safety**:
  - Utiliser `replace` au lieu de `push` pour la navigation vers le jeu pour éviter que "Back" ne revienne au lobby.

### Libraries

- `lucide-react`: Icons `Check`, `X`, `Play`.
- `clsx` / `tailwind-merge`: Pour gérer conditionnellement les classes (Ready/Not Ready).

### References

- [Epics Source](file:///c:/Users/DM/Desktop/DEV/perso/motz-game/_bmad-output/planning-artifacts/epics.md)
- [UX Specs](file:///c:/Users/DM/Desktop/DEV/perso/motz-game/_bmad-output/planning-artifacts/ux-design-specification.md)

## Dev Agent Record

### Agent Model Used

Gemini-3-Pro-Preview

### Completion Notes List

- Story logic deduced from Epics and previous story context.
- Added specific checks for Host RLS and Realtime subscriptions.
