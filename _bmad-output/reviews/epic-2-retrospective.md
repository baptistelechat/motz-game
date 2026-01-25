# Rétrospective Épic 2 : Gestion de Salle & Lobby

**Date :** 2026-01-25
**Statut :** Terminé
**Participant :** @sm (Scrum Master), @dev (implémentation)

## 1. Vue d'ensemble

L'Épic 2 a transformé les fondations statiques en une expérience multijoueur temps réel. L'objectif était de permettre la création de salles, l'invitation de joueurs via QR Code/Lien, et la synchronisation d'un Lobby vivant.

**Stories Complétées :**

- `2-1` : Création de Salle & Routage (Génération Code, Table `games`, RLS Host).
- `2-2` : Rejoindre une Salle (Table `game_players`, Supabase Realtime, Animation "Pop").
- `2-3` : Gestion État "Prêt" & Lancement (Synchronisation, Navigation sécurisée, RLS granulaire).

## 2. Ce qui a bien fonctionné (Successes)

- **Supabase Realtime :** La synchronisation des joueurs dans le lobby est instantanée. Le pattern `useRealtimeLobby` écoutant les `INSERT`/`DELETE` sur `game_players` s'est révélé robuste.
- **Sécurité RLS Granulaire :** L'utilisation de permissions RLS strictes (ex: seul l'Host peut `UPDATE` le statut de la partie, et uniquement sur des colonnes spécifiques) sécurise la logique métier directement en base de données.
- **Expérience "Pixel-Pop" :** L'ajout des QR Codes générés à la volée et les animations d'arrivée (Pop) renforcent l'identité visuelle et l'aspect ludique dès le lobby.
- **Architecture "Database as State" :** Le fait que l'état du lobby soit entièrement dérivé de la DB simplifie la gestion d'état frontend. Pas de WebSocket server custom à gérer.

## 3. Défis & Solutions (Challenges)

- **Double Souscription Realtime :** Il a fallu gérer deux canaux d'écoute simultanés : un pour la liste des joueurs (`game_players`) et un pour le statut de la partie (`games`).
  - _Solution :_ Centralisation dans un hook `useRealtimeLobby` qui expose un état unifié au composant.
- **Navigation & Historique :** Éviter que les joueurs ne reviennent au lobby avec le bouton "Précédent" une fois la partie lancée.
  - _Solution :_ Utilisation de `router.replace()` au lieu de `push()` lors de la transition vers l'écran de jeu.
- **Sécurité des Updates :** Risque qu'un joueur malin modifie le statut de la partie.
  - _Solution :_ Affinement des politiques RLS pour restreindre l'UPDATE sur la table `games` à l'utilisateur `host_id` et uniquement sur les colonnes `status` et `started_at`.

## 4. Leçons Apprises (Lessons Learned)

- **RLS Column-Level Security :** Pour les épics futurs, privilégier systématiquement `GRANT UPDATE (column_list)` plutôt que des permissions de table génériques pour éviter les modifications accidentelles ou malveillantes.
- **Optimistic UI vs Realtime :** Pour le bouton "Prêt", le feedback immédiat est crucial. Attendre le round-trip Realtime peut sembler lent. Un mix d'état local optimiste et de confirmation Realtime est l'approche gagnante pour le gameplay (Epic 3).
- **Gestion des Profils Fantômes :** L'importance de rediriger/créer un profil automatiquement si un joueur arrive via un lien de partage sans être passé par l'accueil a été confirmée.

## 5. Impact sur l'Épic Suivant (Epic 3: Moteur de Jeu Core)

- **Infrastructure Validée :** Le système de synchronisation Realtime est prêt pour supporter le flux de jeu (distribution de cartes, timer).
- **Pattern de Synchronisation :** Le mécanisme "Host lance -> DB Update -> Clients notifiés -> Navigation" sera réutilisé pour les transitions de manches.
- **Vigilance Latence :** Avec plus d'interactions rapides (input mots), il faudra surveiller la latence Supabase. Le "Bloom Filter" local prévu sera essentiel pour compenser.

## 6. Actions Requises

- [x] Marquer l'Épic 2 comme "Completed" dans `sprint-status.yaml`.
- [ ] Préparer les tâches techniques pour l'Épic 3 (Bloom Filter, Timer Server-Side).
- [ ] Vérifier les limites de connexion Realtime si on scale les tests de charge.
