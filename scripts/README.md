# Documentation des Scripts

Ce projet contient plusieurs scripts utilitaires pour faciliter le développement, la gestion des assets et les tests.

## Table des Matières

- [Documentation des Scripts](#documentation-des-scripts)
  - [Table des Matières](#table-des-matières)
  - [1. Gestion de Partie (`seed:game`)](#1-gestion-de-partie-seedgame)
    - [Utilisation](#utilisation)
    - [Options](#options)
    - [Note importante sur l'API](#note-importante-sur-lapi)
    - [Exemples](#exemples)
  - [2. Remove Background (`remove-bg`)](#2-remove-background-remove-bg)
    - [Utilisation](#utilisation-1)
    - [Options](#options-1)
  - [3. Pixelate (`pixelate`)](#3-pixelate-pixelate)
    - [Utilisation](#utilisation-2)
    - [Options](#options-2)
  - [4. Génération de Types d'Icônes (`generate:icons`)](#4-génération-de-types-dicônes-generateicons)
    - [Utilisation](#utilisation-3)
  - [5. Téléchargement de Dictionnaires (`dictionary:download`)](#5-téléchargement-de-dictionnaires-dictionarydownload)
    - [Utilisation](#utilisation-4)
  - [6. Génération de Dictionnaire (`dictionary:generate`)](#6-génération-de-dictionnaire-dictionarygenerate)
    - [Utilisation](#utilisation-5)
    - [Détails Techniques](#détails-techniques)
    - [Configuration](#configuration)
  - [7. Workflow Complet (`dictionary:build`)](#7-workflow-complet-dictionarybuild)
    - [Utilisation](#utilisation-6)
  - [8. Analyse du Dictionnaire (`dictionary:analyze`)](#8-analyse-du-dictionnaire-dictionaryanalyze)
    - [Utilisation](#utilisation-7)
    - [Fonctionnalités](#fonctionnalités)

---

## 1. Gestion de Partie (`seed:game`)

Ce script permet de créer rapidement une partie de test ou d'ajouter des joueurs à une partie existante. Il est très utile pour tester les flux multijoueurs sans avoir à créer manuellement plusieurs comptes/sessions.

### Utilisation

```bash
# Via npx (recommandé pour passer les arguments)
npx tsx scripts/seed-game.ts [options]
```

### Options

| Option      | Alias | Description                                                                 | Défaut |
| ----------- | ----- | --------------------------------------------------------------------------- | ------ |
| `--players` | `-p`  | Nombre de joueurs supplémentaires à créer (en plus de l'hôte si création).  | `3`    |
| `--code`    | `-c`  | Code d'une partie existante. Si fourni, aucune nouvelle partie n'est créée. | `null` |
| `--help`    | `-h`  | Affiche l'aide.                                                             |        |

### Note importante sur l'API

Ce script utilise l'API **Admin de Supabase** (`auth.admin.createUser`) au lieu de l'API publique (`signInAnonymously`).

- **Pourquoi ?** Pour contourner les limites de débit (Rate Limits) strictes sur la création de comptes anonymes (souvent limités à ~30/heure).
- **Conséquence** : Vous devez avoir la variable `SUPABASE_SERVICE_ROLE_KEY` définie dans votre fichier `.env.local`. Les utilisateurs créés sont des "bots" avec des emails fictifs (`bot-xyz@example.com`) et une métadonnée `is_bot: true`.

### Exemples

**Créer une nouvelle partie avec l'hôte et 3 joueurs supplémentaires (défaut) :**

```bash
npx tsx scripts/seed-game.ts
```

**Créer une partie avec 10 joueurs supplémentaires :**

```bash
npx tsx scripts/seed-game.ts --players 10
```

**Ajouter 5 joueurs à une partie existante (ex: `ABC123`) :**

```bash
npx tsx scripts/seed-game.ts --code ABC123 --players 5
```

---

## 2. Remove Background (`remove-bg`)

Supprime le fond blanc d'images en utilisant un algorithme de **Flood Fill**. Préserve les pixels blancs internes et nettoie les liserés.

### Utilisation

```bash
# Via script pnpm
pnpm remove-bg <input> [output] [options]

# Exemple Avatar
pnpm remove-bg:avatar
```

### Options

| Option             | Alias | Description                                           | Défaut |
| ------------------ | ----- | ----------------------------------------------------- | ------ |
| `--clean-edges`    | `-c`  | Active le nettoyage du liseré blanc autour du sprite. | `true` |
| `--tolerance`      | `-t`  | Tolérance au blanc pour le fond (0-255).              | `245`  |
| `--edge-tolerance` | `-e`  | Tolérance pour le nettoyage des bords.                | `200`  |

---

## 3. Pixelate (`pixelate`)

Transforme une image haute résolution en Pixel Art (downscaling avec moyenne des couleurs). Peut soit réduire l'image physiquement (ex: 32x32), soit simuler des gros pixels en gardant la résolution d'origine (ex: 512x512).

### Utilisation

```bash
# Via script pnpm
pnpm pixelate <input> [output] [options]

# Exemple Flaticon (garde la résolution 512x512 avec des pixels de 32px)
pnpm pixelate:flaticon
```

### Options

| Option              | Alias | Description                                                                                                                                     | Défaut  |
| ------------------- | ----- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `--pixel-size`      | `-p`  | Taille d'un "gros pixel" en pixels source (ex: `32` pour avoir des blocs de 32x32px sur l'image d'origine). **Recommandé.**                     | -       |
| `--size`            | `-s`  | Taille de la grille cible (ex: `32` pour forcer une grille de 32x32 blocs). Utilisé si `--pixel-size` n'est pas défini.                         | `32`    |
| `--keep-resolution` | `-k`  | Si activé, l'image de sortie garde la taille de l'image d'entrée (upscale sans interpolation). Si désactivé, l'image est réduite (ex: 32x32px). | `false` |

---

## 4. Génération de Types d'Icônes (`generate:icons`)

Génère automatiquement les types TypeScript pour les icônes présentes dans `public/assets/icons`. Cela permet d'avoir de l'autocomplétion lors de l'utilisation du composant `<PixelIcon />`.

### Utilisation

```bash
# Via script pnpm
pnpm run generate:icons
```

À exécuter après avoir ajouté de nouvelles icônes SVG dans le dossier `public/assets/icons`. Le script va mettre à jour le fichier `src/types/pixel-icons.ts`.

---

## 5. Téléchargement de Dictionnaires (`dictionary:download`)

Ce script télécharge et extrait automatiquement des listes de mots supplémentaires depuis des sources externes fiables pour enrichir le dictionnaire.

### Utilisation

```bash
# Via script pnpm
pnpm run dictionary:download
```

Le script va :

1.  Télécharger `Lexique383.tsv` (Lexique.org).
2.  Télécharger `kaikki.org-dictionary-French.jsonl` (Wiktionnaire).
3.  Télécharger `ODS8` (Scrabble).
4.  Télécharger `Gutenberg` (Liste de mots français).
5.  Télécharger `Taknok` (French Wordlist).
6.  Télécharger `Words` (JSON Array of French Words).
7.  Télécharger `Hbenbel` (Full French Dictionary).
8.  Extraire les mots valides.
9.  Générer des fichiers sources dans `src/assets/dictionary/temp/` prêts à être fusionnés.

---

## 6. Génération de Dictionnaire (`dictionary:generate`)

Convertit le dictionnaire source (format texte, un mot par ligne) en un **Bloom Filter** compressé (format JSON). Cela permet de réduire considérablement la taille du fichier chargé par le client tout en conservant une vérification rapide des mots.

### Utilisation

```bash
# Via script pnpm
pnpm run dictionary:generate
```

### Détails Techniques

Le script génère deux fichiers dans `public/assets/` :

1. **`dictionary.json`** : Le Bloom Filter sérialisé (~1MB vs ~4MB pour le texte brut).
2. **`dictionary-meta.json`** : Métadonnées contenant la version (timestamp), le taux d'erreur (0.1%) et le nombre de mots.

Ce système de métadonnées est utilisé par le client pour :

- Vérifier si le dictionnaire local (IndexedDB) est à jour.
- Éviter de retélécharger le gros fichier JSON si la version n'a pas changé.
- Permettre le fonctionnement hors-ligne (Offline First).

### Configuration

- **Source** : `src/assets/dictionary/dictionary.txt`
- **Destination** : `public/assets/dictionary.json`
- **Optimisation** : Utilise un Bloom Filter avec un taux d'erreur de **0.1%** (`0.001`). Cela garantit une très haute précision tout en réduisant la taille du fichier de ~75%.
- **Gain de taille** : Réduit généralement la taille du fichier de ~4.5MB (TXT) à <1MB (JSON).

---

## 7. Workflow Complet (`dictionary:build`)

Cette commande exécute l'ensemble du workflow de génération de dictionnaire en une seule fois.

### Utilisation

```bash
# Via script pnpm
pnpm run dictionary:build
```

Elle enchaîne automatiquement :

1.  `dictionary:download` : Téléchargement des sources.
2.  `dictionary:merge` : Fusion et nettoyage des sources pour créer `dictionary.txt`.
3.  `dictionary:generate` : Création du Bloom Filter optimisé `dictionary.json`.

C'est la commande recommandée à exécuter lorsque vous voulez mettre à jour intégralement le dictionnaire.

---

## 8. Analyse du Dictionnaire (`dictionary:analyze`)

Ce script fournit des statistiques détaillées sur le dictionnaire actuel (`src/assets/dictionary/dictionary.txt`). Il est utile pour vérifier la qualité du corpus, détecter des anomalies ou des anglicismes.

### Utilisation

```bash
# Via script pnpm
pnpm run dictionary:analyze
```

### Fonctionnalités

Le script affiche dans la console :

1.  **Statistiques Générales** : Nombre total de mots.
2.  **Distribution par Longueur** : Tableau montrant combien de mots existent pour chaque longueur (utile pour équilibrer le jeu).
3.  **Fréquence des Caractères** : Pourcentage d'apparition de chaque lettre (utile pour ajuster les tirages de lettres).
4.  **Palindromes** : Liste des palindromes de plus de 2 lettres.
5.  **Anglicismes Potentiels** : Détection basée sur une liste commune et des heuristiques (ex: terminaisons en "-ing").
6.  **Mots "Spam"** : Détection de mots composés uniquement de voyelles.
