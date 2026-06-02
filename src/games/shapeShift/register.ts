/**
 * shape_shift mechanic registration. See src/games/balanceScale/register.ts
 * for the established colocation pattern (ADR-0001, Phase 1.6).
 *
 * Mechanic: drag/rotate geometric pieces onto the board to match a target.
 * Content: SHAPE_SHIFT_PUZZLES_PACK.
 */

import { MATH_GEOMETRY_SHAPES_SPATIAL_SKILL } from '../../curriculum/skills/math';
import { SHAPE_SHIFT_PUZZLES_PACK } from '../../curriculum/packs/geometry/shapeShiftPuzzles';
import { gameRegistry } from '../registry';
import { SHAPE_SHIFT_CONFIG } from './config';
import { generateShapeShift } from './generator';
import { validateShapeShift } from './validator';
import { ShapeShiftView } from './View';

gameRegistry.register({
  id: 'shape_shift',
  component: ShapeShiftView,
  generator: generateShapeShift,
  config: SHAPE_SHIFT_CONFIG,
  validator: validateShapeShift,
  skillIds: [MATH_GEOMETRY_SHAPES_SPATIAL_SKILL.id],
  contentPackId: SHAPE_SHIFT_PUZZLES_PACK.id,
});
