import type { RngFunction } from '../../types/game';

/**
 * Shared casing helper for the word-building mechanics (Word Builder + Word
 * Cascade). Casing eases learners from all-caps into mixed case as level rises.
 *
 * - Level 1-3: ALL UPPERCASE (KASS)
 * - Level 4-6: Title case (Kass)
 * - Level 7-9: all lowercase (kass)
 * - Level 10+: Mixed case (KaSs), first letter always uppercase
 */
export function applyLetterCase(word: string, level: number, rng: RngFunction): string {
  // Level 1-3: All uppercase (KASS)
  if (level <= 3) {
    return word.toUpperCase();
  }
  // Level 4-6: Title case (Kass) to ease into lowercase
  if (level <= 6) {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }
  // Level 7-9: All lowercase (kass)
  if (level <= 9) {
    return word.toLowerCase();
  }
  // Level 10+: Mixed case (KaSs, KoEr)
  return word
    .split('')
    .map((char, idx) => {
      // First letter is always uppercase
      if (idx === 0) return char.toUpperCase();
      // Random case for other letters
      return rng() > 0.5 ? char.toUpperCase() : char.toLowerCase();
    })
    .join('');
}
