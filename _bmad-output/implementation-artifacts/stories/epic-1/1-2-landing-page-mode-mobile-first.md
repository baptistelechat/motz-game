# Story 1.2 : Landing Page & Mode Mobile First

Statut : ready-for-dev

<!-- Note : La validation est optionnelle. Exécutez validate-create-story pour un contrôle qualité avant dev-story. -->

## Story

En tant que joueur mobile,
Je veux une page d'accueil qui s'adapte parfaitement à mon écran avec le "Mode Focus",
afin de pouvoir naviguer confortablement sans que le clavier virtuel ne masque les éléments importants.

## Critères d'acceptation (Acceptance Criteria)

1. **Given** un utilisateur arrivant sur la racine du site
   **When** la page se charge
   **Then** le layout principal est affiché avec le style "Pixel-Pop" (Bordures épaisses, Ombres dures)

2. **And** sur mobile, la structure respecte le "Mode Focus" (Header sticky en haut, Zone d'action sticky en bas)

3. **And** la typographie utilise "Press Start 2P" pour les titres et "VT323" pour le texte

4. **And** le manifest PWA est configuré (icône, couleur de thème) pour permettre l'installation

5. **And** un Service Worker basique est configuré pour mettre en cache les assets statiques (fonts, images)

## Tâches / Sous-tâches

- [x] Configurer le Style Global & les Polices (AC: 1, 3)
  - [x] Installer les polices : "Press Start 2P" et "VT323" (Google Fonts) dans `layout.tsx`
  - [x] Configurer les couleurs du thème Tailwind v4 (Deep Arcade Blue `#121220`, Neon Green `#39FF14`, Magenta `#FF00FF`, Yellow `#FFFF00`)
  - [x] Définir la couleur de fond par défaut sur Deep Arcade Blue

- [x] Implémenter les composants UI "Pixel-Pop" (AC: 1)
  - [x] Personnaliser le composant `Button` : `rounded-none`, `border-4 border-black`, `shadow-[6px_6px_0px_0px_#000]`, gestion de l'état actif
  - [x] Personnaliser le composant `Input` : `rounded-none`, `border-4 border-black`, `font-vt323`, text-3xl
  - [x] Créer le prototype du composant `ConstraintBadge` (Variantes Vert/Rouge)

- [x] Implémenter le Layout "Mode Focus" (AC: 2)
  - [x] Créer le composant `StickyHeader` (Barre supérieure)
  - [x] Créer le composant `StickyActionZone` (Barre inférieure)
  - [x] Créer le wrapper Main Layout qui gère correctement la hauteur du viewport (dvh) pour éviter le chevauchement du clavier

- [x] Créer le contenu de la Landing Page (AC: 1)
  - [x] Section Hero avec Titre ("MOTZ GAME") utilisant Press Start 2P
  - [x] Bouton "Créer une partie" (Style primaire)
  - [x] Bouton "Rejoindre" (Style secondaire) ou champ de saisie pour le code

- [x] Configuration PWA (AC: 4, 5)
  - [x] Créer `manifest.json` (ou `manifest.ts` pour Next.js) avec icônes et couleurs du thème
  - [x] Activer le Service Worker (ex: via `next-pwa` ou sw personnalisé) pour la mise en cache des assets hors ligne

## Notes de Dev

- **Design System** : Respect strict du "Pixel-Pop" [Source : ux-design-specification.md].
  - **Zéro Rayon** : `rounded-none` partout.
  - **Bordures Épaisses** : `border-4 border-black`.
  - **Ombres Dures** : `shadow-[6px_6px_0px_0px_#000]`.
- **Mobile First** : Utiliser les unités `dvh` (Dynamic Viewport Height) pour gérer les barres du navigateur mobile et le clavier.
- **Tech Stack** : Next.js 15, Tailwind 4.
- **PWA** : S'assurer que `next.config.ts` gère correctement la génération PWA.

### Notes sur la Structure du Projet

- Utiliser `src/app` pour les pages.
- Utiliser `src/components/ui` pour les composants Shadcn.
- Utiliser `src/components/layout` pour Sticky Header/Bottom.

### Références

- [UX Design Spec](file:///_bmad-output/planning-artifacts/ux-design-specification.md)
- [Epics](file:///_bmad-output/planning-artifacts/epics.md)

## Dev Agent Record

### Agent Model Used

Gemini-3-Pro-Preview

### Debug Log References

- Tests unitaires passés avec succès.
- Vérification manuelle (simulée) de la structure des fichiers.

### Completion Notes List

- Implémentation complète du Design System "Pixel-Pop" (Button, Input, ConstraintBadge).
- Mise en place du Layout "Mode Focus" avec Sticky Header/Footer et dvh.
- Création de la Landing Page conforme aux maquettes/ACs.
- Configuration PWA via `@ducanh2912/next-pwa` et `manifest.ts`.
- Tests unitaires ajoutés pour tous les nouveaux composants.

### File List

- `src/components/ui/button.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/constraint-badge.tsx`
- `src/components/layout/sticky-header.tsx`
- `src/components/layout/sticky-action-zone.tsx`
- `src/components/layout/main-layout.tsx`
- `src/app/page.tsx`
- `src/app/layout.tsx`
- `src/app/manifest.ts`
- `next.config.ts`
- `tests/unit/**/*`
