# Story 3.4: Résolution Manche & Feedback

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

**En tant que** joueur,
**Je veux** voir le classement de la manche et valider les mots thématiques douteux,
**Afin de** garantir l'équité du jeu (Social Validation).

## Acceptance Criteria

1.  **Given** une manche terminée.
2.  **When** la manche avait une contrainte de type "Thème" (ex: "Animaux").
3.  **Then** une phase intermédiaire `VALIDATING` est déclenchée AVANT le classement final.
4.  **And** (Social Validation) :
    - La liste des mots soumis s'affiche avec une case à cocher "Signaler/Invalide".
    - Si **>= 50%** des joueurs signalent un mot, il est rejeté (Score = 0, statut = 'rejected').
    - Cette phase dure un temps court (ex: 10-15s) ou s'arrête quand tout le monde a voté.
5.  **When** la phase de validation est terminée (ou si pas de thème).
6.  **Then** l'état passe à `FINISHED` et le `RoundSummary` s'affiche.
7.  **And** le reste du flux standard s'applique (Classement, Points, Vainqueur, Next Round).

## Tâches / Sous-tâches

- [x] Tâche 1 : Logique de Fin de Manche & Validation (Serveur)
  - [x] Modifier `endRound` pour gérer le statut `VALIDATING` si `round.constraint.type === 'theme'`.
  - [x] Implémenter le système de vote :
    - Table/Logique pour stocker les votes transitoires.
    - Action `voteInvalid(roundId, targetPlayerId)`.
    - Calcul du résultat : Si votes >= joueurs_actifs / 2 -> Rejet.
  - [x] ~~Implémenter le générateur de solutions (Fallback)~~ (Annulé)

- [x] Tâche 2 : UI Social Validation (ThemeRound)
  - [x] Créer une vue intermédiaire `SocialValidationView`.
  - [x] Afficher les mots soumis.
  - [x] Bouton "👎 Pas dans le thème" (Toggle).
  - [x] Feedback visuel quand un mot est rejeté par le groupe.

- [x] Tâche 3 : UI Récapitulatif de Manche (RoundSummary)
  - [x] Mettre à jour `RoundSummary` pour afficher les mots rejetés (barrés/rouges).
  - [x] ~~Ajouter la section "Solutions Possibles" si aucun gagnant.~~ (Annulé)
  - [x] Afficher la liste des résultats (Mots, Scores, Avatars).
  - [x] Styler le "Vainqueur" (Pixel-Pop Highlight).
  - [x] Afficher le Timer "Next Round in X...".

- [x] Tâche 4 : Intégration Realtime & Navigation
  - [x] Gérer la séquence : `PLAYING` -> (`VALIDATING` ->) `FINISHED` -> `Next Round`.
  - [x] Synchroniser les états entre tous les clients.

## Notes de développement

- **Social Validation:** C'est un mécanisme "Self-Policing". On fait confiance à la majorité.
- **Performance:** La recherche de solutions (Task 1.3) peut être coûteuse si le dictionnaire est énorme. Limiter la recherche (ex: premiers mots trouvés) ou pré-calculer.
- **Data Model:** Ajouter un champ `flags_count` ou table `votes` pour la validation.
- **UX:** La phase de validation doit être rapide et fluide pour ne pas casser le rythme.

### Références

- [Epics: Story 3.4](file:///c:\Users\ASUS\Desktop\DEV\Projet_perso\motz-game_bmad-output\planning-artifacts\epics.md)
- [Architecture: Game Loop](file:///c:\Users\ASUS\Desktop\DEV\Projet_perso\motz-game_bmad-output\planning-artifacts\architecture.md)
