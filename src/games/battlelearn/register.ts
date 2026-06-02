/**
 * BattleLearn family registrations. See src/games/balanceScale/register.ts for
 * the established colocation pattern (ADR-0001, Phase 1.6).
 *
 * One mechanic (BattleLearnView + battlelearn engine + question helpers), three
 * bindings: a mixed-problem default plus two multiplication packs. All three
 * share the generator/validator/view; only the skill + content pack differ.
 */

import {
  MATH_MIXED_PROBLEM_SOLVING_SKILL,
  MATH_MULTIPLICATION_1_TO_5_SKILL,
  MATH_MULTIPLICATION_1_TO_10_SKILL,
} from '../../curriculum/skills/math';
import {
  MATH_BATTLELEARN_PACK,
  MATH_BATTLELEARN_MULTIPLICATION_PACK,
  MATH_BATTLELEARN_MULTIPLICATION_1_5_PACK,
} from '../../curriculum/packs/math/battlelearn';
import { gameRegistry } from '../registry';
import {
  BATTLELEARN_CONFIG,
  BATTLELEARN_MULTIPLICATION_CONFIG,
  BATTLELEARN_MULTIPLICATION_1_5_CONFIG,
} from './config';
import { generateBattleLearn } from './generator';
import { validateBattleLearn } from './validator';
import { BattleLearnView } from './View';

// BattleLearn (profile-based difficulty in generator)
gameRegistry.register({
  id: 'battlelearn',
  component: BattleLearnView,
  generator: generateBattleLearn,
  config: BATTLELEARN_CONFIG,
  validator: validateBattleLearn,
  skillIds: [MATH_MIXED_PROBLEM_SOLVING_SKILL.id],
  contentPackId: MATH_BATTLELEARN_PACK.id,
});

gameRegistry.register({
  id: 'battlelearn_multiplication',
  component: BattleLearnView,
  generator: generateBattleLearn,
  config: BATTLELEARN_MULTIPLICATION_CONFIG,
  validator: validateBattleLearn,
  skillIds: [MATH_MULTIPLICATION_1_TO_10_SKILL.id],
  contentPackId: MATH_BATTLELEARN_MULTIPLICATION_PACK.id,
});

gameRegistry.register({
  id: 'battlelearn_multiplication_1_5',
  component: BattleLearnView,
  generator: generateBattleLearn,
  config: BATTLELEARN_MULTIPLICATION_1_5_CONFIG,
  validator: validateBattleLearn,
  skillIds: [MATH_MULTIPLICATION_1_TO_5_SKILL.id],
  contentPackId: MATH_BATTLELEARN_MULTIPLICATION_1_5_PACK.id,
});
