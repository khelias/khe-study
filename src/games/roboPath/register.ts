/**
 * robo_path mechanic registration. See src/games/balanceScale/register.ts
 * for the established colocation pattern (ADR-0001, Phase 1.6).
 *
 * Mechanic: program a robot to navigate an obstacle grid to the goal.
 * Content: MATH_GRID_NAVIGATION_PACK (grid / obstacle progression specs).
 */

import { MATH_GRID_NAVIGATION_SKILL } from '../../curriculum/skills/math';
import { MATH_GRID_NAVIGATION_PACK } from '../../curriculum/packs/math/grid_navigation';
import { gameRegistry } from '../registry';
import { ROBO_PATH_CONFIG } from './config';
import { generateRoboPath } from './generator';
import { validateRoboPath } from './validator';
import { RoboPathView } from './View';

gameRegistry.register({
  id: 'robo_path',
  component: RoboPathView,
  generator: generateRoboPath,
  config: ROBO_PATH_CONFIG,
  validator: validateRoboPath,
  skillIds: [MATH_GRID_NAVIGATION_SKILL.id],
  contentPackId: MATH_GRID_NAVIGATION_PACK.id,
});
