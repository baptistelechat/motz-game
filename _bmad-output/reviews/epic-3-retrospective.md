# Rétrospective Épic 3 : Core Game Loop

**Date :** 2026-02-03
**Statut :** Terminé
**Participant :** @sm (Scrum Master), @dev (implémentation)

## 1. Vue d'ensemble

L'Épic 3 a constitué le cœur du gameplay de Motz. L'objectif était d'implémenter la boucle de jeu complète : distribution des contraintes, saisie et validation des mots, arbitrage serveur et résolution de la manche. C'est ici que la "magie" du jeu opère.

**Stories Complétées :**

- `3-1` : **Distribution & Contraintes** (Table `rounds`, RPC `start_new_round`, Synchro Realtime).
- `3-2` : **Input & Validation Locale** (Bloom Filter, Feedback immédiat, Animations "Juicy").
- `3-3` : **Soumission & Arbitrage** (Server Action `submitWord`, Scoring par rareté + vitesse).
- `3-4` : **Résolution & Social Validation** (Phase de vote pour les thèmes, Écran de fin de manche).

## 2. Ce qui a bien fonctionné (Successes)

- **Validation Hybride (Client/Serveur) :** L'approche "Client pour l'UX / Serveur pour la Vérité" est un succès. Le Bloom Filter local permet un feedback instantané (< 50ms) sans charger le serveur, tandis que la validation finale RPC garantit l'intégrité du jeu.
- **Mécanique de Scoring :** Le système de points (Rareté des lettres + Bonus de vitesse) introduit une tension stratégique intéressante entre "répondre vite" (mots simples) et "répondre bien" (mots complexes).
- **Synchronisation Realtime :** Le déclenchement des manches via RPC + Subscription assure que tous les joueurs reçoivent les mêmes contraintes au même moment, minimisant les avantages injustes.
- **Social Validation :** Le système de vote pour les thèmes ("Pas dans le thème") permet de gérer la subjectivité sans complexité technique excessive (pas d'IA requise pour l'arbitrage sémantique).

## 3. Défis & Solutions (Challenges)

- **Gestion des États de Manche :** La transition fluide entre `PLAYING` -> `VALIDATING` (si thème) -> `FINISHED` a demandé une machine à états rigoureuse côté client pour éviter les désynchronisations.
  - _Solution :_ Utilisation de champs explicites `status` et `constraints` dans la table `rounds` pour piloter l'interface.
- **Performance Dictionnaire :** Charger un dictionnaire complet pour la validation locale sur mobile était risqué.
  - _Solution :_ Utilisation d'un Bloom Filter ou Set optimisé (chargé en background) pour réduire l'empreinte mémoire tout en gardant une validation O(1).
- **Latence Réseau & Timer :** Assurer que le timer est synchronisé malgré les latences variables.
  - _Solution :_ Le temps de référence est toujours celui du serveur (`started_at`), le client ne fait que calculer le delta.

## 4. Leçons Apprises (Lessons Learned)

- **"Juicy" Feedback is Key :** Les animations de secousse (Shake) et les sons 8-bit sur la validation ajoutent énormément au plaisir de jeu (Game Feel). C'est ce qui différencie une "app" d'un "jeu".
- **Optimistic UI prudente :** Pour la soumission, nous avons opté pour une UI optimiste (marquer comme "envoyé") mais avec un rollback clair en cas de rejet serveur. C'est crucial pour la perception de fluidité.
- **Sécurité RLS :** Toujours vérifier que l'utilisateur qui soumet est bien dans la partie active. Les policies RLS sur `submissions` sont vitales.

## 5. Impact sur l'Épic Suivant (Epic 4: Scoring & Leaderboard)

- **Données prêtes :** La table `submissions` contient déjà les scores bruts et les détails (`points_details`). L'Épic 4 pourra se concentrer sur l'agrégation et l'affichage (Leaderboard).
- **Architecture validée :** Le pattern Realtime/RPC est maintenant éprouvé et sera réutilisé pour la gestion de la fin de partie (Podium).

## 6. Actions Requises

- [x] Marquer l'Épic 3 comme "Completed" dans `sprint-status.yaml`.
- [ ] Démarrer l'Épic 4 : Moteur de calcul de score avancé et Leaderboard global.
- [ ] Nettoyer les logs de debug laissés dans les Server Actions de soumission.
