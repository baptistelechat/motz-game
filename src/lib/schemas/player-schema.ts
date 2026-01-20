import { z } from 'zod';

export const playerProfileSchema = z.object({
  pseudo: z
    .string()
    .min(3, { message: 'Le pseudo doit contenir au moins 3 caractères' })
    .max(25, { message: 'Le pseudo doit contenir au plus 25 caractères' })
    .regex(/^[a-zA-Z0-9_-]+$/, {
      message: 'Le pseudo ne peut contenir que des lettres, chiffres, tirets et underscores',
    }),
  avatar_config: z.object({
    animal: z.string(),
    color: z.string(),
  }),
});

export type PlayerProfile = z.infer<typeof playerProfileSchema>;
