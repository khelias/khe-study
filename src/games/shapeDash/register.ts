/**
 * shape_dash mechanic registration. See src/games/balanceScale/register.ts for
 * the established colocation pattern (ADR-0001).
 *
 * Mechanic: Geometry Dash–inspired runner with geometry checkpoints + shape gates.
 * Content: MATH_GEOMETRY_SHAPES_PACK.
 */

import { MATH_GEOMETRY_SHAPES_VERBAL_SKILL } from '../../curriculum/skills/math';
import { MATH_GEOMETRY_SHAPES_PACK } from '../../curriculum/packs/math/geometry_shapes';
import { gameRegistry } from '../registry';
import { SHAPE_DASH_CONFIG } from './config';
import { generateShapeDash } from './generator';
import { validateShapeDash } from './validator';
import { ShapeDashView } from './View';
import type { ShapeDashProblem } from '../../types/game';

gameRegistry.register<ShapeDashProblem>({
  id: 'shape_dash',
  component: ShapeDashView,
  generator: generateShapeDash,
  config: SHAPE_DASH_CONFIG,
  validator: validateShapeDash,
  skillIds: [MATH_GEOMETRY_SHAPES_VERBAL_SKILL.id],
  contentPackId: MATH_GEOMETRY_SHAPES_PACK.id,
  problemKey: (p) =>
    `shapedash:${p.runLength}:${p.obstacles.map((o) => `${o.x}-${o.type}`).join(';')}`,
  contentItemIds: (p) => p.contentItemIds ?? [],
});
