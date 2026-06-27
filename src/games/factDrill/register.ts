/**
 * Fact Drill family registrations. See src/games/balanceScale/register.ts for
 * the established colocation pattern (ADR-0001, Phase 1.6).
 *
 * One mechanic (FactDrillView + factDrill engine), eight skills. Each binding
 * reuses the same engine + view; the only per-binding data is the factor range
 * + skill + pack. Future fact bindings land as data-only changes.
 */

import {
  MATH_ADDITION_WITHIN_20_SKILL,
  MATH_ADDITION_WITHIN_100_SKILL,
  MATH_SUBTRACTION_WITHIN_20_SKILL,
  MATH_SUBTRACTION_WITHIN_100_SKILL,
  MATH_MULTIPLICATION_1_TO_5_SKILL,
  MATH_MULTIPLICATION_1_TO_10_SKILL,
  MATH_DIVISION_FACTS_1_TO_5_SKILL,
  MATH_DIVISION_FACTS_1_TO_10_SKILL,
} from '../../curriculum/skills/math';
import { MATH_ADDITION_WITHIN_20_PACK } from '../../curriculum/packs/math/addition_within_20';
import { MATH_ADDITION_WITHIN_100_PACK } from '../../curriculum/packs/math/addition_within_100';
import { MATH_SUBTRACTION_WITHIN_20_PACK } from '../../curriculum/packs/math/subtraction_within_20';
import { MATH_SUBTRACTION_WITHIN_100_PACK } from '../../curriculum/packs/math/subtraction_within_100';
import { MATH_MULTIPLICATION_1_5_PACK } from '../../curriculum/packs/math/multiplication_1_5';
import { MATH_MULTIPLICATION_1_10_PACK } from '../../curriculum/packs/math/multiplication_1_10';
import { MATH_DIVISION_FACTS_1_5_PACK } from '../../curriculum/packs/math/division_facts_1_5';
import { MATH_DIVISION_FACTS_1_10_PACK } from '../../curriculum/packs/math/division_facts_1_10';
import { gameRegistry } from '../registry';
import {
  MULTIPLICATION_FACT_DRILL_1_5_CONFIG,
  MULTIPLICATION_FACT_DRILL_1_10_CONFIG,
  ADDITION_FACT_DRILL_WITHIN_20_CONFIG,
  ADDITION_FACT_DRILL_WITHIN_100_CONFIG,
  SUBTRACTION_FACT_DRILL_WITHIN_20_CONFIG,
  SUBTRACTION_FACT_DRILL_WITHIN_100_CONFIG,
  DIVISION_FACT_DRILL_1_5_CONFIG,
  DIVISION_FACT_DRILL_1_10_CONFIG,
} from './config';
import {
  generateMultiplicationFactDrill1To5,
  generateMultiplicationFactDrill1To10,
  generateAdditionFactDrillWithin20,
  generateAdditionFactDrillWithin100,
  generateSubtractionFactDrillWithin20,
  generateSubtractionFactDrillWithin100,
  generateDivisionFactDrill1To5,
  generateDivisionFactDrill1To10,
} from './generator';
import { validateFactDrill } from './validator';
import { FactDrillView } from './View';

gameRegistry.register({
  id: 'multiplication_fact_drill_1_5',
  component: FactDrillView,
  generator: generateMultiplicationFactDrill1To5,
  config: MULTIPLICATION_FACT_DRILL_1_5_CONFIG,
  validator: validateFactDrill,
  skillIds: [MATH_MULTIPLICATION_1_TO_5_SKILL.id],
  contentPackId: MATH_MULTIPLICATION_1_5_PACK.id,
});

gameRegistry.register({
  id: 'multiplication_fact_drill_1_10',
  component: FactDrillView,
  generator: generateMultiplicationFactDrill1To10,
  config: MULTIPLICATION_FACT_DRILL_1_10_CONFIG,
  validator: validateFactDrill,
  skillIds: [MATH_MULTIPLICATION_1_TO_10_SKILL.id],
  contentPackId: MATH_MULTIPLICATION_1_10_PACK.id,
});

gameRegistry.register({
  id: 'addition_fact_drill_within_20',
  component: FactDrillView,
  generator: generateAdditionFactDrillWithin20,
  config: ADDITION_FACT_DRILL_WITHIN_20_CONFIG,
  validator: validateFactDrill,
  skillIds: [MATH_ADDITION_WITHIN_20_SKILL.id],
  contentPackId: MATH_ADDITION_WITHIN_20_PACK.id,
});

gameRegistry.register({
  id: 'addition_fact_drill_within_100',
  component: FactDrillView,
  generator: generateAdditionFactDrillWithin100,
  config: ADDITION_FACT_DRILL_WITHIN_100_CONFIG,
  validator: validateFactDrill,
  skillIds: [MATH_ADDITION_WITHIN_100_SKILL.id],
  contentPackId: MATH_ADDITION_WITHIN_100_PACK.id,
});

gameRegistry.register({
  id: 'subtraction_fact_drill_within_20',
  component: FactDrillView,
  generator: generateSubtractionFactDrillWithin20,
  config: SUBTRACTION_FACT_DRILL_WITHIN_20_CONFIG,
  validator: validateFactDrill,
  skillIds: [MATH_SUBTRACTION_WITHIN_20_SKILL.id],
  contentPackId: MATH_SUBTRACTION_WITHIN_20_PACK.id,
});

gameRegistry.register({
  id: 'subtraction_fact_drill_within_100',
  component: FactDrillView,
  generator: generateSubtractionFactDrillWithin100,
  config: SUBTRACTION_FACT_DRILL_WITHIN_100_CONFIG,
  validator: validateFactDrill,
  skillIds: [MATH_SUBTRACTION_WITHIN_100_SKILL.id],
  contentPackId: MATH_SUBTRACTION_WITHIN_100_PACK.id,
});

gameRegistry.register({
  id: 'division_fact_drill_1_5',
  component: FactDrillView,
  generator: generateDivisionFactDrill1To5,
  config: DIVISION_FACT_DRILL_1_5_CONFIG,
  validator: validateFactDrill,
  skillIds: [MATH_DIVISION_FACTS_1_TO_5_SKILL.id],
  contentPackId: MATH_DIVISION_FACTS_1_5_PACK.id,
});

gameRegistry.register({
  id: 'division_fact_drill_1_10',
  component: FactDrillView,
  generator: generateDivisionFactDrill1To10,
  config: DIVISION_FACT_DRILL_1_10_CONFIG,
  validator: validateFactDrill,
  skillIds: [MATH_DIVISION_FACTS_1_TO_10_SKILL.id],
  contentPackId: MATH_DIVISION_FACTS_1_10_PACK.id,
});
