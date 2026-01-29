import { z } from 'zod';

export const pointsDetailsSchema = z.object({
  word_score: z.number(),
  speed_bonus: z.number(),
  total_score: z.number(),
  letters: z.array(z.object({
    char: z.string().length(1),
    score: z.number()
  })),
  rank: z.number().optional(),
});

export const submissionSchema = z.object({
  id: z.string().uuid(),
  game_id: z.string().uuid(),
  round_id: z.string().uuid(),
  player_id: z.string().uuid(),
  word: z.string(),
  score: z.number(),
  points_details: pointsDetailsSchema.nullable(),
  is_valid: z.boolean(),
  rejection_reason: z.string().nullable(),
  created_at: z.string().datetime(),
});

export type Submission = z.infer<typeof submissionSchema>;
export type PointsDetails = z.infer<typeof pointsDetailsSchema>;

export const submitWordSchema = z.object({
  gameId: z.string().uuid(),
  roundId: z.string().uuid(),
  word: z.string().min(1).max(30), // Max length reasonable for a word
});

export type SubmitWordInput = z.infer<typeof submitWordSchema>;
