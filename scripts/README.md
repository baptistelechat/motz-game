# Documentation des Scripts

Ce projet contient plusieurs scripts utilitaires pour faciliter le développement, la gestion des assets et les tests.

## Table des Matières

- [Documentation des Scripts](#documentation-des-scripts)
  - [Table des Matières](#table-des-matières)
  - [1. Gestion de Partie (`seed:game`)](#1-gestion-de-partie-seedgame)
    - [Utilisation](#utilisation)
    - [Options](#options)
    - [Exemples](#exemples)
  - [2. Remove Background (`remove-bg`)](#2-remove-background-remove-bg)
    - [Utilisation](#utilisation-1)
    - [Options](#options-1)
  - [3. Pixelate (`pixelate`)](#3-pixelate-pixelate)
    - [Utilisation](#utilisation-2)
    - [Options](#options-2)
  - [4. Génération de Types d'Icônes (`generate:icons`)](#4-génération-de-types-dicônes-generateicons)
    - [Utilisation](#utilisation-3)

---

## 1. Gestion de Partie (`seed:game`)

Ce script permet de créer rapidement une partie de test ou d'ajouter des joueurs à une partie existante. Il est très utile pour tester les flux multijoueurs sans avoir à créer manuellement plusieurs comptes/sessions.

### Utilisation

```bash
# Via script pnpm
pnpm run seed:game -- [options]
```

### Options

| Option      | Alias | Description                                                                 | Défaut |
| ----------- | ----- | --------------------------------------------------------------------------- | ------ |
| `--players` | `-p`  | Nombre de joueurs supplémentaires à créer (en plus de l'hôte si création).  | `3`    |
| `--code`    | `-c`  | Code d'une partie existante. Si fourni, aucune nouvelle partie n'est créée. | `null` |
| `--help`    | `-h`  | Affiche l'aide.                                                             |        |

### Exemples

**Créer une nouvelle partie avec l'hôte et 3 joueurs supplémentaires (défaut) :**

```bash
pnpm run seed:game
```

**Créer une partie avec 10 joueurs supplémentaires :**

```bash
pnpm run seed:game -- --players 10
```

**Ajouter 5 joueurs à une partie existante (ex: `ABC123`) :**

```bash
pnpm run seed:game -- --code ABC123 --players 5
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
