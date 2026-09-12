/**
 * word_builder mechanic registration. See src/games/balanceScale/register.ts
 * for the established colocation pattern (ADR-0001, Phase 1.6).
 *
 * Mechanic: order scrambled letters into the target word.
 * Content: LANGUAGE_VOCABULARY_SKILL locale word packs (resolved at runtime).
 */

import { LANGUAGE_VOCABULARY_SKILL } from '../../curriculum/skills/language';
import { gameRegistry } from '../registry';
import { WORD_BUILDER_CONFIG } from './config';
import { generateWordBuilder } from './generator';
import { validateWordBuilder } from './validator';
import { WordGameView } from './View';

gameRegistry.register({
  id: 'word_builder',
  component: WordGameView,
  generator: generateWordBuilder,
  config: WORD_BUILDER_CONFIG,
  validator: validateWordBuilder,
  skillIds: [LANGUAGE_VOCABULARY_SKILL.id],
});
