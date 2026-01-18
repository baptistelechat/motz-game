import { THEME_COLORS } from "@/lib/constants/theme";
import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Motz Game",
    short_name: "Motz Game",
    lang: "fr",
    description: "Jeu de mots multijoueur temps réel avec design Pixel-Pop",
    start_url: "/",
    display: "standalone",
    background_color: THEME_COLORS.background,
    theme_color: THEME_COLORS.background,
    icons: [
      {
        src: "/icon.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      {
        src: "/icon.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      {
        src: "/icon.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
