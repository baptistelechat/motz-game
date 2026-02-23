# Story 4.3: Indicateur de Qualité Réseau (Ping)

**ID:** STORY-4-3
**Epic:** Epic 4: Système de Scoring & Progression
**Priority:** Should Have
**Story Points:** 3

## User Story

As a joueur,
I want voir la qualité de ma connexion,
So that comprendre si mes lenteurs viennent de moi ou du serveur.

## Acceptance Criteria

- [ ] **Indicateur Visuel** : Une icône (Vert/Orange/Rouge) indique la qualité de la connexion dans le header.
- [ ] **Détail Latence** : La valeur exacte en ms est visible au survol (desktop) ou au tap (mobile).
- [ ] **Gestion Déconnexion** : Un message "Reconnexion..." s'affiche si la connexion est perdue.
- [ ] **Seuils** :
    - Vert: < 100ms
    - Orange: 100ms - 300ms
    - Rouge: > 300ms

## Technical Notes

- **Stratégie Ping** : Implémenter un hook `useLatency` qui mesure le RTT (Round Trip Time).
  - Option A: Ping via Supabase Realtime (si supporté nativement).
  - Option B (Recommandée): Simple `fetch('/api/health')` ou RPC `ping()` toutes les 10 secondes.
- **Composant UI** : `NetworkStatusBadge` à placer dans le Header (à côté du Timer ou Avatar).
- **Iconographie** : Utiliser les icônes Pixelart (`@nsmr/pixelart-react`).
- **Etat Global** : Stocker la valeur `latency` dans le store Zustand `useGameStore` (ou un store UI dédié `useUIStore`) si besoin d'être accédé ailleurs, sinon état local suffisant.

## Dependencies

- Epic 1 (Layout)
- Epic 3 (Game Context)

## Definition of Done

- [ ] Composant `NetworkStatusBadge` créé et stylisé (Pixel-Pop).
- [ ] Hook `useLatency` implémenté et fonctionnel.
- [ ] Intégration dans le Header du jeu.
- [ ] Gestion des états dégradés (Orange/Rouge) et déconnecté vérifiée.
- [ ] Tests unitaires pour la logique de seuil.
