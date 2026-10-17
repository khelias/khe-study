/**
 * balance_scale mechanic registration.
 *
 * Importing this module from `src/games/registrations.ts` has the side
 * effect of registering the binding with `gameRegistry`. The shape mirrors
 * the colocated-mechanic pattern targeted by ADR-0001: one folder owns
 * the mechanic's config, generator, validator, view, and registration.
 */

import { MATH_BALANCE_EQUATIONS_PACK } from '../../curriculum/packs/math/balance_equations';
import { MATH_BALANCE_EQUATIONS_SKILL } from '../../curriculum/skills/math';
import { gameRegistry } from '../registry';
import { BALANCE_SCALE_CONFIG } from './config';
import { generateBalanceScale } from './generator';
import { validateBalanceScale } from './validator';
import { BalanceScaleView } from './View';
import type { BalanceScaleProblem } from '../../types/game';

gameRegistry.register<BalanceScaleProblem>({
  id: 'balance_scale',
  component: BalanceScaleView,
  generator: generateBalanceScale,
  config: BALANCE_SCALE_CONFIG,
  validator: validateBalanceScale,
  skillIds: [MATH_BALANCE_EQUATIONS_SKILL.id],
  contentPackId: MATH_BALANCE_EQUATIONS_PACK.id,
  problemKey: (p) => `bal:${p.display.left.join(',')}|${p.display.right.join(',')}`,
  cloneProblem: (p) => ({
    ...p,
    display: { ...p.display, left: [...p.display.left], right: [...p.display.right] },
    options: [...p.options],
  }),
});
