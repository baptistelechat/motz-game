# Script de Suppression de Fond (Pixel Art)

Ce script CLI permet de supprimer le fond blanc d'images pixel art en utilisant un algorithme de **Flood Fill** (remplissage par diffusion). Il préserve les pixels blancs situés à l'intérieur du sprite et inclut une fonctionnalité de nettoyage des bordures pour éviter les liserés blancs (halos).

## Utilisation

Le script est accessible via `pnpm` (ou `npm`/`yarn`).

### Commande Rapide (Avatars)

Pour traiter toutes les images dans `public/assets/avatar/` :

```bash
pnpm remove-bg:avatar
```

### Utilisation Générale

```bash
# Via tsx directement
npx tsx scripts/remove-bg.ts <input> [output] [options]

# Ou si vous avez ajouté un script "remove-bg" dans package.json
pnpm remove-bg <input> [output] [options]
```

## Exemples

**Traiter une seule image :**
```bash
pnpm remove-bg -- "image.png" "image_transparente.png"
```

**Traiter tout un dossier (Batch) :**
```bash
# Traite tous les .png et ajoute le suffixe "_transparent"
pnpm remove-bg -- "assets/*.png"

# Traite et sauvegarde dans un dossier spécifique
pnpm remove-bg -- "assets/*.png" "dist/"
```

> **Note :** Le script ignore automatiquement les fichiers contenant déjà `_transparent` dans leur nom pour éviter les doublons lors des exécutions multiples.

## Options

| Option | Alias | Description | Défaut |
|--------|-------|-------------|--------|
| `--tolerance` | `-t` | Sensibilité au blanc pour le fond (0-255). Plus la valeur est élevée, plus il faut que le blanc soit pur. | `245` |
| `--clean-edges` | `-c` | Active le nettoyage des bords pour supprimer le liseré blanc/gris résiduel. | `true` |
| `--no-clean-edges` | | Désactive le nettoyage des bords. | |
| `--edge-tolerance` | `-e` | Tolérance spécifique pour le nettoyage des bords. | `200` |
| `--help` | | Affiche l'aide. | |

## Fonctionnement Technique

1.  **Flood Fill (BFS)** : Le script part des 4 bords de l'image et propage la transparence sur tous les pixels connectés considérés comme blancs (`>= tolerance`).
2.  **Edge Cleanup** : Si activé, une seconde passe identifie les pixels opaques en bordure de transparence qui sont "presque blancs" (`>= edge-tolerance`) et les supprime. Cela élimine l'effet d'escalier ou de halo blanc souvent visible après un détourage automatique.
