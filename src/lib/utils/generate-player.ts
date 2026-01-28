import { AvatarConfig } from "@/interface/AvatarConfig";
import { AVATAR_COLORS } from "../constants/avatar";
import { ADJECTIVES, ANIMALS } from "../constants/pseudo";

export const generateRandomPseudo = (): string => {
  const randomAnimal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const randomAdjective =
    ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const raw = `${randomAnimal}_${randomAdjective}`;
  return raw.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

export const generateRandomAvatar = (): AvatarConfig => {
  const randomAnimal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const randomColor =
    AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
  return { animal: randomAnimal, color: randomColor };
};

export const generateRandomPlayer = (prefix: string = "") => {
  let effectivePrefix = prefix;
  if (
    !effectivePrefix &&
    typeof window !== "undefined" &&
    window.localStorage.getItem("motz-e2e-mode") === "true"
  ) {
    effectivePrefix = "E2E";
  }

  return {
    pseudo: `${effectivePrefix ? `${effectivePrefix}-` : ""}${generateRandomPseudo()}`,
    avatar_config: generateRandomAvatar(),
  };
};
