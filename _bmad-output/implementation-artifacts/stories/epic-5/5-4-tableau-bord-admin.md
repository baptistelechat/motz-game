# Story 5.4: Tableau de Bord Admin (Admin Dashboard)

**ID:** STORY-5-4
**Epic:** Epic 5 - Sécurité & Modération
**Priority:** Should Have
**Story Points:** 5

## User Story

As a administrateur du jeu,
I want visualiser les signalements et gérer la liste des mots autorisés (Allowlist/Blocklist),
So that maintenir la qualité du dictionnaire et traiter les problèmes.

## Acceptance Criteria

- [ ] **Route Admin Protégée** : La route `/admin` est accessible uniquement aux utilisateurs ayant le rôle `admin`.
- [ ] **Middleware & RLS** : Vérification stricte des permissions via Middleware et Row Level Security sur les tables sensibles.
- [ ] **Liste des Signalements** : Affichage paginé des derniers signalements (`player_reports`) avec détails (joueur, mot, raison, timestamp).
- [ ] **Actions de Modération** :
  - [ ] **Ignorer** : Marque le signalement comme traité sans action.
  - [ ] **Bannir Joueur** : Ajoute le joueur à une liste de bannissement (via ID ou IP si disponible/légal).
  - [ ] **Allowlist** : Ajoute le mot à une table `custom_dictionary` ou met à jour le statut du mot.
  - [ ] **Blocklist** : Ajoute le mot à la table des profanités/mots interdits.
- [ ] **Feedback Admin** : Confirmation visuelle après chaque action (Toast).

## Technical Notes

- **Modèle de Données** :
  - Nécessite un champ `role` ou `is_admin` dans la table `users` ou une table `admins`.
  - Table `player_reports` déjà existante (Story 5.3).
  - Tables `custom_dictionary` (mot, action: allow/block) à créer ou utiliser existante.
- **Sécurité** :
  - Utiliser `supabase.auth.getUser()` dans le middleware pour vérifier le rôle.
  - RLS sur `player_reports` : `select` autorisé seulement pour admin.
  - RLS sur `custom_dictionary` : `insert/update/delete` seulement pour admin.
- **UI** :
  - Utiliser un layout admin simple (table Shadcn).
  - Pas besoin du style "Pixel-Pop" complet, un style fonctionnel suffit, mais garder la cohérence globale.

## Dependencies

- Story 5.3 (Signalement de Mots) pour les données à modérer.
- Authentification (Epic 1).

## Definition of Done

- [ ] Code complete
- [ ] Tests written and passing (Unitaires sur les actions admin)
- [ ] Code reviewed
- [ ] Documentation updated (si changement de schéma DB)
- [ ] Deployed to development environment

## Tasks/Subtasks

- [x] **Database Setup**
  - [x] Create migration for `app_role` enum and `role` column in `players`.
  - [x] Create migration for `custom_dictionary` table.
  - [x] Implement RLS policies for `custom_dictionary` (admin full access, public read allowed).
  - [x] Update RLS policies for `player_reports` and `word_reports` to allow admin access.
  - [x] Verify database schema and policies.

- [x] **Middleware & Security**
  - [x] Update `middleware.ts` to check user role and protect `/admin` route.
  - [x] Create `is_admin` helper or utilize direct role check in components/actions.

- [x] **Frontend: Admin Layout**
  - [x] Create `src/app/admin/layout.tsx` with admin-specific styling (sidebar/navbar).
  - [x] Ensure only admins can access layout (redirect unauthorized).

- [x] **Frontend: Dashboard Page**
  - [x] Create `src/app/admin/page.tsx`.
  - [x] Implement `ReportsTable` component using Shadcn Table.
  - [x] Fetch data from `player_reports` and `word_reports`.

- [x] **Frontend: Moderation Actions**
  - [x] Implement "Ignore" action (mark as resolved/ignored).
  - [x] Implement "Ban Player" action (add to ban list/update status).
  - [x] Implement "Allowlist" action (add to `custom_dictionary` with action='allow').
  - [x] Implement "Blocklist" action (add to `custom_dictionary` with action='block').
  - [x] Add Toast notifications for feedback.

- [ ] **Testing & Verification**
  - [ ] Verify `/admin` route is inaccessible to non-admins.
  - [ ] Verify `/admin` route is accessible to admins.
  - [ ] Test all moderation actions.
  - [ ] Verify RLS policies prevent unauthorized access to data.

## Dev Notes

- **Architecture**: Admin dashboard is a separate domain, distinct from game flow.
- **Security**: Double check RLS policies. Middleware is first line of defense, RLS is second.
- **UI**: Prioritize functionality over aesthetics for admin panel. Use standard Shadcn components.
- **Database**: Migration `20260227000000_admin_dashboard.sql` created and APPLIED.
- **Middleware**: `src/middleware.ts` created and configured to protect `/admin` route using `role` field in `players` table.

## Dev Agent Record

### Debug Log

- Created migration file for admin tables and policies.
- Implemented middleware protection.
- Created Admin UI components.
- Added Dictionary Management UI.
- Applied database migration via Supabase MCP.

### Completion Notes

- Admin Dashboard implemented with Reports and Dictionary management.
- Middleware protection active.
- Database migration ready to be applied.

## File List

- supabase/migrations/20260227000000_admin_dashboard.sql
- src/lib/supabase/middleware.ts
- src/middleware.ts
- src/types/admin.types.ts
- src/app/admin/layout.tsx
- src/app/admin/page.tsx
- src/components/admin/reports-table.tsx
- src/components/admin/dictionary-table.tsx
- src/app/admin/dictionary/page.tsx

## Change Log

- Implemented Admin Dashboard and Dictionary Management

## Status

- Status: review
