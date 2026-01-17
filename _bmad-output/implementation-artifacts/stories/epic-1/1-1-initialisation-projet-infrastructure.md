# Story 1.1: Initialisation Projet & Infrastructure

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a développeur (et futur joueur),
I want que le projet soit initialisé avec la stack technique définie (Next.js, Supabase, Shadcn/Tailwind),
so that pouvoir commencer à développer les fonctionnalités sur des bases solides et cohérentes.

## Acceptance Criteria

1. **Given** un environnement de développement local
2. **When** j'exécute le script d'initialisation
3. **Then** une application Next.js 15 fonctionnelle est créée avec le template `with-supabase`
4. **And** Tailwind CSS 4 est configuré avec les couleurs du thème (Deep Arcade Blue, Neon Green, Magenta, Yellow)
5. **And** Shadcn/UI est installé et configuré
6. **And** la police "Press Start 2P" et "VT323" sont importées et utilisables
7. **And** le projet se lance sans erreur avec `pnpm dev`

## Tâches / Sous-tâches

- [x] Tâche 1 : Initialiser le projet (AC: 1, 2, 3)
  - [x] Exécuter `pnpm create next-app -e with-supabase .`
  - [x] S'assurer que TypeScript, ESLint, Tailwind CSS sont sélectionnés/configurés.
  - [x] Mettre à jour les métadonnées de `package.json` (nom, version, etc.).
- [x] Tâche 2 : Configurer Tailwind CSS & Design System (AC: 4)
  - [x] Définir les couleurs du thème dans `globals.css` / config Tailwind (Deep Arcade Blue, Neon Green, Magenta, Yellow).
  - [x] Implémenter la politique "Zero-Radius" (`rounded-none`).
  - [x] Configurer les bordures épaisses (`border-4`) et les ombres dures.
- [x] Tâche 3 : Installer & Configurer Shadcn/UI (AC: 5)
  - [x] Exécuter `npx shadcn@latest init`.
  - [x] Configurer `components.json` pour correspondre à la structure du projet (`components/ui`, `lib/utils`).
  - [x] Ajouter des composants de base si nécessaire pour les tests (Button, Card, Badge, Checkbox, Input, Label).
- [x] Tâche 4 : Configurer la Typographie (AC: 6)
  - [x] Installer `next/font` ou Google Fonts.
  - [x] Configurer "Press Start 2P" (Titres) et "VT323" (Corps/Input).
  - [x] Appliquer les polices globalement via `layout.tsx` ou `globals.css`.
- [x] Tâche 5 : Mettre en place la structure du projet (AC: 3, 7)
  - [x] Créer la structure des dossiers : `components/game`, `store`, `supabase/functions`, `hooks`, `lib`, `types`, `tests`.
  - [x] Nettoyer les pages par défaut du boilerplate.
- [x] Tâche 6 : Vérification (AC: 7)
  - [x] Exécuter `pnpm dev`.
  - [x] Vérifier que la page d'accueil se charge avec les bonnes polices et couleurs.
  - [x] Vérifier la console pour les erreurs.
- [x] Tâche 7 : Infrastructure de Tests (AC: 7)
  - [x] Installer et configurer Vitest pour les tests unitaires.
  - [x] Installer et configurer Playwright pour les tests E2E.
  - [x] Ajouter les scripts de test au `package.json`.
  - [x] Vérifier le fonctionnement avec un test exemple.

## Notes de développement

- **Architecture :** Next.js 15 App Router, Supabase (Auth, DB, Realtime), Tailwind CSS 4, Shadcn/UI.
- **Style :** "Pixel-Pop Hybrid" - combiner l'accessibilité de Shadcn avec les styles personnalisés "Neo-Retro" de Tailwind.
- **Tests :** S'assurer que `vitest` et `playwright` sont configurés (la Tâche 1 pourrait inclure une configuration de base, sinon ajouter une tâche spécifique si non couvert par le template). Note : Le template `with-supabase` pourrait ne pas inclure Vitest/Playwright par défaut, il faudra les ajouter.

### Notes sur la structure du projet

- Suivre strictement l'arborescence définie dans `architecture.md`.
- `src/app` pour le routage uniquement (Structure standard Next.js avec `src`).
- `src/components/game` pour les composants logiques du jeu.
- `supabase/functions` pour les Edge Functions (Hors src).

### Références

- [Epics: Story 1.1](file:///c:\Users\ASUS\Desktop\DEV\Projet_perso\motz-game_bmad-output\planning-artifacts\epics.md#L134)
- [Architecture: Starter Template](file:///c:\Users\ASUS\Desktop\DEV\Projet_perso\motz-game_bmad-output\planning-artifacts\architecture.md#L76)
- [Architecture: Arborescence](file:///c:\Users\ASUS\Desktop\DEV\Projet_perso\motz-game_bmad-output\planning-artifacts\architecture.md#L255)
- [UX Specification: Règles Visuelles](file:///c:\Users\ASUS\Desktop\DEV\Projet_perso\motz-game_bmad-output\planning-artifacts\ux-design-specification.md#L208)

## Dev Agent Record

### Agent Model Used

Gemini-3-Pro-Preview

### Debug Log References

### Completion Notes List

- Migrated project structure to use `src/` directory for better organization.
- Enforced Pixel-Pop Design System (Zero-Radius, Thick Borders) on UI components (Card, Badge, Dropdown).
- Updated package.json metadata.
- Verified all tests pass.

### File List

- src/app/globals.css
- src/app/layout.tsx
- src/components/ui/button.tsx
- src/components/ui/card.tsx
- src/components/ui/input.tsx
- src/components/ui/badge.tsx
- src/components/ui/dropdown-menu.tsx
- package.json
- tsconfig.json
- vitest.config.ts
- components.json

### Test Results

- Unit Tests: 15/15 Passed (Vitest)
- E2E Tests: 3/3 Passed (Playwright)
