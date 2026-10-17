/**
 * robo_path mechanic registration. See src/games/balanceScale/register.ts
 * for the established colocation pattern (ADR-0001).
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
import type { RoboPathProblem } from '../../types/game';

gameRegistry.register<RoboPathProblem>({
  id: 'robo_path',
  component: RoboPathView,
  generator: generateRoboPath,
  config: ROBO_PATH_CONFIG,
  validator: validateRoboPath,
  skillIds: [MATH_GRID_NAVIGATION_SKILL.id],
  contentPackId: MATH_GRID_NAVIGATION_PACK.id,
  problemKey: (p) =>
    `robo:${p.grid.length}:${p.goal[0]},${p.goal[1]}:${p.obstacles.map((o) => `${o[0]},${o[1]}`).join(';')}`,
  cloneProblem: (p) => ({
    ...p,
    grid: p.grid.map((row) => [...row]),
    obstacles: p.obstacles.map((obs) => [...obs] as [number, number]),
  }),
});
