# Story 3.3: Soumission & Arbitrage Serveur

Status: completed

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

**En tant que** système,
**Je veux** valider et scorer toutes les soumissions reçues pendant la manche,
**Afin de** récompenser tous les joueurs méritants, pas seulement le plus rapide.

## Acceptance Criteria

1. **Given** des soumissions reçues de plusieurs joueurs
2. **When** le serveur traite les requêtes (Server Action `submitWord`)
3. **Then** chaque mot est validé (Autorité Serveur) :
   - Dictionnaire complet (Source de vérité)
   - Respect strict des contraintes (Lettres, Thèmes, etc.)
4. **And** si invalide : Rejet avec raison précise.
5. **And** si valide : Le mot est enregistré avec son timestamp et son score calculé.
6. **And** le score inclut :
   - **Validité** : Pré-requis.
   - **Score du Mot (Valeur Lettres)** : Somme des points des lettres (Meta "Complexité").
     - **Tier 1 (> 5%)**: 1 pt (E, S, A, I, R, N, T, O)
     - **Tier 2 (3-5%)**: 2 pts (L, U, C)
     - **Tier 3 (1-3%)**: 3 pts (M, D, P, G, B, H, F)
     - **Tier 4 (0.5-1%)**: 5 pts (Z, V, Q)
     - **Tier 5 (< 0.5%)**: 10 pts (Y, X, J, K, W)
     - _Exemple : MAISON = 3+1+1+1+1+1 = 8 pts | ZEBRE = 5+1+3+1+1 = 11 pts_
   - **Bonus Vitesse (Classement)** : Points fixes selon l'ordre d'arrivée (Meta "Rapidité").
     - **1er** : +10 pts
     - **2ème** : +8 pts
     - **3ème** : +5 pts
     - **4ème** : +3 pts
     - **5ème** : +1 pt
     - **6ème+** : +0 pt
     - _Exemple : 1er avec MAISON = 8 + 10 = 18 pts | 2ème avec ZEBRE = 11 + 8 = 19 pts_
7. **And** cette mécanique force le joueur à choisir entre "Vite & Simple" vs "Lent & Complexe".
8. **And** Règle d'égalité (Tie Breaker) : Si deux soumissions sont reçues avec < 50ms d'écart, elles reçoivent le même bonus de classement (le plus haut des deux).
9. **And** la manche continue jusqu'à ce que la condition de fin soit atteinte.

## Tâches / Sous-tâches

- [x] Tâche 1 : Modèle de Données & Schema
  - [x] Vérifier/Créer la table `submissions` (id, game_id, round_id, player_id, word, score, points_details, created_at, is_valid).
  - [x] Ajouter les politiques RLS (Insert: Authenticated players in game; Select: All players in game).
  - [x] Définir les types TypeScript partagés (`Submission`, `ScoreBreakdown`).

- [x] Tâche 2 : Moteur de Validation & Scoring (Server-Side)
  - [x] Implémenter `validateWordServer(word, constraints)` (Réutilisation logique partagée ou implémentation robuste avec dictionnaire serveur).
  - [x] Extraire la logique de fréquence de `scripts/analyze-dictionary.ts` vers une constante partagée `LETTER_POINT_VALUES`.
  - [x] Implémenter `calculateScore(word, rank, timeTaken?)` :
    - Points de base (Somme des points des lettres).
    - Bonus Vitesse (Logique de rang).

- [x] Tâche 3 : Server Action `submitWord`
  - [x] Créer l'action `submitWord(gameId, roundId, word)`.
  - [x] Gestion de la Concurrence :
    - Verrouiller/Vérifier l'état de la manche (doit être `PLAYING`).
    - Récupérer les soumissions existantes pour déterminer le rang.
    - Appliquer la règle des 50ms (Tie Breaker) : Vérifier le timestamp de la précédente soumission valide.
  - [x] Transaction DB : Insérer la soumission et retourner le résultat immédiat au client.
  - [x] Gestion Erreurs : Retourner des messages clairs si invalide (ex: "Mot inconnu", "Lettre interdite présente").

- [x] Tâche 4 : Intégration Client
  - [x] Connecter le composant `GameInput` (Story 3.2) à l'action `submitWord`.
  - [x] Gérer les états de chargement (Pending) et de réponse (Success/Error).
  - [x] Feedback UI final : Afficher le score gagné ou la raison du rejet (Toast/Animation).

## Notes de développement

- **Architecture:** Server Action pour la sécurité et la cohérence.
- **Tie Breaker:** Pour gérer les 50ms, on peut comparer avec `created_at` de la dernière soumission valide de la DB. Si `current_time - last_submission_time < 50ms`, alors `current_rank = last_rank`.
- **Dictionnaire:** Côté serveur, on peut charger le dictionnaire complet en mémoire (Set) ou utiliser une vérification optimisée. Le Bloom Filter client est pour l'UX, le Serveur est le Juge.
- **Performance:** L'action doit être rapide. Éviter les grosses requêtes. Indexer `round_id` sur `submissions`.

### Références

- [Epics: Story 3.3](file:///c:\Users\DM\Desktop\DEV\perso\motz-game_bmad-output\planning-artifacts\epics.md)
- [Architecture: Server Validation](file:///c:\Users\DM\Desktop\DEV\perso\motz-game_bmad-output\planning-artifacts\architecture.md)
