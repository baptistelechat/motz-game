import fs from "fs";
import { glob } from "glob";
import path from "path";
import { PNG } from "pngjs";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

// Configuration de la CLI
const argv = yargs(hideBin(process.argv))
  .scriptName("remove-bg")
  .usage("$0 <input> [output] [options]")
  .command("$0 <input> [output]", "Supprime le fond blanc des images pixel art")
  .positional("input", {
    describe: "Fichier image d'entrée, dossier ou motif glob",
    type: "string",
    demandOption: true,
  })
  .positional("output", {
    describe:
      "Fichier ou dossier de sortie (optionnel pour le traitement par lot)",
    type: "string",
  })
  .option("tolerance", {
    alias: "t",
    type: "number",
    description: "Tolérance pour la couleur blanche (0-255)",
    default: 245,
  })
  .option("clean-edges", {
    alias: "c",
    type: "boolean",
    description: "Active le nettoyage des bords (supprime le liseré blanc/gris)",
    default: true,
  })
  .option("edge-tolerance", {
    alias: "e",
    type: "number",
    description: "Tolérance pour le nettoyage des bords (0-255)",
    default: 200,
  })
  .help()
  .parseSync();

const TOLERANCE = argv.tolerance;
const CLEAN_EDGES = argv.cleanEdges;
const EDGE_TOLERANCE = argv.edgeTolerance;

interface Point {
  x: number;
  y: number;
}

// Fonction pour vérifier si un pixel est considéré comme blanc
function isWhite(r: number, g: number, b: number, tolerance: number = TOLERANCE): boolean {
  return r >= tolerance && g >= tolerance && b >= tolerance;
}

// Algorithme de Flood Fill pour la transparence
function processImage(inputPath: string, outputPath: string) {
  try {
    const data = fs.readFileSync(inputPath);
    const png = PNG.sync.read(data);
    const { width, height, data: pixels } = png;
    const visited = new Uint8Array(width * height); // 0 = non visité, 1 = visité
    const queue: Point[] = [];

    // Ajouter tous les pixels du bord qui sont blancs à la file d'attente
    // Bord haut et bas
    for (let x = 0; x < width; x++) {
      // Haut (y=0)
      let idx = (0 * width + x) << 2;
      if (isWhite(pixels[idx], pixels[idx + 1], pixels[idx + 2])) {
        queue.push({ x, y: 0 });
        visited[0 * width + x] = 1;
      }
      // Bas (y=height-1)
      idx = ((height - 1) * width + x) << 2;
      if (isWhite(pixels[idx], pixels[idx + 1], pixels[idx + 2])) {
        queue.push({ x, y: height - 1 });
        visited[(height - 1) * width + x] = 1;
      }
    }

    // Bord gauche et droit
    for (let y = 1; y < height - 1; y++) {
      // Gauche (x=0)
      let idx = (y * width + 0) << 2;
      if (isWhite(pixels[idx], pixels[idx + 1], pixels[idx + 2])) {
        queue.push({ x: 0, y });
        visited[y * width + 0] = 1;
      }
      // Droite (x=width-1)
      idx = (y * width + (width - 1)) << 2;
      if (isWhite(pixels[idx], pixels[idx + 1], pixels[idx + 2])) {
        queue.push({ x: width - 1, y });
        visited[y * width + (width - 1)] = 1;
      }
    }

    // Directions pour les voisins (Haut, Bas, Gauche, Droite)
    const directions = [
      { dx: 0, dy: -1 },
      { dx: 0, dy: 1 },
      { dx: -1, dy: 0 },
      { dx: 1, dy: 0 },
    ];

    // BFS Flood Fill
    while (queue.length > 0) {
      const { x, y } = queue.shift()!;
      const idx = (y * width + x) << 2;

      // Rendre le pixel transparent
      pixels[idx + 3] = 0; // Alpha = 0

      // Vérifier les voisins
      for (const { dx, dy } of directions) {
        const nx = x + dx;
        const ny = y + dy;

        // Vérifier les limites de l'image
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const nIdx = ny * width + nx;
          if (visited[nIdx] === 0) {
            const pixelIdx = nIdx << 2;
            // Si le voisin est blanc, on l'ajoute à la file
            if (
              isWhite(
                pixels[pixelIdx],
                pixels[pixelIdx + 1],
                pixels[pixelIdx + 2],
              )
            ) {
              visited[nIdx] = 1;
              queue.push({ x: nx, y: ny });
            }
          }
        }
      }
    }

    // --- Étape de nettoyage des bords (Edge Cleanup) ---
    if (CLEAN_EDGES) {
      const toRemove: number[] = [];

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) << 2;
          
          // Si le pixel est encore opaque
          if (pixels[idx + 3] !== 0) {
            let isBorder = false;
            
            // Vérifier si un voisin est transparent
            for (const { dx, dy } of directions) {
              const nx = x + dx;
              const ny = y + dy;
              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const nIdx = (ny * width + nx) << 2;
                if (pixels[nIdx + 3] === 0) {
                  isBorder = true;
                  break;
                }
              }
            }

            if (isBorder) {
              // Si c'est un bord et qu'il est assez clair (Edge Tolerance)
              if (isWhite(pixels[idx], pixels[idx + 1], pixels[idx + 2], EDGE_TOLERANCE)) {
                toRemove.push(idx);
              }
            }
          }
        }
      }

      // Appliquer la suppression
      for (const idx of toRemove) {
        pixels[idx + 3] = 0;
      }
      
      if (toRemove.length > 0) {
        console.log(`✨ Nettoyage : ${toRemove.length} pixels de bordure supprimés.`);
      }
    }

    // Sauvegarder l'image
    const buffer = PNG.sync.write(png);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, buffer);
    console.log(`✅ Traité : ${inputPath} -> ${outputPath}`);
  } catch (error) {
    console.error(`❌ Erreur lors du traitement de ${inputPath}:`, error);
  }
}

async function main() {
  const input = argv.input as string;
  let output = argv.output as string | undefined;

  // Détection si l'entrée est un dossier ou un glob
  const isGlob = glob.hasMagic(input);
  const isDir = fs.existsSync(input) && fs.statSync(input).isDirectory();

  let files: string[] = [];
  if (isDir) {
    files = await glob(path.join(input, "**/*.png").replace(/\\/g, "/"));
  } else if (isGlob) {
    files = await glob(input.replace(/\\/g, "/"));
  } else {
    files = [input];
  }

  // Filtrer les fichiers déjà traités (contenant '_transparent')
  files = files.filter((file) => !file.includes("_transparent"));

  if (files.length === 0) {
    console.error(
      "⚠️ Aucune image originale trouvée (les fichiers *_transparent.png sont ignorés).",
    );
    return;
  }

  console.log(`🔍 ${files.length} image(s) originale(s) trouvée(s)...`);

  // Logique de sortie
  if (files.length > 1) {
    // Mode Batch
    if (output && !path.extname(output)) {
      // Output est un dossier
      for (const file of files) {
        // Ajouter le suffixe _transparent même si on déplace dans un autre dossier
        // pour garder la convention de nommage
        const ext = path.extname(file);
        const name = path.basename(file, ext);
        const dest = path.join(output, `${name}_transparent${ext}`);
        processImage(file, dest);
      }
    } else {
      // Pas de dossier de sortie spécifié ou output est un fichier (invalide pour batch)
      if (output) {
        console.warn(
          "⚠️ Attention : Plusieurs fichiers en entrée mais une sortie unique spécifiée. Les fichiers seront écrasés ou le nom de sortie ignoré.",
        );
      }
      // Sauvegarde dans le même dossier avec suffixe si pas d'output dir
      for (const file of files) {
        let dest = "";
        if (output && !path.extname(output)) {
          // Cas où output est un dossier (redondant avec le if précédent mais sécurité)
          const ext = path.extname(file);
          const name = path.basename(file, ext);
          dest = path.join(output, `${name}_transparent${ext}`);
        } else {
          // Suffixe par défaut si pas de dossier de sortie explicite
          const ext = path.extname(file);
          const name = path.basename(file, ext);
          dest = path.join(path.dirname(file), `${name}_transparent${ext}`);
        }
        processImage(file, dest);
      }
    }
  } else {
    // Fichier unique
    const file = files[0];
    if (!output) {
      // Générer un nom de sortie par défaut
      const ext = path.extname(file);
      const name = path.basename(file, ext);
      output = path.join(path.dirname(file), `${name}_transparent${ext}`);
    }
    processImage(file, output);
  }
}

main().catch(console.error);
