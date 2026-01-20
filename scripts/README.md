# Scripts de Traitement d'Images (Pixel Art)

Ce dossier contient des utilitaires pour manipuler les assets graphiques du jeu, notamment pour le style Pixel Art.

---

## 1. Remove Background (`remove-bg`)

Supprime le fond blanc d'images en utilisant un algorithme de **Flood Fill**. Préserve les pixels blancs internes et nettoie les liserés.

### Utilisation

```bash
# Via script npm
pnpm remove-bg <input> [output] [options]

# Exemple Avatar
pnpm remove-bg:avatar
```

### Options Principales

| Option             | Alias | Description                                           | Défaut |
| ------------------ | ----- | ----------------------------------------------------- | ------ |
| `--clean-edges`    | `-c`  | Active le nettoyage du liseré blanc autour du sprite. | `true` |
| `--tolerance`      | `-t`  | Tolérance au blanc pour le fond (0-255).              | `245`  |
| `--edge-tolerance` | `-e`  | Tolérance pour le nettoyage des bords.                | `200`  |

---

## 2. Pixelate (`pixelate`)

Transforme une image haute résolution en Pixel Art (downscaling avec moyenne des couleurs). Peut soit réduire l'image physiquement (ex: 32x32), soit simuler des gros pixels en gardant la résolution d'origine (ex: 512x512).

### Utilisation

```bash
# Via script npm
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

### Exemples

**Créer une icône 32x32 réelle :**

```bash
pnpm pixelate -- "icon.png" --size 32
```

**Créer une image style "Pixel Pop" (HD avec gros pixels) :**

```bash
# Image source 512x512, on veut des pixels de 32px de large (donc grille 16x16)
pnpm pixelate -- "image.png" --pixel-size 32 --keep-resolution
```
