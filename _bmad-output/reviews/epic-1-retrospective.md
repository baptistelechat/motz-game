# Rétrospective Épic 1 : Fondation & Infrastructure

**Date :** 2026-01-20
**Statut :** Terminé
**Participant :** @sm (Scrum Master), @dev (implémentation simulée)

## 1. Vue d'ensemble

L'Épic 1 a posé les bases techniques et visuelles du projet "Motz Game". L'objectif était de valider la stack technique "Zero-Cost", de mettre en place l'authentification anonyme et de définir l'identité visuelle "Pixel-Pop".

**Stories Complétées :**

- `1-1` : Initialisation Projet & Infrastructure (Next.js 15, Supabase, Tailwind v4).
- `1-2` : Landing Page & UI Mobile-First (Shadcn/UI, Lucide, PWA).
- `1-3` : Système d'Authentification Anonyme (Supabase Auth, RLS).
- `1-4` : Gestion Profil Joueur (Pseudo, Avatar, Zod Validation).

## 2. Ce qui a bien fonctionné (Successes)

- **Stack Technique Solide :** L'intégration de Next.js 15 avec Supabase (Auth + DB) s'est avérée fluide. Le typage TypeScript généré automatiquement via Supabase CLI accélère le développement.
- **Identité Visuelle :** Le style "Pixel-Pop" (bordures épaisses, ombres dures, palette rétro) est bien établi via la configuration Tailwind v4 et les composants Shadcn/UI personnalisés.
- **Sécurité RLS :** Le modèle "Row Level Security" fonctionne parfaitement pour l'auth anonyme. Les utilisateurs ne peuvent modifier que leur propre profil, validant l'approche sécuritaire sans backend lourd.
- **Expérience Utilisateur (UX) :** Le mode "Focus" (header/footer sticky) et la génération automatique de pseudo réduisent la friction à l'entrée.

## 3. Défis & Solutions (Challenges)

- **Captcha pour Auth Anonyme :** Supabase requiert parfois un captcha pour l'auth anonyme en production.
  - _Solution :_ Intégration d'un déclencheur manuel (bouton) dans l'UI pour gérer le flux de manière explicite si nécessaire.
- **Validation Hybride :** Assurer la cohérence entre la validation client (Zod) et les contraintes base de données.
  - _Solution :_ Utilisation de schémas Zod partagés pour le frontend et validation stricte côté DB via les contraintes SQL.

## 4. Leçons Apprises (Lessons Learned)

- **Zod est central :** La validation des données (profil, inputs jeu) doit passer systématiquement par Zod pour garantir l'intégrité des types avant même d'atteindre la DB.
- **Mobile-First est critique :** La contrainte de clavier virtuel sur mobile doit être testée en continu. Le layout actuel avec `dvh` (dynamic viewport height) est la bonne approche.
- **State Management :** Zustand est suffisant et performant pour gérer l'état local (profil, préférences) sans complexité excessive.

## 5. Impact sur l'Épic Suivant (Epic 2: Lobby)

- **Architecture Validée :** La base est prête pour accueillir la logique temps réel (Supabase Realtime) nécessaire au Lobby.
- **Réutilisation :** Les composants UI (Boutons Pixel, Inputs) et le système d'avatar seront réutilisés directement dans le Lobby.
- **Point de vigilance :** La gestion des abonnements Realtime (Presence) devra être testée rigoureusement pour éviter les fuites de mémoire, en suivant les patterns établis (cleanup dans `useEffect`).

## 6. Actions Requises

- [x] Marquer l'Épic 1 comme "Completed".
- [] Préparer le backlog pour l'Épic 2 (Lobby & Realtime).
- [x] Vérifier les quotas Supabase (Free Tier) avant d'attaquer les connexions simultanées du Lobby.
  - _Note :_ Free Tier supporte 200 connexions simultanées et 2M messages/mois, suffisant pour l'objectif de ~100 joueurs.
