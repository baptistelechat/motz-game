# Vote d'Exclusion (Vote Kick) & Réputation

**ID:** STORY-5-2
**Epic:** Epic 5: Sécurité & Modération
**Priority:** Should Have
**Story Points:** 5

## User Story

As a joueur,
I want proposer l'exclusion d'un joueur toxique et identifier les récidivistes,
So that le groupe puisse s'autoréguler et éviter les perturbateurs.

## Acceptance Criteria

- [ ] **Table `player_reports`**: Créer la table pour stocker les signalements et exclusions (reporter_id, reported_id, game_id, reason, created_at).
- [ ] **UI Vote**: Ajouter une option "Voter pour exclure" dans le menu contextuel d'un joueur (Lobby & Jeu).
- [ ] **Realtime Notification**: Lorsqu'un vote est lancé, tous les joueurs reçoivent une notification interactive (Oui/Non).
- [ ] **Logique de Majorité**: Si > 50% des joueurs présents votent "Oui", l'exclusion est validée.
- [ ] **Action d'Exclusion**: Le joueur exclu est déconnecté de la room (redirection vers accueil) et ne peut plus rejoindre cette partie.
- [ ] **Système de Réputation**: Calculer le nombre d'exclusions actives sur une période glissante de 7 jours.
- [ ] **Indicateur Visuel**: Afficher une icône d'avertissement "⚠️" à côté du pseudo dans le Lobby si le joueur a > 3 exclusions actives.
- [ ] **Droit à l'oubli**: Les exclusions de plus de 7 jours ne comptent plus dans le calcul de réputation.

## Technical Notes

### Database Schema
- Nouvelle table `player_reports`:
  - `id`: uuid (PK)
  - `game_id`: uuid (FK games)
  - `reporter_id`: uuid (FK players)
  - `reported_id`: uuid (FK players)
  - `reason`: text (enum: 'toxic', 'cheat', 'afk')
  - `created_at`: timestamptz (default: now())

### Server Actions
- `initiateVoteKick(gameId, targetId)`: Vérifie si un vote est déjà en cours, sinon crée l'état de vote.
- `castVote(gameId, targetId, vote)`: Enregistre le vote. Si majorité atteinte -> `executeKick`.
- `executeKick(gameId, targetId)`:
  - Enregistre le rapport dans `player_reports`.
  - Met à jour `game_players` (status: 'kicked' ou delete row).
  - Envoie event Realtime `player_kicked`.

### Realtime Events
- Channel `room:{gameId}`
- Event `vote_started`: payload `{ targetId, initiatorId }`
- Event `vote_update`: payload `{ yesVotes, noVotes, totalPlayers }`
- Event `player_kicked`: payload `{ targetId }` -> Client cible redirigé, autres clients mettent à jour UI.

### Reputation Logic
- Fonction SQL ou Helper TS pour compter les reports récents :
  ```sql
  select count(*) from player_reports
  where reported_id = :userId
  and created_at > now() - interval '7 days'
  ```
- Injecter ce flag dans la liste des joueurs du Lobby.

## Dependencies

- Story 1.3 (Authentification Anonyme) - Pour les IDs joueurs
- Story 2.2 (Lobby Realtime) - Pour l'interface et les événements
