/**
 * unit_conversion mechanic registration. See src/games/balanceScale/register.ts
 * for the established colocation pattern (ADR-0001, Phase 1.6).
 */

import { MATH_UNIT_CONVERSIONS_PACK } from '../../curriculum/packs/math/unit_conversions';
import { MATH_UNIT_CONVERSIONS_SKILL } from '../../curriculum/skills/math';
import { gameRegistry } from '../registry';
import { UNIT_CONVERSION_CONFIG } from './config';
import { generateUnitConversion } from './generator';
import { validateUnitConversion } from './validator';
import { UnitConversionView } from './View';

gameRegistry.register({
  id: 'unit_conversion',
  component: UnitConversionView,
  generator: generateUnitConversion,
  config: UNIT_CONVERSION_CONFIG,
  validator: validateUnitConversion,
  skillIds: [MATH_UNIT_CONVERSIONS_SKILL.id],
  contentPackId: MATH_UNIT_CONVERSIONS_PACK.id,
});
