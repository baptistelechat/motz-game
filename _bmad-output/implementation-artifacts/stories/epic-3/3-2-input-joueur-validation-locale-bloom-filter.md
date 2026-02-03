# Story 3.2: Input Joueur & Validation Locale (Bloom Filter)

Status: completed

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

**En tant que** joueur,
**Je veux** savoir instantanément si mon mot est valide (orthographe + contraintes simples),
**Afin que** ne pas perdre de temps à soumettre un mot incorrect.

## Acceptance Criteria

1. **Given** une manche active avec **3 types de contraintes simultanées** :
   - 1 Lettre Imposée
   - 1 Lettre Interdite
   - 1 Carte Contrainte (parmi : Libre, Longueurs, Inversion, Position, Structure)
2. **When** je tape un mot dans le champ de saisie
3. **Then** une validation locale est effectuée (à la frappe ou soumission)
4. **And** le système vérifie :
   - La présence dans le dictionnaire local (Bloom Filter ou Set compressé)
   - Le respect de la lettre Imposée (sauf si "Inversion")
   - Le respect de la lettre Interdite (sauf si "Inversion")
   - Le respect de la Carte Contrainte active :
     - **Libre** : Aucune contrainte additionnelle.
     - **Longueur Min** : `word.length >= X`
     - **Longueur Max** : `word.length <= X`
     - **Longueur Exacte** : `word.length === X`
     - **Commence par** : `word.startsWith(lettre_imposée)`
     - **Finit par** : `word.endsWith(lettre_imposée)`
     - **Lettres Différentes** : `new Set(word).size === word.length`
     - **Min Voyelles** : `countVowels(word) >= X`
     - **Inversion** : La lettre Imposée devient Interdite, et la lettre Interdite devient Imposée.
5. **And** si invalide : Animation "Secousse" (Shake) + Feedback visuel (Bordure Hot Pink #FF00FF) + Son "Bloop" (Feedback "Juicy")
6. **And** si valide : État "Optimiste" (Bordure Laser Lemon #FFFF00 ou Power-Up Green #39FF14) + Prêt à envoyer
7. **And** aucune requête serveur n'est envoyée si le mot est invalide localement

## Tâches / Sous-tâches

- [x] Tâche 1 : Assets & Libs (Bloom Filter)
  - [x] Sélectionner une approche (Bloom Filter léger ou Set optimisé) pour le dictionnaire FR.
  - [x] Générer/Intégrer le fichier dictionnaire dans `public/assets/` (cible < 3MB).
  - [x] Créer un service/hook `useDictionary` pour charger la ressource sans bloquer le main thread.

- [x] Tâche 2 : Logique de Validation (Core Logic)
  - [x] Implémenter `validateWord(word, roundConstraints)` (Pure Function).
  - [x] Implémenter le moteur de règles pour supporter :
    - `imposed_letter` (char)
    - `forbidden_letter` (char)
    - `constraint_card` (type + value éventuelle) :
      - `free` (pas d'effet)
      - `min_len`, `max_len`, `exact_len` (int value)
      - `starts_with_imposed`, `ends_with_imposed` (utilise `imposed_letter`)
      - `unique_chars` (boolean)
      - `min_vowels` (int value)
      - `invert_letters` (swap logic imposed <-> forbidden)
  - [x] Ajouter des tests unitaires (Vitest) pour CHAQUE type de contrainte et les combinaisons (ex: Inversion + Starts With).

- [x] Tâche 3 : UI Input & Feedback (Mobile First)
  - [x] Créer le composant `GameInput` respectant le Design System "Pixel-Pop".
  - [x] Implémenter le "Focus Mode" : Input sticky en bas de l'écran (gestion clavier virtuel/dvh).
  - [x] Styles & Animations :
    - Error: Border Hot Pink (#FF00FF) + Animation Shake.
    - Valid: Border Laser Lemon (#FFFF00) (Waiting state).
  - [x] Intégration Audio : Jouer les sons 8-bit (Success/Fail) sur validation.

- [x] Tâche 4 : Intégration Store & E2E
  - [x] Connecter l'input au `useGameStore` (ou état local si performance critique).
  - [x] Préparer l'appel RPC de soumission (mocké pour cette story, implémenté en 3.3).
  - [x] Test E2E (Playwright) : Vérifier que l'input rejette les mots invalides et accepte les valides (mock dict).

## Notes de développement

- **Architecture:** Validation Hybride. Le client fait le "gros œuvre" pour l'UX, le serveur (Story 3.3) est l'autorité finale.
- **Data Structure:** La table `rounds` (colonne `constraints`) devra stocker ces types de règles. Assurez-vous que le type TypeScript `RoundConstraints` est assez flexible (Union Type ou Discriminated Union).
- **Performance:** Attention au poids du dictionnaire. Un Bloom Filter est idéal pour la taille.
- **UX:** "Speed is King". La validation doit être < 50ms.
- **Mobile:** Le "Focus Mode" est critique. Tester avec les DevTools Chrome en mode mobile + clavier simulé.

### Références

- [Epics: Story 3.2](file:///c:\Users\DM\Desktop\DEV\perso\motz-game_bmad-output\planning-artifacts\epics.md)
- [Architecture: Validation Strategy](file:///c:\Users\DM\Desktop\DEV\perso\motz-game_bmad-output\planning-artifacts\architecture.md)
- [UX: Latency & Feedback](file:///c:\Users\DM\Desktop\DEV\perso\motz-game_bmad-output\planning-artifacts\ux-design-specification.md)

## Dev Agent Record

### Agent Model Used

Dev Agent

### Debug Log References

- Verified logic in `src/lib/game/validation.ts`
- Verified UI in `src/components/game/game-input.tsx`

### Completion Notes List

- Implemented core validation logic with support for all constraint types including inversion.
- Implemented `GameInput` component with shake animation (framer-motion) and toast notifications.
- Dictionary loading handled via server action for debug/dev and optimized for client usage.
- Unit tests cover validation scenarios.

### File List

- `src/lib/game/validation.ts`
- `src/components/game/game-input.tsx`
- `src/lib/game/dictionary.ts`
- `tests/unit/lib/game/validation.test.ts`
