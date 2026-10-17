/**
 * memory_math mechanic registration. See src/games/balanceScale/register.ts
 * for the established colocation pattern (ADR-0001).
 */

import { MATH_ADDITION_MEMORY_PACK } from '../../curriculum/packs/math/addition_memory';
import { MATH_ADDITION_MEMORY_SKILL } from '../../curriculum/skills/math';
import { gameRegistry } from '../registry';
import { MEMORY_MATH_CONFIG } from './config';
import { generateMemoryMath } from './generator';
import { validateMemoryMath } from './validator';
import { MemoryGameView } from './View';
import type { MemoryMathProblem } from '../../types/game';

gameRegistry.register<MemoryMathProblem>({
  id: 'memory_math',
  component: MemoryGameView,
  generator: generateMemoryMath,
  config: MEMORY_MATH_CONFIG,
  validator: validateMemoryMath,
  skillIds: [MATH_ADDITION_MEMORY_SKILL.id],
  contentPackId: MATH_ADDITION_MEMORY_PACK.id,
  problemKey: (p) => `mem:${p.cards.map((c) => c.content).join('|')}`,
  cloneProblem: (p) => ({ ...p, cards: [...p.cards] }),
});
