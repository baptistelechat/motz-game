# Tableau des Scores Global (Leaderboard)

**ID:** STORY-4-2
**Epic:** Epic 4: Système de Scoring & Progression
**Priority:** High
**Story Points:** 3

## User Story

As a joueur,
I want voir le classement général à tout moment,
So that savoir qui mène la partie.

## Acceptance Criteria

- [ ] **Affichage Classement**: La liste des joueurs est affichée triée par score total décroissant.
- [ ] **Accessibilité**: Le classement est affiché après chaque fin de manche - Score de la manche puis score total.
- [ ] **Temps Réel**: Les scores se mettent à jour automatiquement après chaque manche (dès que le serveur valide les résultats).
- [ ] **Animations**: Une animation souligne les changements de position (ex: un joueur passe devant un autre).
- [ ] **Indicateurs**: Affichage clair du rang (1er, 2ème, etc.) et du score total.

## Technical Notes

- **Composant UI**: Reutiliser le composant `RoundSummary` et creer une variant `Leaderboard` pour afficher le classement général en cmoplément de `Validation` et `Ranking` déjà existant.
- **State Management**: Utiliser le store Zustand existant qui contient déjà l'état du jeu et des joueurs.
- **Realtime**: S'assurer que les mises à jour `game_players` (où le score est stocké/mis à jour) sont bien écoutées et reflétées.
- **Animation**: Utiliser `framer-motion` pour les transitions de liste (layout animations).

## Dependencies

- Story 4.1: Moteur de calcul de score (Done) - Les scores sont calculés backend.
- Story 2.2: Gestion Lobby (Done) - La liste des joueurs existe déjà.

## Definition of Done

- [ ] Composant Leaderboard implémenté et intégré à l'écran de jeu
- [ ] Tests unitaires (affichage trié)
- [ ] Storybook (si utilisé) ou Preview validée
- [ ] Code review
