/**
 * time_match mechanic registration. See src/games/balanceScale/register.ts
 * for the established colocation pattern (ADR-0001, Phase 1.6).
 */

import { MATH_TIME_READING_PACK } from '../../curriculum/packs/math/time_reading';
import { MATH_TIME_READING_SKILL } from '../../curriculum/skills/math';
import { gameRegistry } from '../registry';
import { TIME_MATCH_CONFIG } from './config';
import { generateTimeMatch } from './generator';
import { validateTimeMatch } from './validator';
import { TimeGameView } from './View';

gameRegistry.register({
  id: 'time_match',
  component: TimeGameView,
  generator: generateTimeMatch,
  config: TIME_MATCH_CONFIG,
  validator: validateTimeMatch,
  skillIds: [MATH_TIME_READING_SKILL.id],
  contentPackId: MATH_TIME_READING_PACK.id,
});
