---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
  - step-04-final-validation
inputDocuments:
  - prd.md
  - architecture.md
  - ux-design-specification.md
---

# motz-game - Décomposition des Épopées

## Vue d'ensemble

Ce document présente la décomposition complète des exigences du PRD, de l'Architecture et du Design UX en épopées (epics) et user stories implémentables pour le projet motz-game.

## Inventaire des Exigences

### Exigences Fonctionnelles (FR)

FR1: Synchronisation multijoueur temps réel via Supabase Realtime (État du jeu, Timer, Joueurs).
FR2: Architecture "Database as State" - Les tables Games, Rounds, Players sont la source de vérité.
FR3: Validation Serveur Stricte - Arbitrage basé sur le temps serveur et vérification dictionnaire côté serveur.
FR4: Validation Hybride - Bloom Filter côté client pour feedback instantané + Vérification autoritaire serveur.
FR5: Règle d'égalité (Tie Breaker) - Les soumissions avec < 50ms d'écart sont considérées comme égalité (points pour les deux).
FR6: Analyse Sémantique/Validation Thématique - Validation des cartes "Thème" (fallback tags si trop lent).
FR7: Scoring Risque/Récompense - Points bonus pour lettres rares ou contraintes optionnelles.
FR8: Système de Cartes - Support pour Lettres Imposées, Interdites et Cartes Spéciales (Thème, Inversion, Longueur Min).
FR9: Système de Signalement - Les joueurs peuvent signaler des faux positifs ou mots offensants.
FR10: Safe Mode - Filtre de profanité activé par défaut (Vérification côté serveur).
FR11: Mécanisme d'exclusion (Vote Kick) - Exclusion si > 50% des joueurs votent pour.
FR12: Gestion Déconnexion "The Ghost" - État inactif pour les joueurs déconnectés, reconnexion transparente.
FR13: Identité Anonyme - Pas de compte requis, identité via Pseudo + Sélection Avatar (persistance localStorage).
FR14: Gestion de Room - Création Room Privée, Partage Lien/QR Code, Salle d'attente (Lobby).
FR15: Expérience Lobby - Liste temps réel des joueurs, bascule "Prêt", contrôle lancement par l'Hôte.
FR16: UI Mobile First - Interface optimisée tactile et clavier virtuel (Focus Mode).
FR17: Feedback Immédiat - Animations visuelles pour Succès (Confettis), Échec (Secousse) et Latence (Envoi...).
FR18: Indicateur Qualité Réseau - Affichage statut ping/latence.
FR19: Tableau des Scores - Classement par Manche et Classement Global.

### Exigences Non-Fonctionnelles (NFR)

NFR1: Latence Input < 100ms pour une interaction perçue comme instantanée.
NFR2: Vitesse Matchmaking - Rejoindre instantanément via lien.
NFR3: Concurrence - Support ~100 joueurs simultanés (Contraintes Supabase Free Tier).
NFR4: Infrastructure Coût Zéro - Basé sur Vercel + Supabase Free Tier (Serverless).
NFR5: Compatibilité Cross-Device - Fonctionne sur Mobile (iOS/Android) et Desktop.
NFR6: Pas d'App Native - Expérience pur Web PWA.
NFR7: Minimisation RGPD - Pas de stockage de données personnelles, logs éphémères.
NFR8: Conformité DSA - Outils de modération et signalement accessibles.
NFR9: Protection des Mineurs - Filtrage strict profanité et interactions limitées (pas de chat).

### Exigences Additionnelles

**Architecture :**

- AR1: Tech Stack : Next.js 15 (App Router), Supabase (Auth, DB, Realtime), Tailwind CSS 4, Shadcn/UI, Zustand, Zod.
- AR2: **STARTER TEMPLATE** : `pnpm create next-app -e with-supabase .`
- AR3: Outillage Build : PNPM, Vitest (Unitaire), Playwright (E2E).
- AR4: Stratégie Auth : Supabase Anonymous Auth (UUID persisté dans localStorage).
- AR5: Sécurité : RLS (Row Level Security) appliqué sur toutes les tables DB.
- AR6: Pattern Communication : RPC pour actions (Soumettre, Rejoindre), Subscription Realtime pour mises à jour état.
- AR7: Gestion État : Zustand avec sélecteurs atomiques pour performance.
- AR8: Gestion Erreurs : Sonner pour toasts UI, Try/Catch dans Server Actions.
- AR9: Structure Dossiers : séparation stricte `supabase/functions` (Logique) et `src/store` (État Client).

**Design UX :**

- UX1: Design System : "Pixel-Pop Hybrid" (Fonctionnalités Shadcn + Style Custom Tailwind "Neo-Retro").
- UX2: Style Visuel : Politique "Zero-Radius", Bordures Épaisses (border-4), Ombres Dures (Neo-Retro 8-bit).
- UX3: Typographie : "Press Start 2P" (Titres), "VT323" (Corps/Input).
- UX4: Palette Couleurs : Deep Arcade Blue (#121220), Neon Green (#39FF14), Magenta (#FF00FF), Yellow (#FFFF00).
- UX5: Feedback Audio : Sons 8-bit pour Validation (Arpège), Échec (Bloop), Timer (Accélération).
- UX6: Feedback Haptique : Patterns API Vibration (Succès : Tic Net, Échec : Lourd).
- UX7: Mobile "Focus Mode" : Sticky Top (Contraintes/Timer) et Sticky Bottom (Input) pour gérer le clavier.
- UX8: UI Optimiste : État "Envoi..." (Jaune) immédiatement après validation locale.
- UX9: Animation Lobby : Les Avatars "pop" quand les joueurs rejoignent.

### Carte de Couverture FR

FR1: Epic 3 - Synchronisation multijoueur
FR2: Epic 2 & Epic 3 - Database as State
FR3: Epic 3 - Validation Serveur
FR4: Epic 3 - Validation Hybride
FR5: Epic 3 - Tie Breaker
FR6: Epic 5 - Validation Thématique
FR7: Epic 4 - Scoring
FR8: Epic 3 - Système de Cartes
FR9: Epic 5 - Signalement
FR10: Epic 5 - Safe Mode
FR11: Epic 5 - Vote Kick
FR12: Epic 2 - Gestion Déconnexion
FR13: Epic 1 - Identité Anonyme
FR14: Epic 2 - Gestion de Room
FR15: Epic 2 - Lobby
FR16: Epic 1 & Epic 3 - UI Mobile First
FR17: Epic 3 - Feedback Immédiat
FR18: Epic 4 - Indicateur Réseau
FR19: Epic 4 - Tableau des Scores

## Liste des Épopées

### Epic 1: Fondations & Identité Joueur (Le Ticket d'Entrée)

Permettre à un joueur d'arriver sur le site, d'avoir une identité anonyme persistante et de voir l'interface de base.
**FRs couverts:** FR13, FR16, NFR4, NFR5, NFR6, NFR7

### Epic 2: Gestion de Salle & Lobby (Le Rassemblement)

Permettre de créer une salle privée, d'inviter des amis via un lien et de se voir dans le lobby.
**FRs couverts:** FR14, FR15, FR12, FR2, NFR2

### Epic 3: Moteur de Jeu Core (Le Déclic Cognitif)

Jouer une manche complète : recevoir des contraintes, soumettre un mot, et avoir un gagnant.
**FRs couverts:** FR1, FR2, FR3, FR4, FR5, FR8, FR17, NFR1

### Epic 4: Système de Scoring & Progression (La Compétition)

Gérer le score, les classements, les bonus et la fin de partie.
**FRs couverts:** FR19, FR7, FR18

### Epic 5: Sécurité & Modération (L'Espace Sain)

Protéger les joueurs contre la toxicité et la triche.
**FRs couverts:** FR9, FR10, FR11, FR6, NFR8, NFR9

## Epic 1: Fondations & Identité Joueur

Permettre à un joueur d'arriver sur le site, d'avoir une identité anonyme persistante et de voir l'interface de base.

### Story 1.1: Initialisation Projet & Infrastructure

As a développeur (et futur joueur),
I want que le projet soit initialisé avec la stack technique définie (Next.js, Supabase, Shadcn/Tailwind),
So that pouvoir commencer à développer les fonctionnalités sur des bases solides et cohérentes.

**Acceptance Criteria:**

**Given** un environnement de développement local
**When** j'exécute le script d'initialisation
**Then** une application Next.js 15 fonctionnelle est créée avec le template `with-supabase`
**And** Tailwind CSS 4 est configuré avec les couleurs du thème (Deep Arcade Blue, Neon Green, Magenta, Yellow)
**And** Shadcn/UI est installé et configuré
**And** la police "Press Start 2P" et "VT323" sont importées et utilisables
**And** le projet se lance sans erreur avec `pnpm dev`

### Story 1.2: Landing Page & Mode Mobile First

As a joueur sur mobile,
I want une interface d'accueil qui s'adapte parfaitement à mon écran avec le "Focus Mode",
So that pouvoir naviguer confortablement sans que le clavier virtuel ne masque les éléments importants.

**Acceptance Criteria:**

**Given** un utilisateur arrivant sur la racine du site
**When** la page se charge
**Then** le layout principal est affiché avec le style "Pixel-Pop" (Bordures épaisses, Ombres dures)
**And** sur mobile, la structure respecte le "Focus Mode" (Header sticky en haut, Zone d'action sticky en bas)
**And** la typographie utilise "Press Start 2P" pour les titres et "VT323" pour le texte
**And** le manifest PWA est configuré (icône, couleur de thème) pour permettre l'installation
**And** un Service Worker basique est configuré pour mettre en cache les assets statiques (fonts, images)

### Story 1.3: Système d'Authentification Anonyme

As a nouveau joueur,
I want être identifié automatiquement sans créer de compte (email/password),
So that pouvoir rejoindre une partie immédiatement (Friction Zero).

**Acceptance Criteria:**

**Given** un visiteur sans session active
**When** il arrive sur l'application
**Then** une authentification anonyme Supabase est déclenchée silencieusement
**And** un `user_id` unique (UUID) est généré et stocké dans la session
**And** cet identifiant persiste entre les rechargements de page (via localStorage/cookie session Supabase)
**And** aucune information personnelle (email, tel) n'est demandée

### Story 1.4: Gestion Profil (Pseudo & Avatar)

As a joueur identifié,
I want choisir un pseudo et un avatar,
So that me différencier des autres joueurs dans le lobby.

**Acceptance Criteria:**

**Given** un joueur authentifié anonymement
**When** il remplit le formulaire de profil (Pseudo + Sélection Avatar)
**Then** une entrée est créée/mise à jour dans la table `public.players` de Supabase
**And** la table `players` est créée avec les colonnes : `id` (PK, ref auth.users), `pseudo`, `avatar_config`, `last_seen`
**And** une politique RLS (Row Level Security) est appliquée : un utilisateur ne peut modifier que sa propre ligne
**And** le pseudo est validé (longueur min/max, pas de profanité basique)

## Epic 2: Gestion de Salle & Lobby

Permettre de créer une salle privée, d'inviter des amis via un lien et de se voir dans le lobby.

### Story 2.1: Création de Salle (Room) & Routage

As a joueur hôte,
I want créer une nouvelle salle de jeu privée avec un code sécurisé,
So that pouvoir inviter mes amis sans que des inconnus ne devinent le code.

**Acceptance Criteria:**

**Given** un joueur authentifié sur la page d'accueil
**When** il clique sur "Créer une partie"
**Then** une nouvelle entrée est créée dans la table `public.games` avec un `status` = 'LOBBY'
**And** un `code` unique et non-prédictible est généré (ex: 6 caractères alphanumériques aléatoires `A7x9P2`, pas de séquence logique)
**And** le joueur est automatiquement redirigé vers l'URL `/room/[code]`
**And** le joueur est défini comme `host_id` de la partie
**And** la table `games` est créée avec les champs nécessaires

### Story 2.2: Rejoindre une Salle (Lobby Realtime)

As a joueur invité,
I want rejoindre une salle via son code ou son lien et voir les autres arriver,
So that confirmer que je suis au bon endroit avant que la partie commence.

**Acceptance Criteria:**

**Given** un joueur avec un lien de partage ou un code valide
**When** il accède à l'URL `/room/[code]`
**Then** l'application vérifie si la salle existe et est en statut 'LOBBY'
**And** si valide, une entrée est créée dans la table de liaison `game_players` (`game_id`, `player_id`)
**And** la liste des joueurs présents s'affiche et se met à jour en temps réel (Supabase Realtime `INSERT`/`DELETE` sur `game_players`)
**And** une animation "Pop" (UX9) se joue à l'arrivée de chaque nouvel avatar
**And** si la salle n'existe pas ou est déjà lancée, un message d'erreur explicite est affiché

### Story 2.3: Gestion État "Prêt" & Lancement

As a joueur (et Hôte pour le lancement),
I want signaler que je suis prêt et voir quand tout le monde l'est,
So that synchroniser le début de la partie.

**Acceptance Criteria:**

**Given** plusieurs joueurs dans le lobby
**When** un joueur clique sur le bouton "Prêt"
**Then** son statut `is_ready` passe à `true` dans `game_players` et l'UI se met à jour pour tous (indicateur vert)
**And** le bouton "Lancer la partie" n'est visible/actif QUE pour l'Hôte (`host_id`)
**And** l'Hôte ne peut cliquer sur "Lancer" QUE si tous les joueurs présents sont `is_ready`
**And** au lancement, le statut de la `games` passe à 'PLAYING', ce qui déclenche la navigation vers l'écran de jeu pour tous les connectés (via écouteur Realtime)

## Epic 3: Moteur de Jeu Core

Jouer une manche complète : recevoir des contraintes, soumettre un mot, et avoir un gagnant.

### Story 3.1: Initialisation Manche & Distribution Cartes

As a joueur,
I want recevoir une combinaison variée de contraintes (Lettres, Thèmes, Règles Spéciales),
So that rendre chaque manche unique et stimulante.

**Acceptance Criteria:**

**Given** une partie active
**When** une manche est générée
**Then** le système tire au sort des cartes parmi les types supportés : Lettre Imposée, Lettre Interdite, Thème (ex: "Animaux"), Contrainte Spéciale (ex: "Longueur Min 7", "Commence par...")
**And** la structure de données JSON dans `rounds` supporte ces types (`type: 'letter_must' | 'letter_forbidden' | 'theme' | 'rule'`, `value: string`)
**And** l'interface affiche les cartes avec un design distinct pour chaque type (ex: Bordure Rouge pour Interdit, Bleu pour Thème)
**And** tous les joueurs voient exactement la même combinaison de cartes

### Story 3.2: Input Joueur & Validation Locale (Bloom Filter)

As a joueur,
I want savoir instantanément si mon mot est valide (orthographe + contraintes simples),
So that ne pas perdre de temps à soumettre un mot incorrect.

**Acceptance Criteria:**

**Given** un joueur saisissant un mot
**When** il tape ou valide son mot
**Then** une validation locale vérifie : 1. La présence dans le dictionnaire (via Bloom Filter) 2. Le respect des lettres imposées/interdites 3. Le respect de la longueur minimale (si carte présente)
**And** si invalide, une animation "Secousse" (Shake) et un feedback visuel rouge apparaissent
**And** si valide localement, le mot est prêt à être envoyé (état "Optimiste")
**Note** La validation sémantique (Thème) n'est PAS faite ici (trop lourd/complexe pour le client), elle est déléguée au serveur ou ignorée en mode "fallback"

### Story 3.3: Soumission & Arbitrage Serveur

As a système,
I want valider et scorer toutes les soumissions reçues pendant la manche,
So that récompenser tous les joueurs méritants, pas seulement le plus rapide.

**Acceptance Criteria:**

**Given** des soumissions reçues de plusieurs joueurs
**When** le serveur traite les requêtes
**Then** chaque mot valide est enregistré avec son timestamp et son score calculé
**And** le score prend en compte : la validité, la rareté (FR7), et l'ordre d'arrivée (points dégressifs : 1er = Max, 2ème = Max-X, etc.)
**And** la manche continue jusqu'à ce que la condition de fin soit atteinte (Timer écoulé ou Tous les joueurs ont trouvé)

### Story 3.4: Résolution Manche & Feedback

As a joueur,
I want voir le classement de la manche et les mots trouvés par tous,
So that comparer ma performance à celle des autres.

**Acceptance Criteria:**

**Given** une manche terminée
**When** l'état passe à 'FINISHED'
**Then** un tableau récapitulatif de la manche s'affiche
**And** il liste **tous les joueurs** ayant trouvé un mot valide, avec leur mot et les points gagnés
**And** les points sont ajoutés au score global de la partie
**And** le "Vainqueur de la manche" (celui avec le plus de points sur cette manche) est mis en avant visuellement
**And** après délai, passage à la manche suivante

## Epic 4: Système de Scoring & Progression

Gérer le score, les classements, les bonus et la fin de partie.

### Story 4.1: Moteur de Calcul de Score Avancé

As a système,
I want calculer le score avec précision en intégrant les bonus,
So that valoriser la prise de risque (mots longs, lettres rares).

**Acceptance Criteria:**

**Given** un mot soumis valide
**When** le serveur calcule le score
**Then** des points de base sont attribués selon la longueur du mot
**And** un multiplicateur de rareté est appliqué pour les lettres difficiles (Scrabble-like)
**And** un bonus de rapidité dégressif est ajouté selon l'ordre d'arrivée
**And** le score total est retourné et ajouté au score du joueur

### Story 4.2: Tableau des Scores Global (Leaderboard)

As a joueur,
I want voir le classement général à tout moment,
So that savoir qui mène la partie.

**Acceptance Criteria:**

**Given** une partie en cours
**When** je consulte le score (Drawer ou Modal)
**Then** la liste des joueurs est affichée triée par score total décroissant
**And** la mise à jour est temps réel après chaque manche
**And** une animation souligne les changements de position

### Story 4.3: Indicateur de Qualité Réseau (Ping)

As a joueur,
I want voir la qualité de ma connexion,
So that comprendre si mes lenteurs viennent de moi ou du serveur.

**Acceptance Criteria:**

**Given** un joueur en partie
**When** la latence réseau fluctue
**Then** une icône (Vert/Orange/Rouge) indique la qualité de la connexion dans le header
**And** la valeur exacte en ms est visible au survol/tap
**And** un message "Reconnexion..." s'affiche si la connexion est perdue

### Story 4.4: Fin de Partie & Podium

As a joueur,
I want une célébration claire du vainqueur à la fin de la partie,
So that avoir une conclusion satisfaisante au match.

**Acceptance Criteria:**

**Given** la dernière manche terminée
**When** la partie se conclut
**Then** un écran de fin s'affiche avec le podium (1er, 2ème, 3ème) animé
**And** des statistiques récapitulatives sont affichées (Meilleur mot, Plus rapide, etc.)
**And** un bouton "Rejouer" permet de relancer une partie avec les mêmes joueurs
**And** un bouton "Quitter" permet de retourner à l'accueil

## Epic 5: Sécurité & Modération

Protéger les joueurs contre la toxicité et la triche.

### Story 5.1: Filtre de Profanité (Safe Mode)

As a système,
I want bloquer automatiquement les mots offensants,
So that maintenir un environnement de jeu sain par défaut.

**Acceptance Criteria:**

**Given** un mot soumis
**When** il est validé par le serveur
**Then** il est comparé à une liste noire de profanités
**And** si match, le mot est rejeté (même si valide dans le dictionnaire)
**And** le joueur reçoit un feedback discret "Mot inapproprié"

### Story 5.2: Vote d'Exclusion (Vote Kick) & Réputation

As a joueur,
I want proposer l'exclusion d'un joueur toxique et identifier les récidivistes,
So that le groupe puisse s'autoréguler et éviter les perturbateurs.

**Acceptance Criteria:**

**Given** un joueur perturbateur dans une partie
**When** un autre joueur initie un vote d'exclusion via le menu contextuel
**Then** tous les autres joueurs reçoivent une notification de vote
**And** si > 50% des joueurs votent "Oui", le joueur est déconnecté et banni de la room (Session Ban)
**And** l'événement est enregistré dans une table d'historique `player_reports` avec un timestamp
**And** le système de réputation calcule les exclusions actives sur une période glissante (ex: **7 jours**)
**And** dans le Lobby, les joueurs ayant > 3 exclusions actives sont marqués d'un icône d'avertissement "⚠️"
**And** les exclusions plus anciennes que la période définie sont ignorées ("Droit à l'oubli")
**Note** Ce système de réputation est contournable si le joueur vide son localStorage (reset compte), mais cela lui fait aussi perdre sa progression/stats, ce qui constitue une pénalité indirecte.

### Story 5.3: Signalement de Mots (Feedback Loop)

As a joueur,
I want signaler un mot validé à tort (faux positif) ou offensant qui est passé,
So that améliorer le dictionnaire du jeu.

**Acceptance Criteria:**

**Given** un mot affiché dans le récapitulatif de manche
**When** je clique sur "Signaler"
**Then** un signalement est envoyé aux logs administrateur
**And** cela n'annule pas les points de la manche en cours (pour éviter les abus anti-jeu)
**And** le joueur reçoit une confirmation "Signalement envoyé"
