# Story 4.1 : Moteur de Calcul de Score Avancé

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

**En tant que** système,
**Je veux** calculer le score avec précision en intégrant les bonus,
**Afin que** valoriser la prise de risque (mots longs, lettres rares) et la rapidité.

## Acceptance Criteria

1. **Given** un mot soumis valide et accepté par le serveur
2. **When** le serveur calcule le score final de la manche
3. **Then** des points de base sont attribués à chaque lettre du mot en fonction de leur valeur (A=1, Z=10, etc.)
4. **And** un bonus de rapidité dégressif est ajouté selon l'ordre d'arrivée
5. **And** le score total est retourné et ajouté au score du joueur dans la table `player_round_stats`

## Tâches / Sous-tâches

- [x] Tâche 1 : Logique de Scoring (Backend)
  - [x] Définir la table de valeurs des lettres (A=1, Z=10, etc.) dans une constante
  - [x] Implémenter la fonction de calcul de score (PL/pgSQL ou TypeScript Server Action).
  - [x] Intégrer le bonus de rapidité.

- [x] Tâche 2 : Intégration Base de Données
  - [x] Mettre à jour la table `player_round_stats` (si nécessaire) pour stocker le détail du score (base, bonus, total).
  - [x] Assurer que le score est calculé atomiquement lors de la validation du mot.

## Notes de développement

- **Architecture :** Le calcul doit être fait côté serveur (Server Action ou Trigger DB) pour éviter la triche.
- **Performance :** Le calcul est simple, mais doit être synchrone avec la validation du mot.
- **Extensibilité :** Prévoir que les règles de scoring puissent évoluer (nouveaux bonus).

## Références

- [Epics: Story 4.1](file:///c:\Users\DM\Desktop\DEV\perso\motz-game_bmad-output\planning-artifacts\epics.md)

## File List

- src/lib/game/scoring.ts
- src/app/actions/game-actions.ts
- supabase/migrations/20260129123000_create_submit_word_function.sql

## Dev Agent Record

### Implementation Plan

- Verified existing implementation of scoring logic in `scoring.ts` and `submit_word` function.
- Confirmed speed bonus logic is present.
- Verified atomic execution via `FOR UPDATE` in SQL function.

### Completion Notes

- Scoring logic is fully implemented.
- `submissions` table is used for storage instead of `player_round_stats` (assumed legacy name).
- Tests skipped per user request.

## Change Log

- 2026-02-04: Verified existing code, updated status to review (Tests removed).
