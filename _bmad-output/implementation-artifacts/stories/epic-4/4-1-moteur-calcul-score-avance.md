# Story 4.1 : Moteur de Calcul de Score Avancé

Status: ready-for-dev

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

- [ ] Tâche 1 : Logique de Scoring (Backend)
  - [ ] Définir la table de valeurs des lettres (A=1, Z=10, etc.) dans une constante
  - [ ] Implémenter la fonction de calcul de score (PL/pgSQL ou TypeScript Server Action).
  - [ ] Intégrer le bonus de rapidité.

- [ ] Tâche 2 : Intégration Base de Données
  - [ ] Mettre à jour la table `player_round_stats` (si nécessaire) pour stocker le détail du score (base, bonus, total).
  - [ ] Assurer que le score est calculé atomiquement lors de la validation du mot.

- [ ] Tâche 3 : Tests Unitaires & Intégration
  - [ ] Créer des tests unitaires pour la logique de calcul de score (cas limites, mots vides, bonus max/min).
  - [ ] Vérifier que le score est correctement persisté en base.

## Notes de développement

- **Architecture :** Le calcul doit être fait côté serveur (Server Action ou Trigger DB) pour éviter la triche.
- **Performance :** Le calcul est simple, mais doit être synchrone avec la validation du mot.
- **Extensibilité :** Prévoir que les règles de scoring puissent évoluer (nouveaux bonus).

## Références

- [Epics: Story 4.1](file:///c:\Users\DM\Desktop\DEV\perso\motz-game\_bmad-output\planning-artifacts\epics.md)
