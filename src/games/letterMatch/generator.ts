import { ALPHABET } from '../../curriculum/packs/language/vocabulary';
import { getRandom, uid } from '../../engine/rng';
import type { LetterMatchProblem, RngFunction } from '../../types/game';

/** Lowercase letters a child mixes up by their shape. */
export const LOOK_ALIKE_GROUPS: readonly (readonly string[])[] = [
  ['b', 'd', 'p'],
  ['m', 'n'],
  ['i', 'j', 'l'],
  ['o', 'ö', 'õ'],
  ['a', 'ä'],
  ['u', 'ü'],
  ['s', 'š'],
  ['z', 'ž'],
];

const LOOK_ALIKE_FROM_LEVEL = 3;

/**
 * letter_match generator. Mechanic: an uppercase letter is shown and the
 * learner picks its lowercase form. Levels 1-2 offer three letters picked at
 * random; from level 3 four, with the letters that look like the answer first.
 */
export function generateLetterMatch(
  level: number,
  rng: RngFunction = Math.random,
): LetterMatchProblem {
  const targetUpper = getRandom(ALPHABET, rng);
  if (!targetUpper) {
    throw new Error('No letter found for letter_match game');
  }
  const targetLower = targetUpper.toLowerCase();
  const lowercase = ALPHABET.map((letter) => letter.toLowerCase());
  const opts = new Set([targetLower]);
  const optionCount = level >= LOOK_ALIKE_FROM_LEVEL ? 4 : 3;

  if (level >= LOOK_ALIKE_FROM_LEVEL) {
    const own = LOOK_ALIKE_GROUPS.find((group) => group.includes(targetLower)) ?? [];
    const others = LOOK_ALIKE_GROUPS.filter((group) => group !== own).flat();
    for (const pool of [own, others]) {
      const candidates = [...pool].sort(() => rng() - 0.5);
      for (const letter of candidates) {
        if (opts.size >= optionCount) break;
        opts.add(letter);
      }
    }
  }
  while (opts.size < optionCount) {
    const letter = getRandom(lowercase, rng);
    if (letter) opts.add(letter);
  }

  return {
    type: 'letter_match',
    display: targetUpper,
    options: Array.from(opts).sort(() => rng() - 0.5),
    answer: targetLower,
    uid: uid(rng),
  };
}
