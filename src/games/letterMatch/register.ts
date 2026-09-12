/**
 * letter_match mechanic registration. See src/games/balanceScale/register.ts
 * for the established colocation pattern (ADR-0001, Phase 1.6).
 *
 * Uses the shared StandardGameView (answer-card mechanic); only the generator,
 * validator, and config are mechanic-specific.
 */

import { LANGUAGE_VOCABULARY_SKILL } from '../../curriculum/skills/language';
import { StandardGameView } from '../../components/gameViews';
import { gameRegistry } from '../registry';
import { LETTER_MATCH_CONFIG } from './config';
import { generateLetterMatch } from './generator';
import { validateLetterMatch } from './validator';

gameRegistry.register({
  id: 'letter_match',
  component: StandardGameView,
  generator: generateLetterMatch,
  config: LETTER_MATCH_CONFIG,
  validator: validateLetterMatch,
  skillIds: [LANGUAGE_VOCABULARY_SKILL.id],
});
