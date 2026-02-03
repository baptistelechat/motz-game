import { customAlphabet } from "nanoid";

// Alphabet: Uppercase letters and Numbers
export const generateGameCode = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  6,
);
