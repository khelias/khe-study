/**
 * pattern (Pattern Train) mechanic registration. See src/games/balanceScale/register.ts
 * for the established colocation pattern (ADR-0001).
 */

import { MATH_PATTERN_SEQUENCES_PACK } from '../../curriculum/packs/math/pattern_sequences';
import { MATH_PATTERN_SEQUENCES_SKILL } from '../../curriculum/skills/math';
import { gameRegistry } from '../registry';
import { PATTERN_CONFIG } from './config';
import { generatePattern } from './generator';
import { validatePattern } from './validator';
import { PatternTrainView } from './View';
import type { PatternProblem } from '../../types/game';

gameRegistry.register<PatternProblem>({
  id: 'pattern',
  component: PatternTrainView,
  generator: generatePattern,
  config: PATTERN_CONFIG,
  validator: validatePattern,
  skillIds: [MATH_PATTERN_SEQUENCES_SKILL.id],
  contentPackId: MATH_PATTERN_SEQUENCES_PACK.id,
  problemKey: (p) => `pat:${p.sequence.join('')}:${p.answer}`,
  cloneProblem: (p) => ({ ...p, sequence: [...p.sequence], options: [...p.options] }),
});
