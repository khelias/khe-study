/**
 * letter_match mechanic registration. See src/games/balanceScale/register.ts
 * for the established colocation pattern (ADR-0001).
 *
 * Mechanic: pick the lowercase form of an uppercase letter. LetterMatchView
 * sits on the shared AnswerCardView shell.
 */

import { LANGUAGE_VOCABULARY_SKILL } from '../../curriculum/skills/language';
import { gameRegistry } from '../registry';
import { LETTER_MATCH_CONFIG } from './config';
import { generateLetterMatch } from './generator';
import { validateLetterMatch } from './validator';
import { LetterMatchView } from './View';
import type { LetterMatchProblem } from '../../types/game';

gameRegistry.register<LetterMatchProblem>({
  id: 'letter_match',
  component: LetterMatchView,
  generator: generateLetterMatch,
  config: LETTER_MATCH_CONFIG,
  validator: validateLetterMatch,
  skillIds: [LANGUAGE_VOCABULARY_SKILL.id],
  problemKey: (p) => `letter:${p.display}`,
});
