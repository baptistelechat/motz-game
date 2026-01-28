import { validateWord } from "@/lib/game/validation";
import { RoundConstraints } from "@/types/game";
import { describe, expect, it } from "vitest";

describe("validateWord", () => {
  const mockDictionary = new Set([
    "TEST",
    "RATE",
    "TARTE",
    "ETAT",
    "TATE",
    "RARE",
    "TARTINE",
    "AEIOU",
    "YETI",
  ]);
  const dictionaryCheck = (w: string) => mockDictionary.has(w);

  const baseConstraints: RoundConstraints = {
    imposed_letter: "T",
    forbidden_letter: "A",
    constraint_card: { type: "free" },
  };

  it("should reject empty word", () => {
    expect(validateWord("", baseConstraints, dictionaryCheck).isValid).toBe(
      false,
    );
  });

  it("should reject word not in dictionary", () => {
    expect(validateWord("XYZ", baseConstraints, dictionaryCheck).error).toBe(
      "Mot inconnu",
    );
  });

  it("should validate imposed letter", () => {
    // Word "RARE" is in dict, has no T. Imposed is T.
    // Forbidden is A. "RARE" has A. So it fails both?
    // Checks order: Dict -> Imposed -> Forbidden.
    // RARE has A (forbidden) and no T (imposed).
    // Should fail on Imposed first.
    expect(validateWord("RARE", baseConstraints, dictionaryCheck).error).toBe(
      "Doit contenir T",
    );
  });

  it("should validate forbidden letter", () => {
    // "TATE" has T (imposed ok), but has A (forbidden).
    expect(validateWord("TATE", baseConstraints, dictionaryCheck).error).toBe(
      "Ne doit pas contenir A",
    );
  });

  it("should validate correct word (free card)", () => {
    // We need a word with T, no A.
    // "YETI" -> has T, no A. In dict.
    expect(validateWord("YETI", baseConstraints, dictionaryCheck).isValid).toBe(
      true,
    );
  });

  describe("Constraint Cards", () => {
    it("min_len", () => {
      const constraints: RoundConstraints = {
        ...baseConstraints,
        constraint_card: { type: "min_len", value: 5 },
      };
      // YETI is 4 chars -> Fail
      expect(validateWord("YETI", constraints, dictionaryCheck).error).toBe(
        "Minimum 5 lettres",
      );
    });

    it("max_len", () => {
      const constraints: RoundConstraints = {
        ...baseConstraints,
        forbidden_letter: "Z", // Change forbidden to allow TARTE (has A)
        constraint_card: { type: "max_len", value: 4 },
      };
      // TARTE is 5 chars -> Fail
      expect(validateWord("TARTE", constraints, dictionaryCheck).error).toBe(
        "Maximum 4 lettres",
      );
      // YETI is 4 chars -> OK
      expect(validateWord("YETI", constraints, dictionaryCheck).isValid).toBe(
        true,
      );
    });

    it("exact_len", () => {
      const constraints: RoundConstraints = {
        ...baseConstraints,
        forbidden_letter: "Z", // Change forbidden to allow TARTE (has A)
        constraint_card: { type: "exact_len", value: 4 },
      };
      // TARTE is 5 chars -> Fail
      expect(validateWord("TARTE", constraints, dictionaryCheck).error).toBe(
        "Exactement 4 lettres",
      );
      // YETI is 4 chars -> OK
      expect(validateWord("YETI", constraints, dictionaryCheck).isValid).toBe(
        true,
      );
    });

    it("starts_with_imposed", () => {
      const constraints: RoundConstraints = {
        imposed_letter: "T",
        forbidden_letter: "Z",
        constraint_card: { type: "starts_with_imposed" },
      };
      // TARTE starts with T. OK.
      expect(validateWord("TARTE", constraints, dictionaryCheck).isValid).toBe(
        true,
      );
      // ETAT has T, but starts with E. Fail.
      expect(validateWord("ETAT", constraints, dictionaryCheck).error).toBe(
        "Doit commencer par T",
      );
    });

    it("ends_with_imposed", () => {
      const constraints: RoundConstraints = {
        imposed_letter: "E",
        forbidden_letter: "Z",
        constraint_card: { type: "ends_with_imposed" },
      };
      // TARTE ends with E. OK.
      expect(validateWord("TARTE", constraints, dictionaryCheck).isValid).toBe(
        true,
      );
      // ETAT ends with T. Fail.
      expect(validateWord("ETAT", constraints, dictionaryCheck).error).toBe(
        "Doit finir par E",
      );
    });

    it("unique_chars", () => {
      const constraints: RoundConstraints = {
        imposed_letter: "R",
        forbidden_letter: "Z",
        constraint_card: { type: "unique_chars" },
      };
      // RATE -> R, A, T, E (unique). OK.
      expect(validateWord("RATE", constraints, dictionaryCheck).isValid).toBe(
        true,
      );
      // RARE -> R, A, R, E (R repeated). Fail.
      expect(validateWord("RARE", constraints, dictionaryCheck).error).toBe(
        "Lettres doivent être uniques",
      );
    });

    it("min_vowels", () => {
      const constraints: RoundConstraints = {
        imposed_letter: "A",
        forbidden_letter: "Z",
        constraint_card: { type: "min_vowels", value: 3 },
      };
      // AEIOU -> 5 vowels. OK.
      expect(validateWord("AEIOU", constraints, dictionaryCheck).isValid).toBe(
        true,
      );
      // RATE -> 2 vowels (A, E). Fail.
      expect(validateWord("RATE", constraints, dictionaryCheck).error).toBe(
        "Minimum 3 voyelles",
      );
    });
  });

  describe("Inversion Logic", () => {
    it("should swap imposed and forbidden letters", () => {
      const constraints: RoundConstraints = {
        imposed_letter: "T",
        forbidden_letter: "A",
        constraint_card: { type: "invert_letters" },
      };

      // Normally: Must have T, No A.
      // Inverted: Must have A, No T.

      // "RARE" -> Has A, No T. Should be VALID.
      expect(validateWord("RARE", constraints, dictionaryCheck).isValid).toBe(
        true,
      );

      // "YETI" -> Has T, No A.
      // Inverted: Must have A, No T.
      // YETI fails Imposed A first.
      expect(validateWord("YETI", constraints, dictionaryCheck).error).toBe(
        "Doit contenir A",
      );

      // "TARTINE" -> Has T and A.
      // Inverted: Must have A (OK), No T (Fail).
      expect(validateWord("TARTINE", constraints, dictionaryCheck).error).toBe(
        "Ne doit pas contenir T",
      );
    });
  });
});
