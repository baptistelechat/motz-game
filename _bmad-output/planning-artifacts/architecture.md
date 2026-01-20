---
stepsCompleted:
  - step-01-init
  - step-02-context
  - step-03-starter
  - step-04-decisions
  - step-05-patterns
  - step-06-structure
  - step-07-validation
  - step-08-complete
status: "completed"
inputDocuments:
  - product-brief-motz-game-2026-01-12.md
  - prd.md
workflowType: "architecture"
project_name: "motz-game"
user_name: "Baptiste"
date: "2026-01-13"
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
Le système doit supporter des sessions de jeu multijoueurs en temps réel avec une latence minimale. L'architecture doit gérer :

- **Lobby & Matchmaking :** Création de rooms privées, partage via URL/QR Code sans authentification préalable.
- **Gameplay Synchrone :** Diffusion d'états de jeu (cartes, timers) et réception d'inputs (mots) avec arbitrage serveur immédiat.
- **Gestion de Session :** Identification par token (localStorage) pour permettre la reconnexion transparente ("Ghost Protocol") sans compte utilisateur.
- **Modération Automatisée :** Filtrage des mots (dictionnaire + profanité) et mécanismes de vote-kick.

**Non-Functional Requirements:**

- **Performance :** Latence perçue minimale (< 100ms idéalement) pour l'équité du jeu de rapidité.
- **Fiabilité :** Tolérance aux pannes réseau (reconnexion automatique sans perte d'état de jeu).
- **Coût :** Architecture optimisée pour le coût zéro (Free Tier friendly, Serverless).
- **Accessibilité :** Mobile-first, compatible tous navigateurs modernes sans installation.

**Scale & Complexity:**
Le projet présente une complexité technique ciblée sur la synchronisation et la robustesse réseau.

- Primary domain: Web Real-Time Multiplayer
- Complexity level: Medium
- Estimated architectural components: ~4-5 (Client, Edge Functions/Server, DB/State Store, Realtime Engine)

### Technical Constraints & Dependencies

- **Stack imposée (implicite/suggérée) :** Next.js (React) pour le frontend, Supabase pour le backend (Auth anonyme, DB, Realtime).
- **Contrainte Budgétaire :** Zéro coût fixe.
- **Dépendances externes :** Dictionnaires de mots (API ou local), Services de filtrage de profanité.

### Cross-Cutting Concerns Identified

1.  **State Synchronization :** Garantir que tous les clients voient le même état de jeu au même moment (Single Source of Truth côté serveur).
2.  **Network Resilience :** Gestion gracieuse des déconnexions/reconnexions (The Ghost Protocol).
3.  **Security & Validation :** "Never trust the client" - toute logique de validation de mot et de points doit être serveur.
4.  **No-Auth Identity :** Gestion de l'identité éphémère et de la persistance de session sans base utilisateur classique.

## Starter Template Evaluation

### Primary Technology Domain

Web Full-Stack (Next.js + Supabase) based on project requirements analysis.

### Starter Options Considered

- **Razikus/supabase-nextjs-template:** Trop riche (SaaS focus, Stripe, I18n) pour un jeu simple. Risque de "bloat".
- **Vercel/Next.js with-supabase (Officiel):** Léger, à jour, focus sur l'intégration Auth/DB correcte. Idéal comme fondation propre.
- **Makerkit:** Trop orienté SaaS Enterprise.

### Selected Starter: Official Next.js with Supabase (Adapted)

**Rationale for Selection:**
Le projet nécessite une fondation légère et flexible pour construire une logique de jeu temps réel spécifique. Le starter officiel garantit la meilleure implémentation de l'Auth SSR avec Next.js App Router. Nous l'adaptons pour utiliser PNPM, Shadcn/UI et une suite de tests robuste.

**Initialization Command:**

```bash
pnpm create next-app -e with-supabase .
```

**Architectural Decisions Provided by Starter & Setup:**

**Language & Runtime:**

- TypeScript (Strict mode)
- Node.js (LTS) / Edge Runtime compatible

**Styling Solution:**

- Tailwind CSS (Configuré)
- PostCSS
- **shadcn/ui** (Ajout manuel impératif post-CHARGEMENT DU SYSTEME)

**Build Tooling:**

- Next.js (Webpack/Turbopack)
- **PNPM** (Package Manager)

**Testing Framework:**

- **Vitest** (Unit/Integration) - À configurer
- **React Testing Library** (Component Testing) - À configurer
- **Playwright** (E2E Testing) - À configurer pour garantir la robustesse critique du gameplay

**Code Organization:**

- Next.js App Router structure (`/app`)
- Supabase Client utilities separation (`server`, `client`, `middleware`)

**Development Experience:**

- Fast Refresh
- Local Supabase development capability

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**

- **Data Architecture:** Utilisation de PostgreSQL + Supabase Realtime comme source de vérité.
- **Word Validation Strategy:** Approche optimiste hybride (Client + Serveur).
- **Auth Strategy:** Authentication Anonyme persistante.

### Data Architecture

- **State Source of Truth:** **Option A (Supabase Database).**
  - **Rationale:** Les tables PostgreSQL (`games`, `rounds`, `players`) détiennent l'état officiel. Les clients écoutent les changements via Supabase Realtime (`postgres_changes`). Cela garantit la cohérence, simplifie la gestion des déconnexions (l'état est persisté), et évite les problèmes de migration d'hôte.
  - **Version:** Supabase Realtime v2.
  - **Implications:** Nécessite des tables optimisées et des Row Level Security (RLS) strictes.

### Validation & Game Logic

- **Word Validation:** **Approche Hybride (Optimiste + Serveur).**
  - **Rationale (Recommandation pour Baptiste) :** Pour maximiser le "fun" et la réactivité :
    1.  **Client (Feedback immédiat) :** Un Bloom Filter ou un petit dictionnaire compressé (~2-3MB) est chargé côté client. Il permet de dire INSTANTANÉMENT "Ce mot n'existe pas" (rouge) sans appel réseau.
    2.  **Serveur (Autorité) :** Si le mot passe le filtre client, il est envoyé au serveur. Le serveur (Edge Function) vérifie contre le dictionnaire complet officiel et attribue les points.
  - **Pourquoi ?** Évite la frustration d'attendre 200ms pour savoir qu'on a fait une faute de frappe. Réduit la charge serveur (pas d'appel pour "azerty").
- **Data Integrity:** **Zod.**
  - **Usage:** Validation runtime stricte pour :
    1.  **RPC/API Inputs:** Vérifier que les données envoyées au serveur (ex: mot soumis) sont conformes.
    2.  **Environment Variables:** Crash immédiat au build si une clé API manque (`t3-env` style).
    3.  **Supabase Response:** Garantir que les objets reçus via Realtime correspondent aux types TypeScript attendus.

### Authentication & Security

- **Auth Method:** **Supabase Anonymous Auth.**
  - **Rationale:** Les joueurs ne créent pas de compte. On utilise `signInAnonymously()` de Supabase. Cela génère un JWT valide et un UUID unique qui persiste tant que le `localStorage` n'est pas vidé, permettant la reconnexion ("Ghost Protocol").
- **Security Model:** **RLS (Row Level Security).**
  - Tout accès DB passe par RLS. Un joueur ne peut modifier QUE ses propres inputs (`insert into user_words`). Seul le système (via Database Functions `security definer`) peut mettre à jour le score ou l'état de la manche.

### API & Communication Patterns

- **Game Loop Communication:**
  - **Client -> Serveur (Actions):** Appels RPC (Remote Procedure Calls) via Supabase Client (`rpc('submit_word', { word })`). Plus rapide et sécurisé que des INSERT directs pour la logique métier.
  - **Serveur -> Client (État):** Subscription Supabase Realtime sur la table `games:id`.

### Frontend Architecture

- **State Management:** **Zustand.**
  - **Rationale :** Bien que l'état source soit la DB, Zustand est supérieur à React Context pour la performance (selectors pour éviter les re-renders inutiles lors des mises à jour fréquentes comme le timer ou les scores) et la séparation de la logique.
- **Routing:** Next.js App Router dynamique (`/game/[roomId]`).

### Infrastructure & Deployment

- **Hosting:** Vercel (Frontend + Edge Functions).
- **Database:** Supabase (Managed Postgres).
- **CI/CD:** GitHub Actions (pour lancer Vitest et Playwright avant deploy).

### Decision Impact Analysis

**Implementation Sequence:**

1.  Setup Project (Next.js + Supabase + Tests).
2.  Database Schema (Tables `games`, `players` + RLS).
3.  Auth Anonyme Flow.
4.  Realtime Subscription Hook.
5.  Game Loop RPCs (Start, Submit Word).
6.  UI Implementation (Shadcn).

**Cross-Component Dependencies:**
Le choix de "Database as Source of Truth" signifie que le Frontend est purement réactif. Il affiche ce que la DB dit. Toute action utilisateur est un RPC vers la DB.

## Implementation Patterns & Standards

### Naming Conventions & Code Style

- **Database:** `snake_case` (Standard PostgreSQL).
  - Tables: `games`, `players`, `rounds`.
  - Columns: `created_at`, `is_active`.
- **Files & Directories:** `kebab-case` (Standard Next.js).
  - Components: `components/game-board.tsx`.
  - Pages: `app/game/[id]/page.tsx`.
- **React Components:** `PascalCase`.
  - `export function GameBoard() { ... }`
- **Functions & Variables:** `camelCase`.
  - `const submitWord = async () => { ... }`
- **Zod Schemas:** `camelCase` with `Schema` suffix.
  - `const joinGameSchema = z.object({ ... })`

### State Management Patterns (Zustand)

- **Store Structure:** Single atomic store per domain logic vs Slice pattern.
  - **Decision:** Utiliser le **Slice Pattern** si le store dépasse 300 lignes.
  - **Naming:** `useGameStore`, `useUIStore`.
- **Selectors:**
  - **MANDATORY:** Always use atomic selectors to prevent re-renders.
  - ❌ `const { timer, score } = useGameStore()`
  - ✅ `const timer = useGameStore(s => s.timer)`
  - ✅ `const score = useGameStore(s => s.score)`

### Data Validation Patterns (Zod)

- **Schema Location:**
  - Shared schemas (Client/Server/DB types) -> `src/lib/schemas/`.
  - Form specific schemas -> Colocated with component.
- **Type Inference:**
  - Always infer TypeScript types from Zod schemas.
  - `export type JoinGameInput = z.infer<typeof joinGameSchema>`

### Supabase & Realtime Patterns

- **Service Layer Abstraction:**
  - Ne jamais appeler `supabase.rpc()` directement dans un composant UI.
  - Créer des hooks custom ou services: `services/game-service.ts` ou `hooks/use-game-actions.ts`.
- **Typing:**
  - Utiliser les types générés par `supabase gen types` (`Database` interface).
  - Caster les réponses Realtime avec Zod pour garantir la sûreté au runtime.

### Error Handling Strategy

- **User Feedback:**
  - Utiliser `sonner` (via Shadcn) pour les erreurs flottantes (ex: "Mot invalide").
- **Boundary:**
  - `try/catch` systématique dans les Server Actions / RPC calls.
  - Log des erreurs critiques (non-métier) dans la console (ou service de monitoring futur).

## Project Structure

### High-Level Requirements Mapping

Mapping des Epic/Features vers l'architecture physique :

- **Epic: Game Engine** -> `src/components/game/` + `supabase/functions/`
- **Epic: Multiplayer** -> `src/hooks/use-realtime.ts` + `src/store/game-store.ts`
- **Epic: Dictionary** -> `src/lib/dictionary/` (Bloom filter local) + `supabase/functions/validate-word/`
- **Epic: Identity** -> `src/lib/auth/` (Anonymous utils)

### Directory Tree

```
motz-game/
├── .github/                   # CI/CD Workflows
├── .vscode/                   # VSCode settings (debug, extensions)
├── supabase/                  # Supabase Configuration
│   ├── functions/             # Edge Functions (Validation, Scoring)
│   │   ├── validate-word/
│   │   └── _shared/           # Code partagé entre fonctions
│   ├── migrations/            # SQL Migrations (Schema, RLS)
│   ├── seed.sql               # Données initiales (Dev)
│   └── config.toml            # Config locale
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (game)/            # Route Group (Layout de jeu)
│   │   │   ├── game/[id]/
│   │   │   └── page.tsx       # Lobby / Home
│   │   ├── api/               # API Routes (si besoin, mais préférence RPC)
│   │   ├── layout.tsx         # Root Layout (Providers)
│   │   └── globals.css        # Tailwind imports
│   ├── components/            # React Components
│   │   ├── ui/                # Shadcn Primitives (Button, Card...)
│   │   ├── game/              # Game Specific (Board, Timer, Score)
│   │   │   ├── game-board.tsx
│   │   │   └── word-input.tsx
│   │   └── shared/            # Layouts, Navbar, Footer
│   ├── hooks/                 # Custom React Hooks
│   │   ├── use-game-store.ts  # Zustand Store
│   │   └── use-realtime.ts    # Supabase Subscription wrapper
│   ├── lib/                   # Utilities & Logic
│   │   ├── supabase/          # Clients (Server/Client)
│   │   ├── schemas/           # Zod Schemas (Shared)
│   │   ├── dictionary/        # Bloom Filter logic
│   │   └── utils.ts           # Helpers (cn, formatting)
│   ├── types/                 # TypeScript Definitions
│   │   └── database.types.ts  # Generated from Supabase
│   └── styles/                # Extra styles if needed
├── public/                    # Static Assets
│   └── dict/                  # Fichiers binaires dictionnaire (si chargés client)
├── tests/                     # Test Suites
│   ├── e2e/                   # Playwright
│   └── unit/                  # Vitest
├── env.ts                     # T3-env validation
├── components.json            # Shadcn Config
├── next.config.mjs            # Next.js Config
├── package.json               # Dependencies
└── tsconfig.json              # TypeScript Config
```

### Component Boundaries

- **`src/app`**: Routing et Data Fetching (Server Components) uniquement. Pas de logique métier complexe.
- **`src/components/game`**: Logique d'affichage et interaction utilisateur. Consomme le store Zustand.
- **`src/store`**: Cerveau du client. Gère l'état transitoire et la synchro optimiste.
- **`supabase/functions`**: Cerveau du serveur. Autorité finale pour les règles du jeu.

## Architecture Validation

### Coherence Check

- **✅ Tech Stack Synergy:** La combinaison Next.js (App Router) + Supabase est idéale pour le prototypage rapide et la scalabilité sans devops.
- **✅ State Management:** Le pivot vers **Zustand** corrige le risque de performance identifié avec Context.
- **✅ Type Safety:** L'ajout de **Zod** sécurise les frontières (API/DB) qui sont souvent les points de rupture dans les apps "loosely coupled" comme celle-ci.

### Requirements Coverage

| Requirement                  | Architectural Solution                         | Status     |
| :--------------------------- | :--------------------------------------------- | :--------- |
| **Real-time Multiplayer**    | Supabase Realtime + Optimistic UI              | ✅ Covered |
| **Zero Friction (No Login)** | Supabase Anonymous Auth (Ghost Protocol)       | ✅ Covered |
| **Instant Feedback**         | Hybrid Validation (Bloom Filter Client)        | ✅ Covered |
| **Zero Cost**                | Serverless Stack (Vercel + Supabase Free Tier) | ✅ Covered |
| **Cheating Prevention**      | Server-side Authority (Edge Functions)         | ✅ Covered |

### Identified Risks & Mitigations

1.  **Risk:** Taille du dictionnaire client (Bloom Filter).
    - **Mitigation:** Utiliser une compression aggressive (Brotli) et ne charger que le strict nécessaire (Bloom filter binaire, pas le texte).
2.  **Risk:** Latence Realtime.
    - **Mitigation:** UI Optimiste pour les actions du joueur local. Le joueur voit son action _immédiatement_, la confirmation serveur arrive après.

### Final Verdict

**🟢 APPROVED FOR IMPLEMENTATION**

L'architecture est cohérente, complète et répond aux contraintes du PRD. Elle fournit un guide clair pour les agents de développement.
