# Story 5.3: Signalement de Mots (Feedback Loop)

**ID:** STORY-5-3
**Epic:** Epic 5 - Sécurité & Modération
**Priority:** Should Have
**Story Points:** 2

## User Story

As a joueur,
I want signaler un mot validé à tort (faux positif) ou offensant qui est passé,
So that améliorer le dictionnaire du jeu.

## Acceptance Criteria

- [ ] **Given** un mot affiché dans le récapitulatif de manche
- [ ] **When** je clique sur "Signaler" (ou icône drapeau/attention)
- [ ] **Then** un signalement est envoyé et enregistré dans la base de données (`word_reports`)
- [ ] **And** cela n'annule PAS les points de la manche en cours (pour éviter les abus anti-jeu)
- [ ] **And** le joueur reçoit une confirmation visuelle "Signalement envoyé" (Toast)
- [ ] **And** le bouton de signalement se désactive pour ce mot pour éviter le spam

## Technical Notes

### Database Schema

- Créer une table `word_reports`:
  - `id`: uuid (PK)
  - `game_id`: uuid (FK games)
  - `round_id`: uuid (FK rounds)
  - `reporter_id`: uuid (FK players - celui qui signale)
  - `reported_word`: string
  - `reason`: string (enum: 'offensive', 'not_a_word', 'other') - optionnel ou par défaut 'offensive'
  - `created_at`: timestamp

### Security (RLS)

- `INSERT`: Autorisé pour `public` (ou `anon` authentifié)
- `SELECT`: Réservé aux admins (ou service_role pour l'instant)

### Server Action

- Créer `reportWordAction(gameId, roundId, word)`
- Validation des entrées (Zod)
- Insertion en DB
- Retourner succès/erreur

### UI Implementation

- Ajouter un petit bouton/icône "Report" à côté des mots dans le composant d'affichage des résultats (`RoundResults` ou équivalent).
- Utiliser `Sonner` pour le feedback toast.

## Dependencies

- Epic 3 (Affichage des résultats)
- Epic 1 (Authentification pour `reporter_id`)

## Definition of Done

- [x] Table `word_reports` créée avec RLS (Migration file created: `20260225000000_create_word_reports.sql`)
- [x] Server Action implémentée et sécurisée
- [x] UI de signalement intégrée dans le tableau des scores/résultats
- [x] Code review passé
