import { uid } from './rng';
import type { FactStats } from '../learner/types';
import { pickWeakestFact } from './factDrill';
import type { ArithmeticSpec, Direction, MathSnakeProblem, RngFunction } from '../types/game';

interface MathChallenge {
  equation: string;
  answer: number;
  options: number[];
}

interface SpawnResult {
  apple: MathSnakeProblem['apple'];
  applesUntilMath: number;
  noSpace: boolean;
}

/**
 * Snake game-type predicate. All snake-family registrations (addition_snake,
 * multiplication_snake, …) share this engine + MathSnakeView. Any routing
 * logic keyed on game type must match ALL of them, not the literal string
 * 'math_snake' (which no longer exists as a binding after Phase 1 Slice 3b).
 */
export const isSnakeGameType = (gameType: string): boolean => {
  return gameType.replace('_adv', '').endsWith('_snake');
};

const randomInt = (min: number, max: number, rng: RngFunction): number => {
  if (max <= min) return min;
  return Math.floor(rng() * (max - min + 1)) + min;
};

const shuffle = <T>(items: T[], rng: RngFunction): T[] => {
  return items.slice().sort(() => rng() - 0.5);
};

const directionVectors: Record<Direction, [number, number]> = {
  UP: [0, -1],
  DOWN: [0, 1],
  LEFT: [-1, 0],
  RIGHT: [1, 0],
};

const oppositeDirection: Record<Direction, Direction> = {
  UP: 'DOWN',
  DOWN: 'UP',
  LEFT: 'RIGHT',
  RIGHT: 'LEFT',
};

/**
 * Grid starts small and expands within a session as the player racks up a
 * streak of correct math answers. Classical Snake scales the play-field with
 * progress; this one ties expansion to correct answers (not raw score) so
 * "growing the world" is a reward for *learning*, not for farming normal
 * apples. The grid never shrinks — losing a streak freezes the current size.
 */
export const SNAKE_MIN_GRID_SIZE = 7;
export const SNAKE_MAX_GRID_SIZE = 10;
export const SNAKE_STREAK_MILESTONE = 5;

const getMathSnakeGridSizeForLevel = (_level: number): number => {
  return SNAKE_MIN_GRID_SIZE;
};

/**
 * Grow the grid by one cell in each dimension, up to the cap. Existing snake
 * segments and the current apple keep their coordinates (no remapping needed
 * — expansion only adds cells at the right/bottom edges).
 */
export const expandSnakeGrid = (problem: MathSnakeProblem): MathSnakeProblem => {
  if (problem.gridSize >= SNAKE_MAX_GRID_SIZE) return problem;
  return { ...problem, gridSize: problem.gridSize + 1 };
};

const getRandomCountdown = (rng: RngFunction): number => randomInt(2, 3, rng);

const createInitialSnake = (
  gridSize: number,
): { snake: Array<[number, number]>; direction: Direction } => {
  const mid = Math.floor(gridSize / 2);
  return {
    snake: [
      [mid, mid],
      [mid - 1, mid],
      [mid - 2, mid],
    ],
    direction: 'RIGHT',
  };
};

const getEmptyCells = (
  gridSize: number,
  snake: Array<[number, number]>,
): Array<[number, number]> => {
  const snakeSet = new Set(snake.map(([x, y]) => `${x},${y}`));
  const cells: Array<[number, number]> = [];
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      if (!snakeSet.has(`${x},${y}`)) {
        cells.push([x, y]);
      }
    }
  }
  return cells;
};

const spawnApple = (
  gridSize: number,
  snake: Array<[number, number]>,
  applesUntilMath: number,
  rng: RngFunction,
): SpawnResult => {
  const empty = getEmptyCells(gridSize, snake);
  if (empty.length === 0) {
    return { apple: null, applesUntilMath, noSpace: true };
  }

  const isMath = applesUntilMath <= 1;
  const nextCountdown = isMath ? getRandomCountdown(rng) : applesUntilMath - 1;
  const pos = empty[randomInt(0, empty.length - 1, rng)] ?? empty[0]!;

  return {
    apple: {
      id: `apple-${uid(rng)}`,
      kind: isMath ? 'math' : 'normal',
      pos,
    },
    applesUntilMath: nextCountdown,
    noSpace: false,
  };
};

/** Default additive range when a spec doesn't override it. Scales with level. */
const defaultValueRange = (level: number): [number, number] => {
  const baseMax = level <= 2 ? 10 : level <= 4 ? 15 : level <= 6 ? 20 : level <= 10 ? 30 : 50;
  return [4, Math.min(100, baseMax)];
};

/** Default multiplication factor range when a spec doesn't override it. */
const defaultFactorRange = (level: number): [number, number] => {
  return [2, level <= 8 ? 5 : 10];
};

/**
 * Resolve one concrete equation from a spec at a given level.
 *
 * Per-spec `factorRange` / `valueRange` override the engine's level-scaled
 * defaults. `maxValue` returned here feeds distractor generation — it always
 * reflects the *additive* scale (so distractor spread stays sensible even
 * when the equation is multiplicative).
 */
const materializeEquation = (
  spec: ArithmeticSpec,
  level: number,
  rng: RngFunction,
  factsKnown?: Readonly<Record<string, FactStats>>,
) => {
  const [minVal, maxVal] = spec.valueRange ?? defaultValueRange(level);
  const [minFactor, maxFactor] = spec.factorRange ?? defaultFactorRange(level);

  // Phase 5e: for closed-set multiplication / division specs, use spaced
  // repetition over factsKnown when available. Falls through to uniform
  // random selection when factsKnown is empty / not provided.
  const useSpacedRep =
    factsKnown &&
    (spec.op === 'mul_result' ||
      spec.op === 'mul_missing' ||
      spec.op === 'div_result' ||
      spec.op === 'div_missing');
  let spacedPair: [number, number] | null = null;
  if (useSpacedRep) {
    const pool: [number, number][] = [];
    for (let a = minFactor; a <= maxFactor; a += 1) {
      for (let b = a; b <= maxFactor; b += 1) {
        pool.push([a, b]);
      }
    }
    spacedPair = pickWeakestFact(pool, factsKnown, rng);
  }

  switch (spec.op) {
    case 'add_result': {
      const sum = randomInt(minVal, maxVal, rng);
      const a = randomInt(1, sum - 1, rng);
      const b = sum - a;
      return { equation: `${a} + ${b}`, answer: a + b, maxValue: maxVal };
    }
    case 'add_missing': {
      const c = randomInt(minVal, maxVal, rng);
      const a = randomInt(1, c - 1, rng);
      const answer = c - a;
      if (rng() > 0.5) {
        return { equation: `${a} + ? = ${c}`, answer, maxValue: maxVal };
      }
      const b = randomInt(1, c - 1, rng);
      return { equation: `? + ${b} = ${c}`, answer: c - b, maxValue: maxVal };
    }
    case 'sub_result': {
      const a = randomInt(minVal, maxVal, rng);
      const b = randomInt(1, Math.max(1, a - 1), rng);
      return { equation: `${a} - ${b}`, answer: a - b, maxValue: maxVal };
    }
    case 'sub_missing_minuend': {
      // Both b and c respect the pack's valueRange — no hard cap that would
      // prevent a "within 100" pack from producing 70 - 25 = 45.
      const b = randomInt(1, Math.max(1, maxVal - 1), rng);
      const c = randomInt(0, Math.max(0, maxVal - b), rng);
      const answer = b + c;
      return { equation: `? - ${b} = ${c}`, answer, maxValue: maxVal };
    }
    case 'sub_missing_subtrahend': {
      const a = randomInt(Math.max(5, minVal), maxVal, rng);
      const c = randomInt(0, Math.max(0, a - 1), rng);
      const answer = a - c;
      return { equation: `${a} - ? = ${c}`, answer, maxValue: maxVal };
    }
    case 'mul_result': {
      const a = spacedPair?.[0] ?? randomInt(minFactor, maxFactor, rng);
      const b = spacedPair?.[1] ?? randomInt(minFactor, maxFactor, rng);
      return { equation: `${a} × ${b}`, answer: a * b, maxValue: maxVal };
    }
    case 'mul_missing': {
      const a = spacedPair?.[0] ?? randomInt(minFactor, maxFactor, rng);
      const b = spacedPair?.[1] ?? randomInt(minFactor, maxFactor, rng);
      const c = a * b;
      return { equation: `${a} × ? = ${c}`, answer: b, maxValue: maxVal };
    }
    case 'div_result': {
      const quotient = spacedPair?.[0] ?? randomInt(minFactor, maxFactor, rng);
      const divisor = spacedPair?.[1] ?? randomInt(minFactor, maxFactor, rng);
      const dividend = quotient * divisor;
      return { equation: `${dividend} ÷ ${divisor}`, answer: quotient, maxValue: maxVal };
    }
    case 'div_missing': {
      const quotient = spacedPair?.[0] ?? randomInt(minFactor, maxFactor, rng);
      const divisor = spacedPair?.[1] ?? randomInt(minFactor, maxFactor, rng);
      const dividend = quotient * divisor;
      return { equation: `${dividend} ÷ ? = ${quotient}`, answer: divisor, maxValue: maxVal };
    }
  }
};

/**
 * Pick a spec from the pool that's unlocked at this level, then materialize
 * an equation from it. Falls back to add_result if the pool is empty at this
 * level (shouldn't happen if packs declare at least one spec with unlockLevel
 * ≤ 1, which every real pack does).
 */
const generateEquation = (
  specs: readonly ArithmeticSpec[],
  level: number,
  rng: RngFunction,
  factsKnown?: Readonly<Record<string, FactStats>>,
) => {
  const pool = specs.filter((s) => (s.unlockLevel ?? 1) <= level);
  const chosen = pool[randomInt(0, Math.max(0, pool.length - 1), rng)];
  if (chosen) return materializeEquation(chosen, level, rng, factsKnown);
  const [minVal, maxVal] = defaultValueRange(level);
  const sum = randomInt(minVal, maxVal, rng);
  const a = randomInt(1, sum - 1, rng);
  const b = sum - a;
  return { equation: `${a} + ${b}`, answer: a + b, maxValue: maxVal };
};

const buildOptions = (
  answer: number,
  count: number,
  level: number,
  rng: RngFunction,
  maxValue: number,
) => {
  const optionsSet = new Set<number>([answer]);
  const spread = level <= 3 ? 2 : level <= 6 ? 4 : level <= 10 ? 8 : 12;
  let guard = 0;
  while (optionsSet.size < count && guard < 40) {
    const delta = randomInt(-spread, spread, rng);
    if (delta === 0) {
      guard++;
      continue;
    }
    const candidate = answer + delta;
    if (candidate > 0 && candidate <= maxValue + 10) optionsSet.add(candidate);
    guard++;
  }
  while (optionsSet.size < count) {
    const candidate = randomInt(1, Math.min(100, maxValue + 20), rng);
    if (candidate !== answer) optionsSet.add(candidate);
  }
  return shuffle(Array.from(optionsSet), rng);
};

const createMathChallenge = (
  specs: readonly ArithmeticSpec[],
  level: number,
  rng: RngFunction,
  factsKnown?: Readonly<Record<string, FactStats>>,
): MathChallenge => {
  const { equation, answer, maxValue } = generateEquation(specs, level, rng, factsKnown);
  const optionCount = 4; // Always 4 options for consistent layout
  const options = buildOptions(answer, optionCount, level, rng, maxValue);
  return { equation, answer, options };
};

const isOpposite = (current: Direction, next: Direction): boolean =>
  oppositeDirection[current] === next;

const normalizeDirection = (current: Direction, next: Direction): Direction => {
  if (isOpposite(current, next)) return current;
  return next;
};

const isOutOfBounds = (pos: [number, number], gridSize: number): boolean => {
  const [x, y] = pos;
  return x < 0 || x >= gridSize || y < 0 || y >= gridSize;
};

const isSelfCollision = (
  snake: Array<[number, number]>,
  nextHead: [number, number],
  ignoreTail: boolean,
): boolean => {
  const snakeBody = ignoreTail ? snake.slice(0, Math.max(0, snake.length - 1)) : snake;
  const snakeSet = new Set(snakeBody.map(([sx, sy]) => `${sx},${sy}`));
  return snakeSet.has(`${nextHead[0]},${nextHead[1]}`);
};

export const createMathSnakeProblem = (
  specs: readonly ArithmeticSpec[],
  level: number,
  rng: RngFunction = Math.random,
): MathSnakeProblem => {
  const gridSize = getMathSnakeGridSizeForLevel(level);
  const { snake, direction } = createInitialSnake(gridSize);
  const initialCountdown = getRandomCountdown(rng);
  const spawn = spawnApple(gridSize, snake, initialCountdown, rng);

  return {
    type: 'math_snake',
    gridSize,
    snake,
    direction,
    apple: spawn.apple,
    applesUntilMath: spawn.applesUntilMath,
    math: null,
    specs,
    uid: uid(rng),
  };
};

export const moveMathSnake = (
  problem: MathSnakeProblem,
  inputDirection: Direction,
  level: number,
  rng: RngFunction = Math.random,
  factsKnown?: Readonly<Record<string, FactStats>>,
): { problem: MathSnakeProblem; collision: boolean } => {
  if (problem.math) {
    return { problem, collision: false };
  }

  const direction = normalizeDirection(problem.direction, inputDirection);
  const [dx, dy] = directionVectors[direction];
  const head = problem.snake[0] ?? [0, 0];
  const nextHead: [number, number] = [head[0] + dx, head[1] + dy];

  // Walls kill (classical Snake). Wraparound was removed in the Phase 1 Slice
  // 3b+ snake audit — with wraparound, the snake reappeared on the opposite
  // edge and could crash into its own tail "from nowhere", which felt unfair
  // especially on touch input.
  if (isOutOfBounds(nextHead, problem.gridSize)) {
    return { problem, collision: true };
  }

  const apple = problem.apple;
  const isApple = apple && apple.pos[0] === nextHead[0] && apple.pos[1] === nextHead[1];
  // A math apple is a challenge trigger, not food — the snake only grows
  // when the player answers correctly (see resolveMathSnakeAnswer). That's
  // why willGrow is false for math apples here.
  const willGrow = Boolean(isApple && apple?.kind === 'normal');

  if (isSelfCollision(problem.snake, nextHead, !willGrow)) {
    return { problem, collision: true };
  }

  let nextSnake = [nextHead, ...problem.snake];

  if (!willGrow) {
    nextSnake = nextSnake.slice(0, Math.max(1, nextSnake.length - 1));
  }

  if (!isApple) {
    return {
      problem: {
        ...problem,
        snake: nextSnake,
        direction,
      },
      collision: false,
    };
  }

  if (apple.kind === 'normal') {
    const spawn = spawnApple(problem.gridSize, nextSnake, problem.applesUntilMath, rng);
    return {
      problem: {
        ...problem,
        snake: nextSnake,
        direction,
        apple: spawn.apple,
        applesUntilMath: spawn.applesUntilMath,
      },
      collision: false,
    };
  }

  const nextCountdown = getRandomCountdown(rng);
  const challenge = createMathChallenge(problem.specs, level, rng, factsKnown);
  return {
    problem: {
      ...problem,
      snake: nextSnake,
      direction,
      apple: null,
      applesUntilMath: nextCountdown,
      math: challenge,
    },
    collision: false,
  };
};

export const resolveMathSnakeAnswer = (
  problem: MathSnakeProblem,
  isCorrect: boolean,
  rng: RngFunction = Math.random,
): { problem: MathSnakeProblem; gameOver: boolean } => {
  if (!problem.math) {
    return { problem, gameOver: false };
  }

  // Math apple is a question trigger, not food — moveMathSnake no longer
  // grows the snake when a math apple is eaten, so the entire reward lives
  // here. Correct answer: +2 segments. Wrong answer: no length change
  // (hearts system + shrinking streak handle the fail). Net growth per math
  // apple: +2 if correct, 0 if wrong — no "farming" by guessing.
  let nextSnake = problem.snake;
  if (isCorrect) {
    const tail = problem.snake[problem.snake.length - 1] ?? problem.snake[0] ?? [0, 0];
    const secondLast = problem.snake[problem.snake.length - 2] ?? tail;
    nextSnake = [...problem.snake, secondLast, tail];
  }

  const spawn = spawnApple(problem.gridSize, nextSnake, problem.applesUntilMath, rng);

  return {
    problem: {
      ...problem,
      snake: nextSnake,
      apple: spawn.apple,
      applesUntilMath: spawn.applesUntilMath,
      math: null,
    },
    gameOver: false,
  };
};
