import { cn } from '@/lib/utils';
import { describe, it, expect } from 'vitest';

describe('utils', () => {
  describe('cn', () => {
    it('should merge classes correctly', () => {
      const result = cn('text-red-500', 'bg-blue-500');
      expect(result).toBe('text-red-500 bg-blue-500');
    });

    it('should handle conditional classes', () => {
      const result = cn('text-red-500', true && 'bg-blue-500', false && 'text-green-500');
      expect(result).toBe('text-red-500 bg-blue-500');
    });

    it('should resolve tailwind conflicts', () => {
      const result = cn('text-red-500', 'text-blue-500');
      expect(result).toBe('text-blue-500');
    });

    it('should handle undefined and null values', () => {
      const result = cn('text-red-500', undefined, null, 'bg-blue-500');
      expect(result).toBe('text-red-500 bg-blue-500');
    });
  });
});
