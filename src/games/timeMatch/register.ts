/**
 * time_match mechanic registration. See src/games/balanceScale/register.ts
 * for the established colocation pattern (ADR-0001).
 */

import { MATH_TIME_READING_PACK } from '../../curriculum/packs/math/time_reading';
import { MATH_TIME_READING_SKILL } from '../../curriculum/skills/math';
import { gameRegistry } from '../registry';
import { TIME_MATCH_CONFIG } from './config';
import { generateTimeMatch } from './generator';
import { validateTimeMatch } from './validator';
import { TimeGameView } from './View';
import type { TimeMatchProblem } from '../../types/game';

gameRegistry.register<TimeMatchProblem>({
  id: 'time_match',
  component: TimeGameView,
  generator: generateTimeMatch,
  config: TIME_MATCH_CONFIG,
  validator: validateTimeMatch,
  skillIds: [MATH_TIME_READING_SKILL.id],
  contentPackId: MATH_TIME_READING_PACK.id,
  problemKey: (p) => `time:${p.answer}`,
});
