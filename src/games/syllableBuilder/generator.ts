import { getPackItemsForLocale } from '../../curriculum';
import { LANGUAGE_SYLLABIFICATION_SKILL } from '../../curriculum/skills/language';
import { getSyllableWordsForLevel, type SyllableWord } from '../../curriculum/packs/language/types';
import { getRandom, uid } from '../../engine/rng';
import { getLocale } from '../../i18n/index';
import type { RngFunction, SyllableBuilderProblem } from '../../types/game';

/**
 * syllable_builder generator. Mechanic: order scrambled syllables into the
 * correct word. Content: LANGUAGE_SYLLABIFICATION_SKILL has one pack per locale
 * (et, en); the right one is resolved at runtime via getPackItemsForLocale.
 */
export function generateSyllableBuilder(
  level: number,
  rng: RngFunction = Math.random,
): SyllableBuilderProblem {
  const locale = getLocale();
  const words = getPackItemsForLocale<SyllableWord>(LANGUAGE_SYLLABIFICATION_SKILL.id, locale);
  const filtered = getSyllableWordsForLevel(words, 'starter', level);
  const wordObj = getRandom(filtered, rng);
  if (!wordObj) {
    throw new Error('No word found for syllable_builder game');
  }
  const syllables = wordObj.syllables;
  const shuffled = syllables
    .map((text, i) => ({
      text,
      id: `syl-${i}-${uid(rng)}`,
    }))
    .sort(() => rng() - 0.5);

  return {
    type: 'syllable_builder',
    target: syllables.join(''),
    emoji: wordObj.emoji,
    syllables,
    shuffled,
    uid: uid(rng),
  };
}
