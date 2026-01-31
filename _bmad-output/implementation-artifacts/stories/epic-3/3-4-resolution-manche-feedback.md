# Story 3.4: Résolution Manche & Feedback

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

**En tant que** joueur,
**Je veux** voir le classement de la manche, valider les mots thématiques douteux, et voir des solutions si personne n'a trouvé,
**Afin de** garantir l'équité du jeu (Social Validation) et apprendre de mes échecs.

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
7.  **And** (Cas "Personne n'a trouvé") :
    - Si **aucun** mot valide n'a été trouvé par les joueurs.
    - Le système affiche 3 mots d'exemple qui auraient été valides (générés/piochés dans le dictionnaire).
    - Message : "Personne n'a trouvé ! Il fallait jouer : X, Y, Z".
8.  **And** le reste du flux standard s'applique (Classement, Points, Vainqueur, Next Round).

## Tâches / Sous-tâches

- [ ] Tâche 1 : Logique de Fin de Manche & Validation (Serveur)
  - [ ] Modifier `endRound` pour gérer le statut `VALIDATING` si `round.constraint.type === 'theme'`.
  - [ ] Implémenter le système de vote :
    - Table/Logique pour stocker les votes transitoires.
    - Action `voteInvalid(roundId, targetPlayerId)`.
    - Calcul du résultat : Si votes >= joueurs_actifs / 2 -> Rejet.
  - [ ] Implémenter le générateur de solutions (Fallback) :
    - Fonction `findExampleSolutions(constraints)` : Cherche 3 mots valides dans le dictionnaire serveur.
    - Appelée uniquement si `valid_submissions.length === 0`.

- [ ] Tâche 2 : UI Social Validation (ThemeRound)
  - [ ] Créer une vue intermédiaire `SocialValidationView`.
  - [ ] Afficher les mots soumis.
  - [ ] Bouton "👎 Pas dans le thème" (Toggle).
  - [ ] Feedback visuel quand un mot est rejeté par le groupe.

- [ ] Tâche 3 : UI Récapitulatif de Manche (RoundSummary)
  - [ ] Mettre à jour `RoundSummary` pour afficher les mots rejetés (barrés/rouges).
  - [ ] Ajouter la section "Solutions Possibles" si aucun gagnant.
  - [ ] Afficher la liste des résultats (Mots, Scores, Avatars).
  - [ ] Styler le "Vainqueur" (Pixel-Pop Highlight).
  - [ ] Afficher le Timer "Next Round in X...".

- [ ] Tâche 4 : Intégration Realtime & Navigation
  - [ ] Gérer la séquence : `PLAYING` -> (`VALIDATING` ->) `FINISHED` -> `Next Round`.
  - [ ] Synchroniser les états entre tous les clients.

## Notes de développement

- **Social Validation:** C'est un mécanisme "Self-Policing". On fait confiance à la majorité.
- **Performance:** La recherche de solutions (Task 1.3) peut être coûteuse si le dictionnaire est énorme. Limiter la recherche (ex: premiers mots trouvés) ou pré-calculer.
- **Data Model:** Ajouter un champ `flags_count` ou table `votes` pour la validation.
- **UX:** La phase de validation doit être rapide et fluide pour ne pas casser le rythme.

### Références

- [Epics: Story 3.4](file:///c:\Users\ASUS\Desktop\DEV\Projet_perso\motz-game_bmad-output\planning-artifacts\epics.md)
- [Architecture: Game Loop](file:///c:\Users\ASUS\Desktop\DEV\Projet_perso\motz-game_bmad-output\planning-artifacts\architecture.md)
