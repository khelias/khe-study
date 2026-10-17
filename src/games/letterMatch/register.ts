/**
 * letter_match mechanic registration. See src/games/balanceScale/register.ts
 * for the established colocation pattern (ADR-0001).
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
import type { LetterMatchProblem } from '../../types/game';

gameRegistry.register<LetterMatchProblem>({
  id: 'letter_match',
  component: StandardGameView,
  generator: generateLetterMatch,
  config: LETTER_MATCH_CONFIG,
  validator: validateLetterMatch,
  skillIds: [LANGUAGE_VOCABULARY_SKILL.id],
  problemKey: (p) => `letter:${p.word}`,
});
