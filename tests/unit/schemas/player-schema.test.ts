import { describe, it, expect } from 'vitest';
import { playerProfileSchema } from '@/lib/schemas/player-schema';
import { AVATAR_COLORS } from '@/lib/constants/avatar';

describe('playerProfileSchema', () => {
  it('should validate a correct profile', () => {
    const validProfile = {
      pseudo: 'Renard_Rapide',
      avatar_config: {
        animal: 'fox',
        color: AVATAR_COLORS[5],
      },
    };
    const result = playerProfileSchema.safeParse(validProfile);
    expect(result.success).toBe(true);
  });

  it('should reject pseudo too short', () => {
    const invalidProfile = {
      pseudo: 'ab',
      avatar_config: { animal: 'fox', color: AVATAR_COLORS[2] },
    };
    const result = playerProfileSchema.safeParse(invalidProfile);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('3');
    }
  });

  it('should reject pseudo too long', () => {
    const invalidProfile = {
      pseudo: 'a'.repeat(26),
      avatar_config: { animal: 'fox', color: AVATAR_COLORS[2] },
    };
    const result = playerProfileSchema.safeParse(invalidProfile);
    expect(result.success).toBe(false);
  });

  it('should reject pseudo with invalid characters', () => {
    const invalidProfile = {
      pseudo: 'Renard Rapide', // Space not allowed
      avatar_config: { animal: 'fox', color: AVATAR_COLORS[2] },
    };
    const result = playerProfileSchema.safeParse(invalidProfile);
    expect(result.success).toBe(false);
  });

  it('should require avatar_config', () => {
    const invalidProfile = {
      pseudo: 'Renard',
    };
    const result = playerProfileSchema.safeParse(invalidProfile);
    expect(result.success).toBe(false);
  });
});
