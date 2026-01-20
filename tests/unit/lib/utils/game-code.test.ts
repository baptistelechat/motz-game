import { describe, it, expect } from "vitest";
import { generateGameCode } from "@/lib/utils/game-code";

describe("generateGameCode", () => {
  it('should generate a code of length 6', () => {
    const code = generateGameCode();
    expect(code).toHaveLength(6);
  });

  it('should use uppercase alphanumeric characters', () => {
    const code = generateGameCode();
    expect(code).toMatch(/^[A-Z0-9]+$/);
  });

  it('should generate different codes', () => {
    const code1 = generateGameCode();
    const code2 = generateGameCode();
    expect(code1).not.toBe(code2);
  });
});
