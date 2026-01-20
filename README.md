# Motz Game

Jeu de mots multijoueur temps réel avec design Pixel-Pop.

## 🛠️ Stack Technique

- **Framework**: Next.js 15
- **Langage**: TypeScript
- **Styling**: Tailwind CSS 4 (Pixel-Pop Design System)
- **Backend/Auth**: Supabase
- **Tests**: Vitest (Unit), Playwright (E2E)

## 🚀 Installation

1. Cloner le repo :
   ```bash
   git clone <repo-url>
   cd motz-game
   ```

2. Installer les dépendances :
   ```bash
   pnpm install
   ```

3. Configurer les variables d'environnement :
   Renommer `.env.example` en `.env.local` et ajouter vos clés Supabase.

4. Lancer le serveur de développement :
   ```bash
   pnpm dev
   ```

## 🧪 Tests

Le projet suit une stratégie de test rigoureuse définie par le Master Test Architect.

### Tests Unitaires (Vitest)

Couvrent les composants UI, les utilitaires et la logique métier isolée.

```bash
npm run test:unit
```

### Tests End-to-End (Playwright)

Couvrent les parcours critiques utilisateurs (Home Page, Auth flows).

```bash
npm run test:e2e
```

### Architecture de Test

- **Composants UI** : Testés unitairement pour le rendu et le style (Pixel-Pop).
- **Logique Supabase** : Middleware et Proxy testés avec des mocks.
- **E2E Fixtures** : Utilisation du pattern "Composable Fixtures" pour une meilleure maintenabilité.
  - `support/actions/` : Fonctions pures pour les interactions.
  - `support/fixtures/` : Wrappers Playwright injectant les actions.
