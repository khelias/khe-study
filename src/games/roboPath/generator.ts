import { getPackItems } from '../../curriculum';
import {
  MATH_GRID_NAVIGATION_PACK,
  getRoboPathGridSize,
  getRoboPathObstacleStage,
  getRoboPathProfile,
  getRoboPathSettings,
  type RoboPathProgressionItem,
  type RoboPathProgressionProfile,
} from '../../curriculum/packs/math/grid_navigation';
import { uid } from '../../engine/rng';
import type { RngFunction, RoboPathProblem } from '../../types/game';

/**
 * robo_path generator. Mechanic: program a robot with movement commands to
 * reach the goal on an obstacle grid. Content: MATH_GRID_NAVIGATION_PACK
 * supplies grid-size, obstacle-stage, and progression-profile specs; the
 * generator owns puzzle placement and shortest-path validation.
 */
export function generateRoboPath(level: number, rng: RngFunction = Math.random): RoboPathProblem {
  const progressionItems = getPackItems<RoboPathProgressionItem>(MATH_GRID_NAVIGATION_PACK.id);
  const progressionProfile: RoboPathProgressionProfile = 'starter';
  const profileProgression = getRoboPathProfile(progressionItems, progressionProfile);
  const obstacleStage = getRoboPathObstacleStage(progressionItems, level);
  const settings = getRoboPathSettings(progressionItems);

  // Improved grid size progression - scales better with levels
  // Starter: 3x3 (1-2), 4x4 (3-5), 5x5 (6-10), 6x6 (11-15), 7x7 (16+)
  // Advanced: 4x4 (1-2), 5x5 (3-5), 6x6 (6-10), 7x7 (11-15), 8x8 (16+)
  const gridSize = getRoboPathGridSize(progressionItems, progressionProfile, level);

  // Improved obstacle count progression - more obstacles, better scaling
  // Level 1: 0-1, Level 2-3: 1-2, Level 4-5: 2-3, Level 6-8: 3-4, Level 9-12: 4-5, Level 13+: 5-7
  const baseObstacles =
    obstacleStage.baseObstacles +
    Math.floor((level - obstacleStage.levelOffset) / obstacleStage.growthDivisor);
  const obstacleBonus =
    level === 1 ? profileProgression.firstLevelObstacleBonus : profileProgression.obstacleBonus;
  const obstacleCount = Math.min(
    baseObstacles + obstacleBonus + Math.floor(rng() * obstacleStage.obstacleVariance),
    Math.max(
      settings.maxObstacleFloor,
      Math.floor(gridSize * gridSize * settings.maxObstacleRatio),
    ), // Max 25% of grid cells
  );

  const start = { x: 0, y: 0, dir: 'N' };
  const maxCells = gridSize * gridSize;
  const maxObstacles = Math.max(0, maxCells - settings.reservedCells); // Reserve space for start, goal, and path
  const cappedObstacleCount = Math.min(obstacleCount, maxObstacles);

  const directions: Array<[number, number]> = [
    [0, -1],
    [0, 1],
    [-1, 0],
    [1, 0],
  ]; // UP, DOWN, LEFT, RIGHT

  const findShortestPath = (
    startPos: [number, number],
    endPos: [number, number],
    obstacleSet: Set<string>,
  ): { length: number; path: Array<[number, number]> } | null => {
    const queue: Array<[number, number]> = [startPos];
    const visited = new Set<string>();
    const parent = new Map<string, string>();
    visited.add(`${startPos[0]},${startPos[1]}`);

    while (queue.length > 0) {
      const current = queue.shift();
      if (!current) break;
      const [x, y] = current;
      if (x === endPos[0] && y === endPos[1]) {
        const path: Array<[number, number]> = [];
        let key: string | undefined = `${x},${y}`;
        while (key) {
          const parts = key.split(',');
          const px = Number(parts[0]);
          const py = Number(parts[1]);
          if (!isNaN(px) && !isNaN(py)) {
            path.push([px, py]);
          }
          key = parent.get(key);
        }
        path.reverse();
        return { length: path.length - 1, path };
      }
      for (const [dx, dy] of directions) {
        const newX = x + dx;
        const newY = y + dy;
        const key = `${newX},${newY}`;
        if (
          newX >= 0 &&
          newX < gridSize &&
          newY >= 0 &&
          newY < gridSize &&
          !visited.has(key) &&
          !obstacleSet.has(key)
        ) {
          visited.add(key);
          parent.set(key, `${x},${y}`);
          queue.push([newX, newY]);
        }
      }
    }

    return null;
  };

  const hasFreeStartNeighbor = (obstacleSet: Set<string>): boolean => {
    return directions.some(([dx, dy]) => {
      const nx = start.x + dx;
      const ny = start.y + dy;
      if (nx < 0 || ny < 0 || nx >= gridSize || ny >= gridSize) return false;
      return !obstacleSet.has(`${nx},${ny}`);
    });
  };

  // Calculate minimum distance based on grid size (at least 50% of diagonal)
  const minDistance = Math.max(
    2,
    Math.ceil(Math.sqrt(gridSize * gridSize * 2) * settings.minGoalDistanceRatio),
  );
  const maxDistance = Math.floor(
    Math.sqrt(gridSize * gridSize * 2) * settings.maxGoalDistanceRatio,
  ); // Max 90% of diagonal

  let end = { x: 0, y: 0 };
  let obstacles: Array<{ x: number; y: number }> = [];
  let optimalMoves = 0;
  let path: Array<[number, number]> = [];
  let safety = 0;

  while (safety < 100) {
    safety++;

    // Place goal with minimum distance requirement
    let attempts = 0;
    do {
      end = { x: Math.floor(rng() * gridSize), y: Math.floor(rng() * gridSize) };
      attempts++;
    } while (
      attempts < 60 &&
      (Math.abs(end.x - start.x) + Math.abs(end.y - start.y) < minDistance ||
        Math.abs(end.x - start.x) + Math.abs(end.y - start.y) > maxDistance)
    );

    // Strategic obstacle placement
    obstacles = [];
    const obstacleSet = new Set<string>();

    // First, place obstacles strategically along potential paths
    // 1. Place some obstacles near the goal (makes it harder to reach)
    const goalObstacleCount = Math.floor(cappedObstacleCount * 0.4); // 40% near goal
    let goalObstacleAttempts = 0;
    while (obstacles.length < goalObstacleCount && goalObstacleAttempts < 50) {
      goalObstacleAttempts++;
      const angle = rng() * Math.PI * 2;
      const distance = 1 + rng() * 2; // 1-3 cells from goal
      const obsX = Math.round(end.x + Math.cos(angle) * distance);
      const obsY = Math.round(end.y + Math.sin(angle) * distance);

      if (
        obsX >= 0 &&
        obsX < gridSize &&
        obsY >= 0 &&
        obsY < gridSize &&
        obsX !== start.x &&
        obsY !== start.y &&
        obsX !== end.x &&
        obsY !== end.y &&
        !obstacleSet.has(`${obsX},${obsY}`)
      ) {
        obstacles.push({ x: obsX, y: obsY });
        obstacleSet.add(`${obsX},${obsY}`);
      }
    }

    // 2. Place obstacles to create interesting detours (not blocking completely, but forcing longer paths)
    const detourObstacleCount = Math.floor(cappedObstacleCount * 0.4); // 40% for detours
    let detourAttempts = 0;
    while (obstacles.length < goalObstacleCount + detourObstacleCount && detourAttempts < 80) {
      detourAttempts++;
      // Place obstacles in the "middle zone" between start and goal
      const midX = Math.floor((start.x + end.x) / 2);
      const midY = Math.floor((start.y + end.y) / 2);
      const offsetX = Math.floor((rng() - 0.5) * (gridSize * 0.6));
      const offsetY = Math.floor((rng() - 0.5) * (gridSize * 0.6));
      const obsX = Math.max(0, Math.min(gridSize - 1, midX + offsetX));
      const obsY = Math.max(0, Math.min(gridSize - 1, midY + offsetY));

      if (
        obsX !== start.x &&
        obsY !== start.y &&
        obsX !== end.x &&
        obsY !== end.y &&
        !obstacleSet.has(`${obsX},${obsY}`)
      ) {
        obstacles.push({ x: obsX, y: obsY });
        obstacleSet.add(`${obsX},${obsY}`);
      }
    }

    // 3. Fill remaining obstacles randomly (but not too close to start)
    let randomAttempts = 0;
    while (obstacles.length < cappedObstacleCount && randomAttempts < 100) {
      randomAttempts++;
      const obs = { x: Math.floor(rng() * gridSize), y: Math.floor(rng() * gridSize) };
      const distFromStart = Math.abs(obs.x - start.x) + Math.abs(obs.y - start.y);
      const isStart = obs.x === start.x && obs.y === start.y;
      const isEnd = obs.x === end.x && obs.y === end.y;
      const exists = obstacleSet.has(`${obs.x},${obs.y}`);

      // Don't place obstacles too close to start (at least 2 cells away)
      if (!isStart && !isEnd && !exists && distFromStart >= 2) {
        obstacles.push(obs);
        obstacleSet.add(`${obs.x},${obs.y}`);
      }
    }

    // Verify path exists and has reasonable complexity
    const pathResult = findShortestPath([start.x, start.y], [end.x, end.y], obstacleSet);
    if (!pathResult) {
      continue;
    }
    if (!hasFreeStartNeighbor(obstacleSet)) {
      continue;
    }

    // Ensure path has minimum complexity (at least 30% longer than direct distance)
    const directDistance = Math.abs(end.x - start.x) + Math.abs(end.y - start.y);
    const pathComplexity = pathResult.length / Math.max(1, directDistance);
    if (pathComplexity < 1.3 && level > 2) {
      // Path is too simple, try again
      continue;
    }

    optimalMoves = pathResult.length;
    path = pathResult.path;
    break;
  }

  // Fallback if we couldn't generate a good puzzle
  if (path.length === 0) {
    obstacles = [];
    const fallbackPath = findShortestPath([start.x, start.y], [end.x, end.y], new Set());
    if (fallbackPath) {
      optimalMoves = fallbackPath.length;
      path = fallbackPath.path;
    } else {
      optimalMoves = Math.abs(end.x - start.x) + Math.abs(end.y - start.y);
    }
  }

  const coalIndex = Math.min(
    Math.max(1, Math.floor(path.length / 2)),
    Math.max(1, path.length - 2),
  );
  const coalPos = path.length >= 3 ? path[coalIndex] : null;

  // Build grid
  const grid: number[][] = Array.from(
    { length: gridSize },
    () => Array(gridSize).fill(0) as number[],
  );
  for (const obs of obstacles) {
    const row = grid[obs.y];
    if (row) {
      row[obs.x] = 1;
    }
  }

  // Generate correct path (simplified - just store instructions)
  const correctPath: string[] = [];
  const optionCommands = ['UP', 'DOWN', 'LEFT', 'RIGHT', 'FORWARD', 'TURN_LEFT', 'TURN_RIGHT'];

  // Calculate max commands based on optimal path + buffer for mistakes
  const commandBuffer = level <= 3 ? 2 : level <= 8 ? 3 : 4;
  const maxCommands = Math.max(optimalMoves + commandBuffer, Math.floor(gridSize * 1.2));

  return {
    type: 'robo_path',
    grid,
    gridSize,
    start: [start.x, start.y],
    goal: [end.x, end.y],
    obstacles: obstacles.map((o) => [o.x, o.y] as [number, number]),
    correctPath,
    options: optionCommands,
    maxCommands,
    optimalMoves,
    coal: coalPos ? [coalPos[0], coalPos[1]] : undefined,
    uid: uid(rng),
  };
}
