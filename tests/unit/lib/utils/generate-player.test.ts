import { describe, it, expect } from 'vitest';
import { generateRandomPseudo, generateRandomPlayer } from '@/lib/utils/generate-player';

describe('generateRandomPseudo', () => {
  it('should return a non-empty string', () => {
    const pseudo = generateRandomPseudo();
    expect(typeof pseudo).toBe('string');
    expect(pseudo.length).toBeGreaterThan(0);
  });

  it('should format as Animal_Adjective (normalized)', () => {
    const pseudo = generateRandomPseudo();
    // Normalize checks: No accents, just letters, hyphens and underscore
    expect(pseudo).toMatch(/^[a-zA-Z-]+_[a-zA-Z-]+$/);
  });
});

describe('generateRandomPlayer', () => {
  it('should return a player object with pseudo and avatar', () => {
    const player = generateRandomPlayer();
    expect(player).toHaveProperty('pseudo');
    expect(player).toHaveProperty('avatar_config');
    expect(player.avatar_config).toHaveProperty('animal');
    expect(player.avatar_config).toHaveProperty('color');
  });

  it('should support prefix', () => {
    const player = generateRandomPlayer('TEST');
    expect(player.pseudo).toMatch(/^TEST-[a-zA-Z]+_[a-zA-Z]+$/);
  });
});
