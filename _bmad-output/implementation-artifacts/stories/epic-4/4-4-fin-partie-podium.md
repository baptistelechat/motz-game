# Story 4.4: Fin de Partie & Podium

**As a** joueur,
**I want** une célébration claire du vainqueur à la fin de la partie,
**So that** avoir une conclusion satisfaisante au match.

## Acceptance Criteria

- **Given** la dernière manche terminée
- **When** la partie se conclut
- **Then** un écran de fin s'affiche avec le podium (1er, 2ème, 3ème) animé
- **And** des statistiques récapitulatives sont affichées (Meilleur mot, Plus rapide, etc.)
- **And** un bouton "Rejouer" permet de relancer une partie avec les mêmes joueurs
- **And** un bouton "Quitter" permet de retourner à l'accueil

## Tasks

- [x] Create `Podium` component
- [x] Create `GameSummary` component (stats)
- [x] Implement Game Over logic (detect when all rounds are done)
- [x] Create `GameOverScreen` view
- [x] Implement "Replay" functionality (Host only?)
- [x] Implement "Quit" functionality
