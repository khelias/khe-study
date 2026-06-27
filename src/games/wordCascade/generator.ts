import { getPackItemsForLocale } from '../../curriculum';
import {
  LANGUAGE_LONG_VOCABULARY_SKILL,
  LANGUAGE_VOCABULARY_SKILL,
} from '../../curriculum/skills/language';
import type { VocabularyWord } from '../../curriculum/packs/language/types';
import { getVocabularyWordsForLength } from '../../curriculum/packs/language/vocabulary';
import { getRandom, uid } from '../../engine/rng';
import { getLocale } from '../../i18n/index';
import type { RngFunction, WordCascadeProblem } from '../../types/game';
import { applyLetterCase } from '../letterCase';

/**
 * word_cascade generator (core binding). Mechanic: catch falling letters to
 * build short, familiar words. Content: LANGUAGE_VOCABULARY_SKILL locale packs.
 */
export function generateWordCascade(
  level: number,
  rng: RngFunction = Math.random,
): WordCascadeProblem {
  const locale = getLocale();
  const words = getPackItemsForLocale<VocabularyWord>(LANGUAGE_VOCABULARY_SKILL.id, locale);

  // Levels map to word lengths (start short, grow gradually)
  // Allow longer words at earlier levels to increase variety
  // Level 1-2: allow 3-4 letter words (was: only 3)
  // Level 3-4: allow 4-5 letter words (was: only 4)
  // Level 5+: normal progression
  let desiredLen: number;
  if (level <= 2) {
    // Level 1-2: prefer 3, but allow 4
    desiredLen = rng() < 0.7 ? 3 : 4;
  } else if (level <= 4) {
    // Level 3-4: prefer 4, but allow 5
    desiredLen = rng() < 0.7 ? 4 : 5;
  } else {
    // Level 5+: normal progression
    desiredLen = Math.max(3, Math.min(7, 3 + Math.floor(level / 2)));
  }

  const bucket = getVocabularyWordsForLength(words, desiredLen, level, {
    fallbackLengths: [desiredLen - 1, desiredLen + 1, 3, 4, 5, 6, 7],
  });
  const chosen = (bucket.length > 0 ? getRandom(bucket, rng) : null) ?? {
    w: 'KASS',
    e: '🐱',
  };

  // Keep casing aligned with the existing word builder logic
  const target = applyLetterCase(chosen.w, level, rng);

  return {
    type: 'word_cascade',
    uid: uid(rng),
    target,
    emoji: chosen.e,
    columns: level < 6 ? 4 : 5,
  };
}

/**
 * word_cascade_long generator. Same mechanic / view as the core binding, bound
 * to the long-word pack for a harder challenge.
 */
export function generateWordCascadeLong(
  level: number,
  rng: RngFunction = Math.random,
): WordCascadeProblem {
  const locale = getLocale();
  const words = getPackItemsForLocale<VocabularyWord>(LANGUAGE_LONG_VOCABULARY_SKILL.id, locale);

  const desiredLen = level <= 3 ? 9 : 10;
  const bucket = getVocabularyWordsForLength(words, desiredLen, level, {
    fallbackLengths: [desiredLen + 1, desiredLen - 1, 11, 10, 9, 8],
  });
  const chosen = (bucket.length > 0 ? getRandom(bucket, rng) : null) ?? {
    w: locale === 'en' ? 'TELESCOPE' : 'TELESKOOP',
    e: '🔭',
  };

  const target = applyLetterCase(chosen.w, level, rng);

  return {
    type: 'word_cascade',
    uid: uid(rng),
    target,
    emoji: chosen.e,
    columns: 5,
  };
}
