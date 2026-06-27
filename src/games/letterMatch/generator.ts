import { getPackItemsForLocale } from '../../curriculum';
import { LANGUAGE_VOCABULARY_SKILL } from '../../curriculum/skills/language';
import type { VocabularyWord } from '../../curriculum/packs/language/types';
import {
  ALPHABET,
  getVocabularyWordsAvailableForLevel,
} from '../../curriculum/packs/language/vocabulary';
import { getRandom, uid } from '../../engine/rng';
import type { LetterMatchProblem, RngFunction } from '../../types/game';

/**
 * letter_match generator. Mechanic: an uppercase letter is shown and the
 * learner picks its matching lowercase form from increasingly similar
 * distractors. Content: vocabulary words supply a level-appropriate emoji for
 * the target letter.
 */
export function generateLetterMatch(
  level: number,
  rng: RngFunction = Math.random,
): LetterMatchProblem {
  // Select uppercase letter - this is what is shown
  const targetUpper = getRandom(ALPHABET, rng);
  if (!targetUpper) {
    throw new Error('No letter found for letter_match game');
  }
  const targetLower = targetUpper.toLowerCase();

  // Generate wrong choices - lowercase letters
  const opts = new Set([targetLower]);

  // Level 1-2: random lowercase letters
  // Level 3-4: similar lowercase letters
  // Level 5+: very similar lowercase letters
  const similarLetters =
    level >= 5
      ? ALPHABET.filter((l) => {
          // Find letters that are close in alphabet
          const targetIdx = ALPHABET.indexOf(targetUpper);
          return Math.abs(ALPHABET.indexOf(l) - targetIdx) <= 2 && l !== targetUpper;
        })
      : level >= 3
        ? ALPHABET.filter((l) => {
            // Find letters that are close in alphabet (laiem)
            const targetIdx = ALPHABET.indexOf(targetUpper);
            return Math.abs(ALPHABET.indexOf(l) - targetIdx) <= 5 && l !== targetUpper;
          })
        : ALPHABET;

  // Level 3+ - show more choices (4 instead of 3)
  const optionCount = level >= 3 ? 4 : 3;
  while (opts.size < optionCount) {
    const r = getRandom(similarLetters.length > 0 ? similarLetters : ALPHABET, rng);
    if (r && r !== targetUpper) opts.add(r.toLowerCase());
  }

  // Find a word that contains the target letter (for emoji)
  let wordObj: Pick<VocabularyWord, 'w' | 'e'> | null = null;
  const vocabularyWords = getVocabularyWordsAvailableForLevel(
    getPackItemsForLocale<VocabularyWord>(LANGUAGE_VOCABULARY_SKILL.id, 'et'),
    level,
  );
  const letterWords = vocabularyWords.filter((word) => word.w.includes(targetUpper));
  if (letterWords.length > 0) {
    wordObj = getRandom(letterWords, rng);
  }
  if (!wordObj) {
    wordObj = { w: targetUpper, e: '❓' };
  }

  return {
    type: 'letter_match',
    word: wordObj.w,
    emoji: wordObj.e,
    display: targetUpper, // Show uppercase letter
    targetLetter: targetLower, // Correct answer is lowercase letter
    targetPosition: 0, // No longer needed, but kept for compatibility
    options: Array.from(opts).sort(() => rng() - 0.5),
    answer: targetLower,
    uid: uid(rng),
  };
}
