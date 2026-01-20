import { customAlphabet } from "nanoid";

// Alphabet: Uppercase letters and Numbers
// 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ
export const generateGameCode = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  6,
);
