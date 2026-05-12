/**
 * Content pack: division facts mirroring multiplication 1–5.
 *
 * Quotient and divisor both in [2, 5]; the dividend is their product.
 * Same 16-fact span as multiplication_1_5, addressing the inverse direction.
 * Consumed by the fact_drill mechanic; future math_snake/division bindings
 * could read the same spec pool.
 */

import type { ContentPack } from '../../types';
import type { ArithmeticSpec } from './types';
import { MATH_DIVISION_FACTS_1_TO_5_SKILL } from '../../skills/math';

const SPECS: readonly ArithmeticSpec[] = [
  { op: 'div_result', factorRange: [2, 5] },
  { op: 'div_missing', unlockLevel: 3, factorRange: [2, 5] },
];

export const MATH_DIVISION_FACTS_1_5_PACK: ContentPack<ArithmeticSpec> = {
  id: 'math.division_facts_1_5',
  skillId: MATH_DIVISION_FACTS_1_TO_5_SKILL.id,
  locale: 'et',
  version: '1.0.0',
  title: { et: 'Jagamine 1–5', en: 'Division 1–5' },
  items: SPECS,
};
