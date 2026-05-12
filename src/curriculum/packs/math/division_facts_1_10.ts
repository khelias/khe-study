/**
 * Content pack: division facts mirroring multiplication 1–10.
 *
 * Quotient and divisor both in [2, 10]; the dividend is their product.
 * 45 unique facts (the inverse of the full põhikool times table).
 */

import type { ContentPack } from '../../types';
import type { ArithmeticSpec } from './types';
import { MATH_DIVISION_FACTS_1_TO_10_SKILL } from '../../skills/math';

const SPECS: readonly ArithmeticSpec[] = [
  { op: 'div_result', factorRange: [2, 10], valueRange: [4, 100] },
  { op: 'div_missing', factorRange: [2, 10], valueRange: [4, 100], unlockLevel: 3 },
];

export const MATH_DIVISION_FACTS_1_10_PACK: ContentPack<ArithmeticSpec> = {
  id: 'math.division_facts_1_10',
  skillId: MATH_DIVISION_FACTS_1_TO_10_SKILL.id,
  locale: 'et',
  version: '1.0.0',
  title: { et: 'Jagamine 1–10', en: 'Division 1–10' },
  items: SPECS,
};
