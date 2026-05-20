/**
 * compare_sizes mechanic registration. See src/games/balanceScale/register.ts
 * for the established colocation pattern (ADR-0001, Phase 1.6).
 */

import { MATH_COMPARE_NUMBERS_PACK } from '../../curriculum/packs/math/compare_numbers';
import { MATH_COMPARE_NUMBERS_SKILL } from '../../curriculum/skills/math';
import { gameRegistry } from '../registry';
import { COMPARE_SIZES_CONFIG } from './config';
import { generateCompareSizes } from './generator';
import { validateCompareSizes } from './validator';
import { CompareSizesView } from './View';

gameRegistry.register({
  id: 'compare_sizes',
  component: CompareSizesView,
  generator: generateCompareSizes,
  config: COMPARE_SIZES_CONFIG,
  validator: validateCompareSizes,
  skillIds: [MATH_COMPARE_NUMBERS_SKILL.id],
  contentPackId: MATH_COMPARE_NUMBERS_PACK.id,
});
