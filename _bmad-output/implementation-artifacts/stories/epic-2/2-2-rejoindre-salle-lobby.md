# Story 2.2: Rejoindre une Salle (Lobby Realtime)

Status: completed

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a joueur invité,
I want rejoindre une salle via son code ou son lien et voir les autres arriver,
So that confirmer que je suis au bon endroit avant que la partie commence.

## Acceptance Criteria

1. **Given** un joueur avec un lien de partage ou un code valide
   **When** il accède à l'URL `/room/[code]`
   **Then** l'application vérifie si la salle existe et est en statut 'LOBBY'
   **And** si valide, une entrée est créée dans la table de liaison `game_players` (`game_id`, `player_id`)
   **And** la liste des joueurs présents s'affiche et se met à jour en temps réel (Supabase Realtime `INSERT`/`DELETE` sur `game_players`)
   **And** une animation "Pop" (UX9) se joue à l'arrivée de chaque nouvel avatar
   **And** si la salle n'existe pas ou est déjà lancée, un message d'erreur explicite est affiché

## Tasks / Subtasks

- [x] Database Schema & RLS
  - [x] Créer la table `public.game_players`.
    - Columns: `game_id` (uuid, ref games.id), `player_id` (uuid, ref players.id), `is_ready` (boolean, default false), `joined_at` (timestamptz, default now()).
    - Primary Key: (`game_id`, `player_id`).
  - [x] Activer RLS.
  - [x] Policies:
    - `SELECT`: Public (ou Authenticated) - Permettre de voir les joueurs du lobby.
    - `INSERT`: Authenticated users (`auth.uid() = player_id`). Self-join only.
    - `UPDATE`: Authenticated users (`auth.uid() = player_id`). Self-update only (pour le statut Prêt).
    - `DELETE`: Authenticated users (`auth.uid() = player_id`). Self-leave only.

- [x] Server Action & Logic
  - [x] Modifier/Étendre `src/app/actions/game-actions.ts` :
    - `joinGame(code: string)` :
      - Récupère le `game_id` depuis le code.
      - Vérifie le statut 'LOBBY'.
      - Vérifie si le joueur est déjà dedans.
      - Si non, `INSERT` dans `game_players`.
      - Retourne le `game_id` ou une erreur.

- [x] UI Implementation
  - [x] Modifier `src/app/room/[code]/page.tsx` :
    - Ajouter la logique de "Join" automatique (ou via bouton "Rejoindre" si UX préférée, mais AC suggère automatique à l'accès).
    - _Note UX_: Si le joueur n'a pas de profil (Story 1.4), il doit probablement être redirigé ou invité à en créer un. (Assumons ici qu'il a une identité anonyme).
  - [x] Créer `src/components/game/lobby-player-list.tsx` :
    - Affiche la grille des avatars.
    - Utilise `useRealtimeLobby` (à créer).
  - [x] Créer `src/hooks/use-realtime-lobby.ts` :
    - Subscribe au channel `game_players:game_id={id}`.
    - Écoute `INSERT`, `DELETE`, `UPDATE`.
    - Met à jour le state local (Zustand ou local state).
  - [x] Animation "Pop" :
    - Ajouter une animation CSS/Framer Motion sur l'apparition d'un nouvel avatar dans la liste.

## Dev Notes

### Architecture Patterns

- **Realtime Subscription** : Le client écoute les changements DB pour mettre à jour l'UI sans recharger.
- **Join Logic** : Peut être faite côté serveur (Server Action) lors du chargement de la page, ou via un `useEffect` côté client qui appelle l'action. _Préférence_: Server Action invoquée par le client pour feedback immédiat, ou Server Component si on veut bloquer l'accès.
  - _Considération_: Si on fait le join dans le Server Component, attention aux doubles insertions en mode Dev (Strict Mode). Le `INSERT ON CONFLICT DO NOTHING` est utile.

### Libraries

- `supabase-js`: Pour le client Realtime.
- `framer-motion` (ou `tailwindcss-animate`) : Pour l'animation "Pop".

### References

- [Story 2.2 Source](file:///c:\Users\ASUS\Desktop\DEV\Projet_perso\motz-game_bmad-output\planning-artifacts\epics.md#L217)
- [Architecture: Data Architecture](file:///c:\Users\ASUS\Desktop\DEV\Projet_perso\motz-game_bmad-output\planning-artifacts\architecture.md#L131)
