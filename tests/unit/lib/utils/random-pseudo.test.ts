import { describe, it, expect } from 'vitest';
import { generateRandomPseudo } from '@/lib/utils/random-pseudo';

describe('generateRandomPseudo', () => {
  it('should return a non-empty string', () => {
    const pseudo = generateRandomPseudo();
    expect(typeof pseudo).toBe('string');
    expect(pseudo.length).toBeGreaterThan(0);
  });

  it('should format as Animal_Adjective', () => {
    const pseudo = generateRandomPseudo();
    expect(pseudo).toMatch(/^[a-zA-Z]+_[a-zA-Z]+$/);
  });
});
