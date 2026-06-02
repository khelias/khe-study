import { getPackItemsForLocale } from '../../curriculum';
import { LANGUAGE_VOCABULARY_SKILL } from '../../curriculum/skills/language';
import type { VocabularyWord } from '../../curriculum/packs/language/types';
import { ALPHABET, getVocabularyWordsForLevel } from '../../curriculum/packs/language/vocabulary';
import { getRandom, uid } from '../../engine/rng';
import { getLocale } from '../../i18n/index';
import type { LetterObject, RngFunction, WordBuilderProblem } from '../../types/game';
import { applyLetterCase } from '../wordGames/letterCase';

/**
 * Add distractor letters (visually / phonetically similar where possible) to a
 * Word Builder letter pool so higher levels can't be solved by elimination.
 */
function addDistractorLetters(
  correctLetters: LetterObject[],
  count: number,
  language: string,
  rng: RngFunction,
): LetterObject[] {
  if (count === 0) return correctLetters;

  const distractors: LetterObject[] = [];
  const correctCharsRaw = correctLetters.map((l) => l.char);
  const hasUpper = correctCharsRaw.some((c) => c !== c.toLowerCase());
  const hasLower = correctCharsRaw.some((c) => c !== c.toUpperCase());
  const isTitleCase =
    correctCharsRaw.length > 0 &&
    correctCharsRaw[0] !== undefined &&
    correctCharsRaw[0] === correctCharsRaw[0].toUpperCase() &&
    correctCharsRaw.slice(1).every((c) => c === c.toLowerCase());
  const caseStyle: 'upper' | 'lower' | 'title' | 'mixed' = !hasLower
    ? 'upper'
    : !hasUpper
      ? 'lower'
      : isTitleCase
        ? 'title'
        : 'mixed';

  // Define visually and phonetically similar letters
  const similarLetters: Record<string, string[]> =
    language === 'en'
      ? {
          // English similar letters
          A: ['E', 'O', 'H'],
          B: ['D', 'P', 'R'],
          C: ['G', 'O', 'Q'],
          D: ['B', 'O', 'P'],
          E: ['F', 'A', 'B'],
          F: ['E', 'T', 'P'],
          G: ['C', 'O', 'Q'],
          H: ['N', 'K', 'A'],
          I: ['L', 'J', 'T'],
          J: ['I', 'L', 'T'],
          K: ['H', 'R', 'X'],
          L: ['I', 'T', 'J'],
          M: ['N', 'W', 'H'],
          N: ['M', 'H', 'R'],
          O: ['Q', 'C', 'G'],
          P: ['B', 'D', 'R'],
          Q: ['O', 'C', 'G'],
          R: ['P', 'B', 'K'],
          S: ['Z', 'C', 'G'],
          T: ['F', 'I', 'L'],
          U: ['V', 'W', 'Y'],
          V: ['U', 'Y', 'W'],
          W: ['M', 'V', 'U'],
          X: ['K', 'Y', 'Z'],
          Y: ['V', 'U', 'T'],
          Z: ['S', 'X', 'N'],
        }
      : {
          // Estonian similar letters
          A: ['Ä', 'E', 'O'],
          Ä: ['A', 'E', 'Ö'],
          E: ['A', 'Ä', 'I'],
          I: ['E', 'L', 'J'],
          O: ['Ö', 'A', 'Q'],
          Ö: ['O', 'Ü', 'Õ'],
          U: ['Ü', 'V', 'Y'],
          Ü: ['U', 'Ö', 'Y'],
          Õ: ['O', 'Ö', 'A'],
          K: ['G', 'H', 'R'],
          G: ['K', 'Q', 'C'],
          P: ['B', 'R', 'D'],
          B: ['P', 'D', 'R'],
          T: ['D', 'L', 'F'],
          D: ['T', 'B', 'P'],
          S: ['Z', 'Š', 'C'],
          Š: ['S', 'Z', 'Ž'],
          Z: ['S', 'Ž', 'Š'],
          Ž: ['Z', 'Š', 'S'],
          L: ['I', 'T', 'J'],
          R: ['K', 'P', 'N'],
          M: ['N', 'W', 'H'],
          N: ['M', 'R', 'H'],
        };

  const correctChars = correctCharsRaw.map((c) => c.toUpperCase());
  const availableLetters = language === 'en' ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('') : ALPHABET;

  for (let i = 0; i < count; i++) {
    let distractor: string = availableLetters[0] ?? 'A';

    // Try to find a visually/phonetically similar letter
    if (correctChars.length > 0 && rng() > 0.3) {
      const targetChar = correctChars[Math.floor(rng() * correctChars.length)];
      if (!targetChar) {
        // Fallback to random letter
        const randomLetter = availableLetters[Math.floor(rng() * availableLetters.length)];
        if (randomLetter) {
          distractor = randomLetter;
        }
      } else {
        const similar = similarLetters[targetChar];
        if (similar && similar.length > 0) {
          distractor = similar[Math.floor(rng() * similar.length)] as string;
        } else {
          // Fallback to random letter
          const randomLetter = availableLetters[Math.floor(rng() * availableLetters.length)];
          if (randomLetter) {
            distractor = randomLetter;
          }
        }
      }
    } else {
      // Random letter from alphabet
      const randomLetter = availableLetters[Math.floor(rng() * availableLetters.length)];
      if (randomLetter) {
        distractor = randomLetter;
      }
    }

    // Ensure we don't add a letter that's already in the correct set
    let attempts = 0;
    while (distractor && correctChars.includes(distractor.toUpperCase()) && attempts < 20) {
      const newDistractor = availableLetters[Math.floor(rng() * availableLetters.length)];
      if (newDistractor) {
        distractor = newDistractor;
      }
      attempts++;
    }
    if (!distractor) {
      distractor = availableLetters[0] ?? 'A';
    }

    let displayChar = distractor;
    if (caseStyle === 'upper') {
      displayChar = distractor.toUpperCase();
    } else if (caseStyle === 'lower' || caseStyle === 'title') {
      displayChar = distractor.toLowerCase();
    } else {
      displayChar = rng() > 0.5 ? distractor.toUpperCase() : distractor.toLowerCase();
    }

    distractors.push({
      char: displayChar,
      id: `distractor-${i}-${uid(rng)}`,
    });
  }

  return [...correctLetters, ...distractors];
}

/**
 * word_builder generator. Mechanic: order scrambled letters into the target
 * word, with similar-letter distractors and pre-filled anchors at higher
 * levels. Content: LANGUAGE_VOCABULARY_SKILL locale word packs.
 */
export function generateWordBuilder(
  level: number,
  rng: RngFunction = Math.random,
): WordBuilderProblem {
  const locale = getLocale();
  const words = getPackItemsForLocale<VocabularyWord>(LANGUAGE_VOCABULARY_SKILL.id, locale);
  const availableWords = getVocabularyWordsForLevel(words, level, {
    preferWithoutDiacritics: locale !== 'en' && level <= 2,
  });

  const wordObj = getRandom(availableWords, rng);
  if (!wordObj) {
    throw new Error('No word found for word_builder game');
  }

  // Apply letter case transformation based on level
  const displayWord = applyLetterCase(wordObj.w, level, rng);

  // Generate letter objects
  let letters: LetterObject[] = displayWord.split('').map((c, i) => ({
    char: c,
    id: `char-${i}-${uid(rng)}`,
  }));

  // Add distractor letters based on level
  const distractorCount = level <= 2 ? 0 : level <= 4 ? 1 : level <= 7 ? 2 : 3;
  if (distractorCount > 0) {
    letters = addDistractorLetters(letters, distractorCount, locale, rng);
  }

  // Shuffle all letters
  const shuffled = [...letters].sort(() => rng() - 0.5);

  // Pre-filled positions for longer words
  let preFilledPositions: number[] | undefined;
  if (displayWord.length >= 6) {
    const preFillCount = displayWord.length >= 7 ? 2 : 1;
    preFilledPositions = [];
    // Fill first position
    if (preFillCount >= 1) {
      preFilledPositions.push(0);
    }
    // Fill last position for 7+ letter words
    if (preFillCount >= 2) {
      preFilledPositions.push(displayWord.length - 1);
    }
  }

  return {
    type: 'word_builder',
    target: displayWord,
    emoji: wordObj.e,
    shuffled,
    preFilledPositions,
    uid: uid(rng),
  };
}
