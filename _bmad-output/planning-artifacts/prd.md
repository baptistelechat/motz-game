---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-03-success
  - step-04-journeys
  - step-05-domain
  - step-06-innovation
  - step-07-project-type
  - step-08-scoping
  - step-09-functional
  - step-10-nonfunctional
  - step-11-polish
inputDocuments:
  - product-brief-motz-game-2026-01-12.md
workflowType: "prd"
---

# Product Requirements Document - motz-game

**Author:** Baptiste
**Date:** 2026-01-12

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
- **Vote Kick :** Mécanique d'exclusion communautaire (Seuil dynamique : > 50% des autres joueurs).
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

#### Long Term Vision

- **Application Native :** Si succès web.
- **E-Sport & Tournois :** Si la communauté devient compétitive.
- **Intégration Streaming :** Fonctionnalités dédiées pour Twitch (vote du public sur les contraintes).

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

## User Journeys

### 1. Journey: The Instant Host (Léa) - _Happy Path_

**Persona:** Léa, l'étudiante connectée.
**Objectif:** Lancer une partie privée avec 3 amis en moins d'une minute.

- **Ouverture:** Léa ouvre l'app web sur son mobile. Sur l'écran d'accueil épuré, deux gros boutons : "Rejoindre" et "Créer". Elle clique sur **"Créer une partie privée"**.
- **Configuration (Host) :**
  - Elle définit rapidement les paramètres : _Safe Mode (ON)_, _Nombre de joueurs (4)_.
  - Elle valide et devient l'**Hôte** de la salle.
- **Lobby & Partage :**
  - Une "Waiting Room" s'affiche.
  - Elle utilise le bouton **"Partager"**.
  - _Comportement Smart Share :_ Sur Mobile, le jeu ouvre la "Native Share Sheet" (WhatsApp, SMS, etc.). Sur Desktop, il copie le lien dans le presse-papier avec une notification "Lien copié !".
  - _Compatibilité :_ Le lien force, si possible, l'ouverture dans le navigateur par défaut (Chrome/Safari) plutôt que la WebView in-app de WhatsApp pour garantir la stabilité du WebSocket.
- **Arrivée des joueurs :**
  - Ses amis cliquent sur le lien. Ils arrivent directement sur un écran "Choisis ton Pseudo & Avatar".
  - Léa voit les avatars de ses amis apparaître un par un dans le Lobby (ex: "Tom a rejoint", "Sarah a rejoint").
- **Lancement :**
  - Une fois le quota atteint (4/4), le bouton **"Lancer la partie"** s'active pour Léa (Host).
  - Elle appuie. Un décompte (3-2-1) synchronisé se lance sur tous les écrans.
- **Climax :** La première carte tombe. La partie commence instantanément pour tout le monde.

### 2. Journey: The Ghost Protocol (Marc) - _Edge Case / Resilience_

**Persona:** Marc, le joueur au bureau (Mobile/Desktop).
**Objectif:** Récupérer sa session après une coupure réseau brutale.

- **Incident :** En pleine manche, Marc doit changer d'onglet (patron) ou passe dans un tunnel (perte 4G).
- **Côté Serveur (Les autres) :**
  - Son statut passe immédiatement en "Inactif" (visuel grisé ou icône "Ghost").
  - **Le jeu continue** pour les autres sans pause. Il ne marque pas de points, mais n'est pas exclu.
- **Côté Marc (Le retour) :**
  - Il revient sur l'onglet 30 secondes plus tard.
  - L'interface affiche un écran de blocage : _"Connexion perdue. Oups !"_ avec un bouton **"Se reconnecter"**.
- **Tentative de Reconnexion (State-Aware) :**
  - Il clique. Le client tente de rétablir le socket avec Supabase en utilisant un `session_token` stocké en `localStorage`.
  - _Scénario A (Manche en cours) :_ Il est resynchronisé instantanément sur l'état actuel (Timer, Cartes). Il peut reprendre le jeu immédiatement.
  - _Scénario B (Manche finie pendant son absence) :_ Il est redirigé vers l'écran de Score de la manche terminée (en mode Spectateur) et attend le lancement de la manche suivante.
  - _Scénario C (Partie terminée) :_ Message _"La partie est terminée"_. Redirection vers l'Accueil.

### 3. Journey: The Guardian (L'Admin) - _Operations_

**Persona:** Admin / Modérateur (Propriétaire du jeu).
**Objectif:** Maintenir la qualité du jeu et gérer les signalements (Back-Office).

- **Contexte :** Un joueur a signalé que le mot "BICHE" a été censuré par erreur par le filtre de profanité (Faux Positif).
- **Action :** L'Admin consulte ses logs ou son dashboard Supabase périodiquement.
- **Intervention :**
  - Il accède à son interface d'administration (Table Supabase ou Dashboard simple).
  - Il vérifie le mot dans la liste des "Rejets Safe Mode".
  - Il ajoute "BICHE" à la **Allowlist** (Liste blanche) globale via une requête SQL ou une UI admin basique.
- **Résultat :** Le mot sera désormais accepté dans toutes les futures parties en Safe Mode.
- _Note :_ Pour la V1, pas d'override "in-game" par les joueurs pour éviter les abus. La sécurité prime sur la flexibilité immédiate.

### 4. Journey: The Community Shield (Thomas) - _Trust & Safety_

**Persona:** Thomas, joueur régulier et fair-play.
**Objectif:** Profiter d'une partie saine sans toxicité.

- **Contexte :** Une partie semi-publique (lien partagé sur un Discord communautaire). Un joueur inconnu "Troll123" a rejoint.
- **Incident (Tentative de choc) :**
  - Troll123 tente de soumettre un mot raciste ou très offensant pour choquer les participants.
- **Réaction Système (Immediate Block - Safe Mode) :**
  - **Côté Thomas (et les autres) :** Rien ne s'affiche. Le mot n'est jamais diffusé.
  - **Côté Troll123 :** Feedback visuel rouge immédiat "Mot interdit".
- **Escalade (Griefing) :**
  - Frustré, Troll123 tente de nuire autrement (ex: attendre la fin du timer systématiquement pour ralentir le jeu).
- **Action Communautaire (Vote Kick) :**
  - Thomas clique sur l'avatar de Troll123 -> "Signaler / Exclure".
  - Une notification discrète apparaît chez les autres joueurs : _"Vote d'exclusion contre Troll123 (1/3)"_.
  - Deux autres joueurs valident rapidement.
- **Résolution :**
  - Le seuil dynamique (> 50% des autres joueurs) est atteint.
  - Troll123 est déconnecté immédiatement avec le message _"Vous avez été exclu de la partie"_.
  - La partie continue pour Thomas et les survivants.

## Innovation Pillars

### 1. Zero-Friction Social Play (Accessibilité Radicale)

Contrairement aux jeux mobiles classiques (installation requise) ou aux jeux de société (matériel requis), Motz-game élimine toutes les barrières.

- **Innovation :** Utilisation de l'URL comme "Ticket d'entrée" unique. Le lien _est_ le jeu.
- **Validation :** Taux de conversion "Clic -> Jeu" > 90%.

### 2. "Database as State" Architecture (Technical Simplicity)

Le choix de ne pas avoir de serveur de jeu dédié (type Node.js + Socket.io) mais d'utiliser la base de données comme source de vérité temps réel.

- **Innovation :** Réduction drastique de la complexité DevOps et des coûts (Serverless native).
- **Validation :** Capacité à tenir la charge de 100 joueurs simultanés avec 0€ de coût infra.

### 3. Generative Content Integration (Exploratory - V2)

Utilisation potentielle de l'IA (LLM légers ou API) pour dynamiser le contenu, au-delà du simple dictionnaire statique.

- **Idée C (Exploration) :** Génération procédurale de cartes "Thème" contextuelles ou validation sémantique avancée ("Ce mot est-il valide pour le thème 'Cuisine du monde' ?").
- **Risque :** Latence et coût API.
- **Stratégie :** Prototypage en V2 pour enrichir la variété des parties sans alourdir le client.

### Journey Requirements Summary

1.  **Rôle "Host" :** Privilège unique pour lancer la partie (start game trigger) et configurer la room.
2.  **Smart Sharing :** Logique conditionnelle (Mobile Share Sheet vs Desktop Clipboard) + Deep Linking robuste (Intent Web Browser).
3.  **State-Aware Reconnection :** Logique client capable de déterminer l'état du jeu (En cours vs Fini) au moment de la reconnexion et d'adapter l'UI (Joueur vs Spectateur).
4.  **Session Persistence :** Utilisation de `localStorage` pour stocker un token de session et permettre la ré-identification sans compte utilisateur.
5.  **Admin Back-Office :** Accès direct aux données (Supabase Dashboard) suffisant pour la V1 pour gérer la Allowlist.
