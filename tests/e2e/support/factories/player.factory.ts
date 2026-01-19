import { AVATAR_COLORS } from "@/lib/constants/avatar";
import { ANIMALS } from "@/lib/constants/pseudo";
import { PlayerProfile } from "@/lib/schemas/player-schema";
import { faker } from "@faker-js/faker";

export const createPlayerProfile = (
  overrides: Partial<PlayerProfile> = {},
): PlayerProfile => ({
  pseudo:
    faker.helpers.arrayElement(["Super", "Mega", "Ultra"]) +
    "-" +
    faker.person.firstName(),
  avatar_config: {
    animal: faker.helpers.arrayElement(ANIMALS),
    color: faker.helpers.arrayElement(AVATAR_COLORS),
    ...overrides.avatar_config,
  },
  ...overrides,
});
