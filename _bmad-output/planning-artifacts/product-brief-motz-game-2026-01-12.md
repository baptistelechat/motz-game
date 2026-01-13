---
stepsCompleted:
  - 1
  - 2
  - 3
  - 4
  - 5
  - 6
inputDocuments: []
date: 2026-01-12
author: Baptiste
---

# Product Brief: motz-game

<!-- Content will be appended sequentially through collaborative workflow steps -->

## Executive Summary

Motz-game est un jeu web multijoueur en temps réel de rapidité lexicale, conçu pour transformer les micro-moments d'ennui ou les pauses sociales en expériences ludiques intenses et hilarantes. En s'inspirant de la convivialité des jeux de société mais en supprimant les contraintes logistiques (matériel, distance), il offre une plateforme accessible instantanément où la réflexion rapide et l'adaptabilité sont reines. Le cœur du gameplay repose sur des contraintes dynamiques (cartes imposant/interdisant des lettres) et un arbitrage serveur impartial, garantissant des parties rapides (max 15 min), équitables et frénétiques.

---

## Core Vision

### Problem Statement

Les moments de temps libre (pause déjeuner, attente, soirée à distance) manquent d'activités sociales engageantes, rapides et accessibles. Les jeux de mots existants sont souvent soit trop lents/asynchrones (Scrabble, Wordle), soit sujets à des débats interminables sur les règles (Petit Bac), soit nécessitent une logistique complexe. Il manque un "Ice Breaker" lexical instantané qui génère de l'adrénaline et du rire sans prise de tête.

### Problem Impact

- **Ennui social :** Les interactions à distance ou les pauses café peuvent devenir routinières.
- **Frustration ludique :** Les jeux existants manquent de rythme ou créent des conflits sur la validité des mots.
- **Barrière à l'entrée :** La nécessité de créer des comptes ou d'installer des apps décourage le jeu spontané.

### Why Existing Solutions Fall Short

- **Jeux de société physiques :** Nécessitent présence et matériel.
- **Jeux mobiles classiques :** Souvent asynchrones, solitaires ou bourrés de pubs/micro-transactions intrusives.
- **Jeux io existants :** Souvent focalisés sur le dessin ou des mécaniques complexes, négligeant le pur plaisir du vocabulaire sous pression.

### Proposed Solution

Une application web "click-and-play" (Next.js/Supabase) où les joueurs rejoignent une partie en quelques secondes via un pseudo. Le serveur orchestre des manches rapides où des cartes de contraintes (lettres obligatoires/interdites, effets spéciaux) sont révélées. Le premier à soumettre un mot valide gagne le maximum de points. L'expérience est fluide, temps réel, et centrée sur l'urgence amusante.

### Key Differentiators

1.  **Mécanique de Contraintes Dynamiques :** La combinaison aléatoire de cartes à chaque manche assure une rejouabilité infinie et brise la monotonie.
2.  **Temps Réel Strict & Arbitrage Serveur :** Fini les tricheurs et les débats ; le serveur est le seul juge, créant une tension compétitive saine.
3.  **Accessibilité Radicale :** Pas d'inscription, pas d'app à installer, optimisé pour mobile et desktop.
4.  **Équilibre Fun/Réflexion :** Suffisamment simple pour être un party game, suffisamment profond pour stimuler le vocabulaire.

---

## Target Audience

### Primary Personas

#### 1. The Social Connector ("Léa, l'étudiante en échange")

- **Profil :** 22 ans, étudiante à l'étranger.
- **Besoin :** Garder un lien ludique avec ses amis restés en France sans la lourdeur d'une organisation complexe.
- **Frustration actuelle :** Les appels vidéo manquent d'activité partagée ; les jeux en ligne sont souvent trop longs ou nécessitent des comptes (Steam, etc.).
- **Scénario clé :** Envoie un lien WhatsApp à son groupe d'amis un dimanche soir pour 15 minutes de jeu spontané.

#### 2. The Casual Gamer ("Marc, le dév")

- **Profil :** 30 ans, développeur ou employé de bureau.
- **Besoin :** Décompresser 10 minutes avec ses collègues entre midi et deux ou en fin de journée.
- **Frustration actuelle :** Pas le temps/droit d'installer des jeux sur le PC pro. Veut du "fun immédiat" sans setup.
- **Scénario clé :** Rejoint une partie lancée par un collègue via un lien Slack pour une pause café virtuelle.

#### 3. The Competitor ("Sophie, la reine du Scrabble")

- **Profil :** 45 ans, amatrice de jeux de lettres et de société.
- **Besoin :** Prouver sa maîtrise du vocabulaire et sa rapidité.
- **Frustration actuelle :** Les jeux tour par tour sont trop lents. Elle veut de la tension et de la compétition équitable.
- **Scénario clé :** Enchaîne les parties pour grimper au classement (si existant) ou simplement pour écraser ses adversaires par sa vitesse.

#### 4. The Family Gatherer ("Pierre, le grand-père connecté")

- **Profil :** 65 ans, à l'aise avec une tablette mais pas expert technique.
- **Besoin :** Un jeu intergénérationnel (7 à 77 ans) simple à comprendre pour jouer avec ses petits-enfants lors des repas de famille.
- **Frustration actuelle :** Les jeux vidéo sont trop compliqués (manettes, règles complexes). Les jeux de société prennent de la place et du temps d'installation.
- **Scénario clé :** Scanne un QR Code sur le téléphone de son fils pour rejoindre la partie sans rien installer ni taper d'URL.

### User Journey & Needs

- **Onboarding Frictionless (Zero-Click Entry) :**
  - **Partage :** Lien direct (WhatsApp, Discord, SMS) ou QR Code généré à la volée.
  - **Accès :** Pas de compte, juste un pseudo.
  - **Cross-Device :** Doit marcher aussi bien sur le smartphone du petit-fils que sur la tablette du grand-père.
- **Accessibility & UX :**
  - Interface épurée, gros boutons, lisibilité maximale (police, contraste).
  - Feedback visuel clair et immédiat (succès/échec du mot).

---

## Success Metrics

### North Star Metric (L'indicateur clé)

- **Replay Streak :** Le nombre de parties enchaînées consécutivement par le même groupe (mesure directe de l'addiction et du fun).

### User Experience Metrics

- **Retention Rate :** Pourcentage de joueurs revenant le lendemain (différencie la curiosité de l'intérêt réel).
- **Satisfaction (NPS "Light") :** Note rapide (1-5 étoiles) demandée à la fin de la session.
- **"Full House" Rate :** Nombre de parties atteignant la capacité maximale de 8 joueurs (indicateur de succès social).

### Technical Performance KPIs

- **Input Latency :** Délai entre la soumission du mot et la validation serveur (Cible : < 100ms, "as low as possible").
- **Matchmaking Velocity :** Temps d'attente moyen pour lancer une partie.
- **Concurrency Optimization :** Maximiser le nombre de joueurs simultanés dans les limites du plan gratuit Supabase (Cible initiale : 100 joueurs simultanés).
- **Hard Cap Strategy :** Limitation stricte des connexions en fonction des quotas Supabase (Message "Serveur complet") pour préserver la qualité de jeu des utilisateurs connectés.
- **Weekly Active Users (WAU) :** Cible initiale de 100 joueurs uniques par semaine.

### Growth & Virality

- **Viral Coefficient (K-Factor) :** Analyse du partage (via Umami Analytics) pour voir combien de nouveaux joueurs sont amenés par chaque lien/QR Code partagé.

---

## MVP Scope (Scope Negotiation)

### IN SCOPE (Must Have for V1)

#### Core Gameplay & Mechanics

- **Real-Time Engine :** Synchronisation multijoueur fluide via Supabase Realtime.
  - **Architecture :** "Database as State" (Pas de serveur Node dédié). Chaque action est un event DB.
  - **Optimisation :** Acceptation d'une latence modérée (~100-200ms) pour simplifier l'infra (Vercel + Supabase).
- **Strict Server Validation :**
  - **Dictionnaire In-Memory :** Chargement du dictionnaire côté client (ou Edge Function avec cache) au lancement pour validation instantanée sans spammer la DB.
    - **Fallback Mode :** Si mémoire insuffisante (Low-End Mobile), bascule automatique sur validation API avec notification "Mode Dégradé".
  - Respect des lettres imposées/interdites.
  - **Server Authoritative :** L'heure du serveur fait foi pour l'arbitrage (protection anti-triche).
    - **Tie Breaker (L'École des Fans) :** Si écart < 50ms entre deux soumissions valides, égalité parfaite accordée (points pour les deux) pour maximiser le fun.
  - **Validation Thématique Avancée (Semantic Analysis) :** Tentative d'intégration dès la V1 pour les cartes "Thème".
    - _Note Technique :_ Utilisation de modèles légers ou d'API optimisées pour minimiser la latence. Si trop lent (>200ms), fallback sur validation par tags basiques.
  - **Risk/Reward Scoring (Combo-Breaker) :** Bonus de points (ex: x1.5 ou x2) pour l'utilisation de lettres rares ou le respect de contraintes facultatives ("Hard Mode"), afin de récompenser l'audace face à la pure vitesse.
- **Card System (Base + Special) :**
  - Lettres Obligatoires / Interdites.
  - **Cartes Spéciales de base :** Thème imposé, Inversion de règles, Longueur minimale.
- **Report System :** Possibilité pour les joueurs de signaler/contester un mot (faux positif) en temps réel ou en fin de partie.

#### Trust & Safety

- **Safe Mode (Filtre Profanité) :** Option à la création de la room (activée par défaut).
  - **Priorité Sécurité :** Le filtre prime sur le dictionnaire (Risque 0).
  - Si actif : Rejette les mots vulgaires/offensants même si valides au dictionnaire.
  - Si inactif : Accepte tout mot valide du dictionnaire officiel.
  - **Admin Tools :** Gestion d'une "Allowlist" pour corriger les faux positifs signalés.
- **Vote Kick :** Mécanique d'exclusion communautaire (ex: 3 votes requis).
  - **Anti-Griefing :** Désactivé automatiquement après 80% de progression de la partie.
  - **Sanction :** Déconnexion neutre (pas de pénalité de score/classement pour l'instant).
- **Disconnect Handling :** "The Ghost" (Passif).
  - Un joueur déconnecté reste dans la liste (inactif) et peut reprendre sa place s'il se reconnecte. Pas de pénalité immédiate.

#### Onboarding & Social

- **Identity :** Choix de Pseudo + **Sélection d'Avatar** (parmi une liste prédéfinie).
- **Room Management :**
  - Création de **Rooms Privées** (Lien/QR Code).
  - _Note :_ Les Rooms Publiques sont exclues de la V1 (focus amis/famille).
- **Lobby Experience :** Salle d'attente avant le lancement (liste des joueurs présents).

#### UI/UX

- **Mobile First Design :** Interface pensée pour le tactile et les petits écrans.
- **Immediate Feedback :** Animation visuelle instantanée lors de la soumission (Succès/Échec).
- **Network Quality Indicator (Ping) :** Affichage discret de la latence avec alerte explicite ("Connexion instable, actions retardées") si critique.
- **Scoreboard :** Classement de la manche et classement général de la partie.

### OUT OF SCOPE (Deferred to V2)

- **Public Rooms / Global Matchmaking :** Pas de liste publique de parties, uniquement invitation par lien pour la V1 (simplification modération/technique).
- **Complex Special Cards :** Effets modifiant le temps (ex: "Temps x2"), vol de points entre joueurs, ou mécaniques nécessitant trop d'états complexes.
- **Alternative Game Modes :**
  - **Mode Sabotage (Reverse) :** Un joueur devient Maître du Jeu et choisit les contraintes.
  - **Battle Royale Lexical :** Zone rétrécissante avec lettres interdites progressives.
- **User Accounts :** Pas d'inscription, pas d'historique de stats long terme, pas de profil persistant.
- **Chat System :** Pas de discussion libre (focus gameplay, évite modération).
- **Multi-language :** Uniquement français pour le lancement.

## Success Criteria

### User Success

- **Expérience de Jeu ("Flow") :**
  - **Volume :** Une partie "réussie" se définit par un rythme soutenu (grand nombre de mots joués par manche).
  - **Durée Optimale :** Parties rapides et intenses, plafonnées à 15 minutes max pour éviter la lassitude.
  - **Sentiment Clé :** L'envie de revanche immédiate ("One more game") même en cas de défaite, signe d'un équilibre fun/frustration sain.

### Business Success

- **Adoption & Rétention :**
  - **Cible V1 :** 100 joueurs uniques actifs, principalement via le bouche-à-oreille (Twitter, Discord, cercles tech/amis).
  - **Indicateur de Réussite (3 mois) :** Avoir des joueurs actifs réguliers plusieurs mois après le lancement, prouvant que le jeu dépasse l'effet de nouveauté.
- **Stratégie de Diffusion :**
  - Focus sur la viralité organique (partage de liens privés) et la promotion communautaire (X, Discord).

### Technical Success

- **Robustesse & Coût :**
  - **Budget Infra :** 0€ (Strict Free Tier Supabase).
  - **Capacité V1 :** ~100 joueurs simultanés (Hard Cap).
    - _Note :_ Le monitoring des quotas temps réel de Supabase sera crucial pour ajuster ce cap dynamiquement si possible, ou le fixer arbitrairement pour garantir la stabilité.
  - **Fiabilité :** Aucune partie interrompue par des erreurs serveur, même en pic de charge (dans la limite du Hard Cap).

### Measurable Outcomes

- **Durée Moyenne de Session :** > 15 minutes (soit au moins 2 parties enchaînées).
- **Taux de Revanche :** > 50% des parties sont suivies d'une nouvelle partie avec le même groupe.
- **Coût par Utilisateur :** 0€ (Maintenance de l'infra gratuite).

## Product Scope

### MVP - Minimum Viable Product

- **Cœur de Jeu :** Moteur temps réel, Validation serveur stricte, Cartes de contraintes de base.
- **Social :** Lobby privé, Lien d'invitation, Chat (limité/inexistant selon décision finale, focus gameplay).
- **Tech :** Supabase Realtime, Hard Cap connexions, Fallback mobile.
- **Trust & Safety :** Safe Mode par défaut, Vote Kick.

### Growth Features (Post-MVP)

- **Modes de Jeu Alternatifs :** Sabotage, Battle Royale.
- **Système de Replay :** Pour partager les moments forts sur les réseaux.

### Vision (Future)

- **Application Native :** Si succès web.
- **E-Sport & Tournois :** Si la communauté devient compétitive.
- **Intégration Streaming :** Fonctionnalités dédiées pour Twitch (vote du public sur les contraintes).

## Exigences du Domaine

- **RGPD (GDPR) :**

  - **Minimisation des données :** Pas de stockage de données personnelles inutiles (pas de compte obligatoire).
  - **Logs :** Stockage des IP (logs Supabase) limité au strict nécessaire pour la sécurité et la modération, avec rotation/suppression automatique (ex: 30 jours).
  - **Droits utilisateurs :** Mécanisme simple pour demander la suppression de toutes les données associées à un pseudo/IP si applicable.

- **Loi sur les Services Numériques (DSA) & Modération :**

  - **Safe Mode :** Activé par défaut pour protéger les utilisateurs contre les contenus offensants.
  - **Signalement :** Mécanisme accessible pour signaler un comportement abusif ou un contenu illicite (mots offensants non filtrés).
  - **Transparence :** Règles de modération claires (CGU simplifiées) accessibles depuis le jeu.

- **Protection des Mineurs :**
  - **Filtre de profanité :** Strictement appliqué par défaut, surtout si le jeu est accessible aux mineurs.
  - **Interactions :** Limitation des interactions publiques (pas de chat libre ou chat très restreint) pour éviter le grooming ou le harcèlement.
  - **Avertissement :** Indication claire de l'âge minimum recommandé si nécessaire.
