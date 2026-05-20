/**
 * pattern (Pattern Train) mechanic registration. See src/games/balanceScale/register.ts
 * for the established colocation pattern (ADR-0001, Phase 1.6).
 */

import { MATH_PATTERN_SEQUENCES_PACK } from '../../curriculum/packs/math/pattern_sequences';
import { MATH_PATTERN_SEQUENCES_SKILL } from '../../curriculum/skills/math';
import { gameRegistry } from '../registry';
import { PATTERN_CONFIG } from './config';
import { generatePattern } from './generator';
import { validatePattern } from './validator';
import { PatternTrainView } from './View';

gameRegistry.register({
  id: 'pattern',
  component: PatternTrainView,
  generator: generatePattern,
  config: PATTERN_CONFIG,
  validator: validatePattern,
  skillIds: [MATH_PATTERN_SEQUENCES_SKILL.id],
  contentPackId: MATH_PATTERN_SEQUENCES_PACK.id,
});
