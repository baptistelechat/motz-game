import { ADJECTIVES, ANIMALS } from "@/lib/constants/pseudo";

export { ADJECTIVES, ANIMALS };

export function generateRandomPseudo(): string {
  const randomAnimal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const randomAdjective =
    ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const raw = `${randomAnimal}_${randomAdjective}`;
  return raw.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
