# Story 1.3: Système d'Authentification Anonyme

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a nouveau joueur,
I want être identifié automatiquement sans créer de compte (email/password),
so that pouvoir rejoindre une partie immédiatement (Friction Zero).

## Acceptance Criteria

1. **Given** un visiteur sans session active
   **When** il arrive sur l'application
   **Then** une authentification anonyme Supabase est déclenchée silencieusement

2. **And** un `user_id` unique (UUID) est généré et stocké dans la session

3. **And** cet identifiant persiste entre les rechargements de page (via localStorage/cookie session Supabase)

4. **And** aucune information personnelle (email, tel) n'est demandée

## Tasks / Subtasks

- [ ] Configuration Supabase (AC: 1)
  - [ ] Vérifier/Activer "Enable Anonymous Sign-ins" dans le projet Supabase (ou `config.toml` si local)
  - [ ] Configurer les variables d'environnement (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) dans `.env.local` (si pas déjà fait)

- [ ] Implémentation Clients Supabase (AC: 1, 3)
  - [ ] Créer/Vérifier `src/lib/supabase/client.ts` (Browser Client)
  - [ ] Créer/Vérifier `src/lib/supabase/server.ts` (Server Client - utile pour le futur)

- [ ] Hook d'Authentification (AC: 1, 2, 4)
  - [ ] Créer `src/hooks/use-anonymous-auth.ts`
  - [ ] Implémenter la logique : vérifier session ? si non -> `signInAnonymously()`
  - [ ] Gérer les états de chargement (`isLoading`, `user`, `error`)

- [ ] Intégration Global (AC: 1)
  - [ ] Intégrer le hook dans un composant racine (ex: `AuthProvider` ou `src/app/layout.tsx`) pour garantir l'auth dès l'arrivée
  - [ ] Afficher un indicateur discret (ex: log console ou petit dot status dev) pour confirmer la connexion

- [ ] Tests (AC: 2, 3)
  - [ ] Test Unitaire du hook `useAnonymousAuth` (Mock Supabase client)
  - [ ] Vérifier que `signInAnonymously` est appelé si pas de session

## Dev Notes

- **Architecture Auth** : On utilise exclusivement `signInAnonymously()` de Supabase [Source: architecture.md#Authentication & Security].
- **Persistance** : Le client Supabase gère automatiquement la persistance du token dans le `localStorage`. Pas besoin de code custom pour ça, juste s'assurer que le client est bien initialisé.
- **Sécurité** : Pour l'instant, pas de RLS complexe car pas encore de tables, mais l'auth doit être fonctionnelle pour les futures stories.
- **Conflits potentiels** : Attention au SSR avec le client Supabase. Utiliser `createBrowserClient` pour le client et `createServerClient` pour le serveur (via `@supabase/ssr`).

### Project Structure Notes

- `src/lib/supabase/` : Emplacement standard pour les clients Supabase.
- `src/hooks/` : Pour le hook custom.

### References

- [Architecture Decision Document](file:///\_bmad-output/planning-artifacts/architecture.md#Authentication & Security)
- [PRD - Identity](file:///_bmad-output/planning-artifacts/prd.md#Identity)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth/auth-anonymous)

## Dev Agent Record

### Agent Model Used

Gemini-3-Pro-Preview

### Debug Log References

### Completion Notes List

### File List
