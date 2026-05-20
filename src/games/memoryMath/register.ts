/**
 * memory_math mechanic registration. See src/games/balanceScale/register.ts
 * for the established colocation pattern (ADR-0001, Phase 1.6).
 */

import { MATH_ADDITION_MEMORY_PACK } from '../../curriculum/packs/math/addition_memory';
import { MATH_ADDITION_MEMORY_SKILL } from '../../curriculum/skills/math';
import { gameRegistry } from '../registry';
import { MEMORY_MATH_CONFIG } from './config';
import { generateMemoryMath } from './generator';
import { validateMemoryMath } from './validator';
import { MemoryGameView } from './View';

gameRegistry.register({
  id: 'memory_math',
  component: MemoryGameView,
  generator: generateMemoryMath,
  config: MEMORY_MATH_CONFIG,
  validator: validateMemoryMath,
  skillIds: [MATH_ADDITION_MEMORY_SKILL.id],
  contentPackId: MATH_ADDITION_MEMORY_PACK.id,
});
