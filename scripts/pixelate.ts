import fs from "fs";
import { glob } from "glob";
import path from "path";
import { PNG } from "pngjs";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

// Configuration CLI
const argv = yargs(hideBin(process.argv))
  .command("$0 [input] [output]", "Pixeliser une image ou un dossier d'images")
  .positional("input", {
    describe: 'Chemin de l\'image ou pattern glob (ex: "assets/*.png")',
    type: "string",
    demandOption: true,
  })
  .positional("output", {
    describe: "Chemin de sortie (fichier ou dossier)",
    type: "string",
  })
  .option("size", {
    alias: "s",
    type: "number",
    description: "Taille de la grille de pixels (ex: 32 pour du 32x32)",
    default: 32,
  })
  .option("pixel-size", {
    alias: "p",
    type: "number",
    description:
      'Taille d\'un "gros pixel" en pixels source (ex: 16). Écrase --size.',
  })
  .option("keep-resolution", {
    alias: "k",
    type: "boolean",
    description:
      "Conserver la résolution d'origine (upscale le résultat pixelisé)",
    default: false,
  })
  .help()
  .parseSync();

const GRID_SIZE = argv.size;
const PIXEL_SIZE = argv.pixelSize;
const KEEP_RESOLUTION = argv.keepResolution;

// Fonction de traitement d'une image
function processImage(inputPath: string, outputPath: string) {
  try {
    const data = fs.readFileSync(inputPath);
    const png = PNG.sync.read(data);
    const { width, height, data: pixels } = png;

    // Calculer la taille des blocs
    let targetWidth: number;
    let targetHeight: number;

    if (PIXEL_SIZE) {
      // Priorité à la taille du pixel source
      targetWidth = Math.ceil(width / PIXEL_SIZE);
      targetHeight = Math.ceil(height / PIXEL_SIZE);
    } else {
      // Sinon on utilise la taille de grille
      targetWidth = GRID_SIZE;
      targetHeight = Math.round(height * (GRID_SIZE / width)); // Conserver le ratio
    }

    const blockWidth = width / targetWidth;
    const blockHeight = height / targetHeight;

    // Créer le buffer pour l'image réduite (temp)
    const smallPng = new PNG({ width: targetWidth, height: targetHeight });

    // Downscaling (Moyenne des couleurs)
    for (let y = 0; y < targetHeight; y++) {
      for (let x = 0; x < targetWidth; x++) {
        let r = 0,
          g = 0,
          b = 0,
          a = 0;
        let count = 0;

        const startX = Math.floor(x * blockWidth);
        const endX = Math.min(Math.floor((x + 1) * blockWidth), width);
        const startY = Math.floor(y * blockHeight);
        const endY = Math.min(Math.floor((y + 1) * blockHeight), height);

        for (let py = startY; py < endY; py++) {
          for (let px = startX; px < endX; px++) {
            const idx = (py * width + px) << 2;
            r += pixels[idx];
            g += pixels[idx + 1];
            b += pixels[idx + 2];
            a += pixels[idx + 3];
            count++;
          }
        }

        if (count > 0) {
          const idx = (y * targetWidth + x) << 2;
          smallPng.data[idx] = Math.round(r / count);
          smallPng.data[idx + 1] = Math.round(g / count);
          smallPng.data[idx + 2] = Math.round(b / count);
          smallPng.data[idx + 3] = Math.round(a / count);
        }
      }
    }

    let finalPng: PNG;

    if (KEEP_RESOLUTION) {
      // Upscaling (Nearest Neighbor)
      finalPng = new PNG({ width: width, height: height });

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          // Trouver le pixel correspondant dans l'image réduite
          const sx = Math.min(Math.floor(x / blockWidth), targetWidth - 1);
          const sy = Math.min(Math.floor(y / blockHeight), targetHeight - 1);

          const sIdx = (sy * targetWidth + sx) << 2;
          const tIdx = (y * width + x) << 2;

          finalPng.data[tIdx] = smallPng.data[sIdx];
          finalPng.data[tIdx + 1] = smallPng.data[sIdx + 1];
          finalPng.data[tIdx + 2] = smallPng.data[sIdx + 2];
          finalPng.data[tIdx + 3] = smallPng.data[sIdx + 3];
        }
      }
    } else {
      finalPng = smallPng;
    }

    const buffer = PNG.sync.write(finalPng);
    fs.writeFileSync(outputPath, buffer);
    console.log(`✅ Pixelisé : ${inputPath} -> ${outputPath}`);
  } catch (error) {
    console.error(`❌ Erreur sur ${inputPath}:`, error);
  }
}

// Logique principale (Batch ou Single)
async function main() {
  const inputPattern = argv.input as string;
  const outputArg = argv.output as string | undefined;

  // Trouver les fichiers
  let files = await glob(inputPattern);

  if (files.length === 0) {
    console.error(`❌ Aucun fichier trouvé pour : ${inputPattern}`);
    process.exit(1);
  }

  // Filtrer les fichiers déjà traités (contenant '_pixelated')
  files = files.filter((file) => !file.includes("_pixelated"));

  console.log(`🔍 ${files.length} image(s) à traiter...`);

  // Déterminer si outputArg est un dossier
  let isOutputDirectory = false;
  if (outputArg) {
    // Si ça finit par un slash ou n'a pas d'extension, on suppose dossier
    if (
      outputArg.endsWith("/") ||
      outputArg.endsWith("\\") ||
      !path.extname(outputArg)
    ) {
      isOutputDirectory = true;
      if (!fs.existsSync(outputArg)) {
        fs.mkdirSync(outputArg, { recursive: true });
      }
    }
  }

  for (const file of files) {
    let outputPath: string;

    if (outputArg && !isOutputDirectory && files.length === 1) {
      // Cas simple : 1 entrée -> 1 sortie explicite
      outputPath = outputArg;
    } else {
      // Cas batch ou sortie dossier
      const parsedPath = path.parse(file);
      
      // Si on écrit dans un dossier différent, on garde le nom d'origine par défaut
      // Sauf si l'utilisateur veut explicitement un suffixe (non géré ici pour simplifier)
      const fileName = parsedPath.name + parsedPath.ext;
      const fileNameWithSuffix = `${parsedPath.name}_pixelated${parsedPath.ext}`;

      if (isOutputDirectory && outputArg) {
        // Si dossier de sortie différent, on garde le nom original (plus propre)
        outputPath = path.join(outputArg, fileName);
      } else {
        // Même dossier que l'original -> suffixe obligatoire pour ne pas écraser
        outputPath = path.join(parsedPath.dir, fileNameWithSuffix);
      }
    }

    processImage(file, outputPath);
  }
}

main();
