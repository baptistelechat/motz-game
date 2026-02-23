# Rétrospective Epic 4 : Système de Scoring & Progression

**Date :** 23 Février 2026
**Participants :** Équipe de Développement (Simulée)
**Statut Epic :** Terminée

## 1. Résumé de l'Epic

L'Epic 4 s'est concentrée sur la mécanique de compétition et de feedback du jeu. Nous avons implémenté le système de calcul de score avancé (prenant en compte la longueur des mots et les contraintes), le tableau des scores (Leaderboard) en temps réel, un indicateur de qualité réseau (Ping), et l'écran de fin de partie (Podium).

### Stories Complétées :
- **4.1 Moteur de Calcul Score Avancé** : ✅ Implémenté avec succès. Le calcul prend en compte la longueur du mot et les bonus.
- **4.2 Tableau des Scores Global** : ✅ Fonctionnel. Le classement se met à jour en temps réel à chaque manche.
- **4.3 Indicateur Qualité Réseau** : ✅ Ajouté. Permet aux joueurs de voir leur latence.
- **4.4 Fin Partie & Podium** : ✅ L'écran de fin de partie affiche le vainqueur et permet de relancer une partie.

## 2. Ce qui a bien fonctionné (Keep doing)

- **Calcul de Score Robuste** : La logique de scoring est claire et extensible. Le système de points bonus fonctionne comme prévu.
- **Realtime Leaderboard** : L'utilisation de Supabase Realtime pour mettre à jour les scores instantanément offre une excellente expérience utilisateur.
- **Feedback Visuel** : L'intégration du Ping et du Podium améliore l'immersion et la clarté du jeu.
- **Modularité** : Les composants (Leaderboard, ScoreBadge, NetworkStatus) sont bien séparés et réutilisables.

## 3. Ce qui pourrait être amélioré (Improvements)

- **Animation des Scores** : On pourrait ajouter plus d'animations lors de l'incrémentation des scores pour rendre la progression plus gratifiante ("juicy").
- **Détail du Calcul** : Afficher le détail du calcul des points (ex: "+5 longueur", "+10 bonus") directement au joueur pourrait aider à mieux comprendre la stratégie.
- **Gestion des Égalités** : Bien que fonctionnelle, la gestion des égalités sur le podium pourrait être visuellement plus explicite.

## 4. Plans d'Action (Action Items)

- **[UX]** Envisager d'ajouter des animations de compteur pour les scores dans une future itération de "Polish".
- **[Dev]** Surveiller la performance des mises à jour Realtime si le nombre de joueurs augmente significativement.
- **[Next]** Passer à l'Epic 5 (Sécurité & Modération) pour sécuriser le jeu avant un lancement plus large.

## 5. Conclusion

L'Epic 4 est un succès. Le cœur compétitif du jeu est maintenant en place. Les joueurs peuvent jouer, marquer des points, se comparer aux autres et voir un vainqueur désigné. Nous sommes prêts à aborder la dernière phase majeure : la sécurité et la modération.
