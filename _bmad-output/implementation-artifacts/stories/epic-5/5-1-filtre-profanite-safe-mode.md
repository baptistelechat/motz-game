# Story 5.1: Filtre de Profanité (Safe Mode)

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a système,
I want bloquer automatiquement les mots offensants,
So that maintenir un environnement de jeu sain par défaut.

## Acceptance Criteria

1. **Given** un mot soumis
   **When** il est validé par le serveur
   **Then** il est comparé à une liste noire de profanités

2. **And** si match, le mot est rejeté (même si valide dans le dictionnaire)

3. **And** le joueur reçoit un feedback discret "Mot inapproprié"

## Tasks / Subtasks

- [x] Configuration de la librairie de filtrage (AC: 1)
  - [x] Installer `bad-words` (ou équivalent si bad-words ne supporte pas le français)
  - [x] Configurer une instance avec une liste de mots français

- [x] Implémentation Serveur (AC: 1, 2)
  - [x] Intégrer la vérification dans la Server Action de soumission de mot (`submitWord`)
  - [x] S'assurer que la vérification se fait AVANT la validation dictionnaire/points

- [x] Gestion du Feedback (AC: 3)
  - [x] Retourner une erreur spécifique (ex: `PROFANITY_DETECTED`) depuis la Server Action
  - [x] Afficher un toast/message d'erreur discret côté client

## Dev Notes

- **Librairie**: Utiliser `leo-profanity` (plus adapté au français que `bad-words`).
- **Performance**: La vérification doit être rapide (liste en mémoire ou bloom filter si très grosse liste, mais pour des profanités une liste simple suffit généralement).
- **Extension**: Prévoir que la liste puisse être enrichie via l'interface Admin (Story 5.4) -> Stocker les mots custom en DB ou utiliser une config extensible. Pour cette story, une liste statique + config suffit.

### References

- [Epics Document](file:///_bmad-output/planning-artifacts/epics.md#Story-5.1)
