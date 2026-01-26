# Story 3.1 : CHARGEMENT DU SYSTÈME Manche & Distribution Cartes

Status: completed

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

**En tant que** joueur,
**Je veux** recevoir une combinaison variée de contraintes (Lettres, Thèmes, Règles Spéciales) pour chaque manche,
**Afin que** le jeu reste unique et stimulant.

## Acceptance Criteria

1. **Given** une partie active (état `playing`)
2. **When** le système initialise une nouvelle manche (via RPC `start_new_round`)
3. **Then** une nouvelle entrée est créée dans la table `rounds` avec un `game_id` valide
4. **And** des contraintes aléatoires (Lettre, Thème) sont générées et stockées dans la colonne `constraints` (JSONB)
5. **And** tous les joueurs connectés reçoivent l'événement via Supabase Realtime en moins de 500ms
6. **And** les contraintes sont identiques pour tous les joueurs de la partie

## Tâches / Sous-tâches

- [x] Tâche 1 : Migration & Schéma de Données (AC: 3, 4)
  - [x] Créer la migration SQL `create_rounds_table`.
  - [x] Définir la table `rounds` : `id` (UUID), `game_id` (FK), `round_number` (INT), `constraints` (JSONB), `status` (ENUM), `created_at`.
  - [x] Appliquer les politiques RLS (Lecture pour les joueurs de la partie uniquement).
  - [x] Mettre à jour les types TypeScript (`database.types.ts`).

- [x] Tâche 2 : Logique Backend (RPC) (AC: 2, 4)
  - [x] Implémenter la fonction Postgres `start_new_round(game_id)` (PL/pgSQL).
  - [x] Ajouter la logique de génération aléatoire pour les lettres (A-Z) et les thèmes.
  - [x] Gérer l'incrémentation du `round_number`.
  - [x] Sécuriser l'appel (vérifier que l'utilisateur est légitime/host).

- [x] Tâche 3 : Intégration Frontend & State (AC: 5, 6)
  - [x] Mettre à jour `useGameStore` pour s'abonner aux changements de la table `rounds` (Realtime).
  - [x] Créer un sélecteur atomique `useGameStore(s => s.currentRound)`.
  - [x] Ajouter un bouton de test "Démarrer Manche" (visible en dev/admin seulement) pour déclencher le RPC.

- [x] Tâche 4 : Vérification & Tests (AC: 1, 5, 6)
  - [x] Créer un test E2E (Playwright) vérifiant la synchronisation entre 2 joueurs.
  - [x] Vérifier manuellement que les contraintes s'affichent (console log ou UI brute) sur deux navigateurs différents.

## Notes de développement

- **Architecture :** "Database as State" - la source de vérité est la base de données. Le store client n'est qu'un miroir.
- **Performance :** La génération doit être rapide (< 200ms). Privilégier le PL/pgSQL pour éviter les allers-retours réseaux inutiles d'une Edge Function si la logique est simple.
- **Sécurité :** Les contraintes sont générées par le serveur (Trusted Authority) pour empêcher la triche.
- **Extensibilité :** Le format JSONB pour `constraints` permet d'ajouter facilement des types de contraintes (ex: "Interdit de dire E") sans migration lourde.

### Références

- [Epics: Story 3.1](file:///c:\Users\ASUS\Desktop\DEV\Projet_perso\motz-game_bmad-output\planning-artifacts\epics.md)
- [Architecture: State Management](file:///c:\Users\ASUS\Desktop\DEV\Projet_perso\motz-game_bmad-output\planning-artifacts\architecture.md)
- [UX: Core Loop](file:///c:\Users\ASUS\Desktop\DEV\Projet_perso\motz-game_bmad-output\planning-artifacts\ux-design-specification.md)

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
