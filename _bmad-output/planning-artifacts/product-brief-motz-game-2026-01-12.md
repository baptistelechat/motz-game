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
- **Weekly Active Users (WAU) :** Cible initiale de 100 joueurs uniques par semaine.

### Growth & Virality

- **Viral Coefficient (K-Factor) :** Analyse du partage (via Umami Analytics) pour voir combien de nouveaux joueurs sont amenés par chaque lien/QR Code partagé.

---

## MVP Scope (Scope Negotiation)

### IN SCOPE (Must Have for V1)

#### Core Gameplay & Mechanics

- **Real-Time Engine :** Synchronisation multijoueur fluide via Supabase Realtime.
- **Strict Server Validation :**
  - Vérification dictionnaire français.
  - Respect des lettres imposées/interdites.
  - **Validation Thématique Avancée (Semantic Analysis) :** Tentative d'intégration dès la V1 pour les cartes "Thème".
    - _Note Technique :_ Utilisation de modèles légers ou d'API optimisées pour minimiser la latence. Si trop lent (>200ms), fallback sur validation par tags basiques.
- **Card System (Base + Special) :**
  - Lettres Obligatoires / Interdites.
  - **Cartes Spéciales de base :** Thème imposé, Inversion de règles, Longueur minimale.
- **Report System :** Possibilité pour les joueurs de signaler un mot contestable (faux positif) pour amélioration continue du dictionnaire.

#### Onboarding & Social

- **Identity :** Choix de Pseudo + **Sélection d'Avatar** (parmi une liste prédéfinie).
- **Room Management :**
  - Création de **Rooms Privées** (Lien/QR Code).
  - _Note :_ Les Rooms Publiques sont exclues de la V1 (focus amis/famille).
- **Lobby Experience :** Salle d'attente avant le lancement (liste des joueurs présents).

#### UI/UX

- **Mobile First Design :** Interface pensée pour le tactile et les petits écrans.
- **Immediate Feedback :** Animation visuelle instantanée lors de la soumission (Succès/Échec).
- **Scoreboard :** Classement de la manche et classement général de la partie.

### OUT OF SCOPE (Deferred to V2)

- **Public Rooms / Global Matchmaking :** Pas de liste publique de parties, uniquement invitation par lien pour la V1 (simplification modération/technique).
- **Complex Special Cards :** Effets modifiant le temps (ex: "Temps x2"), vol de points entre joueurs, ou mécaniques nécessitant trop d'états complexes.
- **User Accounts :** Pas d'inscription, pas d'historique de stats long terme, pas de profil persistant.
- **Chat System :** Pas de discussion libre (focus gameplay, évite modération).
- **Multi-language :** Uniquement français pour le lancement.
