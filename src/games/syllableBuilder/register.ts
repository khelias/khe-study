/**
 * syllable_builder mechanic registration. See src/games/balanceScale/register.ts
 * for the established colocation pattern (ADR-0001, Phase 1.6).
 *
 * Mechanic: order scrambled syllables into the correct word.
 * Content: LANGUAGE_SYLLABIFICATION_SKILL has one pack per locale (et, en);
 * the generator resolves the right one at runtime via getPackItemsForLocale.
 */

import { LANGUAGE_SYLLABIFICATION_SKILL } from '../../curriculum/skills/language';
import { gameRegistry } from '../registry';
import { SYLLABLE_BUILDER_CONFIG } from './config';
import { generateSyllableBuilder } from './generator';
import { validateSyllableBuilder } from './validator';
import { SyllableGameView } from './View';

gameRegistry.register({
  id: 'syllable_builder',
  component: SyllableGameView,
  generator: generateSyllableBuilder,
  config: SYLLABLE_BUILDER_CONFIG,
  validator: validateSyllableBuilder,
  skillIds: [LANGUAGE_SYLLABIFICATION_SKILL.id],
});
