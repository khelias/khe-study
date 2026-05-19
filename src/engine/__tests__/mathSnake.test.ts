import { describe, it, expect } from 'vitest';
import { createRng } from '../rng';
import {
  createMathSnakeProblem,
  expandSnakeGrid,
  moveMathSnake,
  resolveMathSnakeAnswer,
  SNAKE_MAX_GRID_SIZE,
  SNAKE_MIN_GRID_SIZE,
} from '../mathSnake';
import type { ArithmeticSpec } from '../../types/game';

// Minimal spec set sufficient for mechanics tests that don't care about equation
// content. Covers all ops so challenge-generation doesn't fall into the empty-pool
// fallback at any level.
const ALL_OPS_SPECS: readonly ArithmeticSpec[] = [
  { op: 'add_result' },
  { op: 'add_missing' },
  { op: 'sub_result' },
  { op: 'sub_missing_minuend' },
  { op: 'sub_missing_subtrahend' },
  { op: 'mul_result' },
  { op: 'mul_missing' },
];

describe('mathSnake engine', () => {
  it('creates a problem with an apple off the snake', () => {
    const rng = createRng(1357);
    const problem = createMathSnakeProblem(ALL_OPS_SPECS, 2, rng);

    expect(problem.type).toBe('math_snake');
    expect(problem.apple).not.toBeNull();

    const apple = problem.apple;
    if (!apple) throw new Error('Expected apple');

    const snakeSet = new Set(problem.snake.map(([x, y]) => `${x},${y}`));
    expect(snakeSet.has(`${apple.pos[0]},${apple.pos[1]}`)).toBe(false);
  });

  it('moves the snake one step without growing when no apple', () => {
    const rng = createRng(2468);
    const problem = createMathSnakeProblem(ALL_OPS_SPECS, 1, rng);
    const result = moveMathSnake(problem, 'RIGHT', 1, rng);

    expect(result.collision).toBe(false);
    expect(result.problem.snake.length).toBe(problem.snake.length);
  });

  it('grows when eating a normal apple', () => {
    const rng = createRng(7777);
    const problem = createMathSnakeProblem(ALL_OPS_SPECS, 1, rng);
    const head = problem.snake[0] ?? [0, 0];
    const target: [number, number] = [head[0] + 1, head[1]];

    const updated = {
      ...problem,
      apple: { id: 'test-apple', kind: 'normal' as const, pos: target },
    };

    const result = moveMathSnake(updated, 'RIGHT', 1, rng);
    expect(result.collision).toBe(false);
    expect(result.problem.snake.length).toBe(problem.snake.length + 1);
  });

  it('math apple does not grow the snake on eat — only a correct answer does', () => {
    // Growth-model fix: a math apple is a question trigger, not food. Net
    // growth per math apple: +2 if answered correctly, 0 if wrong.
    const rng = createRng(9999);
    const problem = createMathSnakeProblem(ALL_OPS_SPECS, 3, rng);
    const head = problem.snake[0] ?? [0, 0];
    const target: [number, number] = [head[0] + 1, head[1]];

    const updated = {
      ...problem,
      apple: { id: 'math-apple', kind: 'math' as const, pos: target },
    };

    const moved = moveMathSnake(updated, 'RIGHT', 3, rng);
    expect(moved.problem.math).not.toBeNull();
    expect(moved.problem.snake.length).toBe(problem.snake.length);

    const correct = resolveMathSnakeAnswer(moved.problem, true, rng);
    expect(correct.gameOver).toBe(false);
    expect(correct.problem.snake.length).toBe(problem.snake.length + 2);

    const wrong = resolveMathSnakeAnswer(moved.problem, false, rng);
    expect(wrong.problem.snake.length).toBe(problem.snake.length);
  });

  it('walls kill the snake (no wraparound)', () => {
    // Drive the snake straight into the left wall. Wraparound previously let
    // the head reappear on the opposite edge; post-audit, walls end the run.
    const rng = createRng(4242);
    let problem = createMathSnakeProblem(ALL_OPS_SPECS, 1, rng);
    // Initial snake is at (mid, mid), (mid-1, mid), (mid-2, mid), direction
    // RIGHT. Flip to LEFT via UP → LEFT (two 90° turns avoid opposite-check).
    problem = moveMathSnake(problem, 'UP', 1, rng).problem;
    problem = moveMathSnake(problem, 'LEFT', 1, rng).problem;

    // Remove apple from board so it can't happen to sit on the path.
    problem = { ...problem, apple: null };

    // Now walk LEFT until we leave the grid. At worst ~gridSize steps.
    let collided = false;
    for (let i = 0; i < problem.gridSize + 2; i++) {
      const step = moveMathSnake(problem, 'LEFT', 1, rng);
      if (step.collision) {
        collided = true;
        break;
      }
      problem = step.problem;
    }
    expect(collided).toBe(true);
  });

  it('expandSnakeGrid grows by one up to the cap, then no-ops', () => {
    const rng = createRng(101);
    const problem = createMathSnakeProblem(ALL_OPS_SPECS, 1, rng);
    expect(problem.gridSize).toBe(SNAKE_MIN_GRID_SIZE);

    let p = problem;
    for (let i = 0; i < SNAKE_MAX_GRID_SIZE - SNAKE_MIN_GRID_SIZE; i++) {
      p = expandSnakeGrid(p);
    }
    expect(p.gridSize).toBe(SNAKE_MAX_GRID_SIZE);

    // Calling again at the cap is a no-op.
    p = expandSnakeGrid(p);
    expect(p.gridSize).toBe(SNAKE_MAX_GRID_SIZE);
  });

  // ---------------------------------------------------------------------------
  // Spec-pool behavior (Phase 1 Slice 3)
  // ---------------------------------------------------------------------------

  it('respects unlockLevel — a spec gated above current level never fires', () => {
    // Only one spec, locked at level 99 → effective pool empty → engine's
    // add_result fallback runs (always a "? + ? = ..." shape, no ×).
    const lockedSpecs: readonly ArithmeticSpec[] = [{ op: 'mul_result', unlockLevel: 99 }];
    const rng = createRng(42);
    const problem = createMathSnakeProblem(lockedSpecs, 1, rng);
    // Force a math challenge
    const head = problem.snake[0] ?? [0, 0];
    const target: [number, number] = [head[0] + 1, head[1]];
    const forced = {
      ...problem,
      apple: { id: 'math-apple', kind: 'math' as const, pos: target },
    };
    const moved = moveMathSnake(forced, 'RIGHT', 1, rng);
    expect(moved.problem.math).not.toBeNull();
    // Fallback is add_result, which contains '+'.
    expect(moved.problem.math?.equation).toContain('+');
  });

  it('multiplication pack with factorRange [2,5] stays within that range at any level', () => {
    const mulSpecs: readonly ArithmeticSpec[] = [{ op: 'mul_result', factorRange: [2, 5] }];
    // Run at a high level where default factor range would widen to [2, 10];
    // override must hold.
    const rng = createRng(123);
    for (let i = 0; i < 20; i++) {
      const problem = createMathSnakeProblem(mulSpecs, 12, rng);
      const head = problem.snake[0] ?? [0, 0];
      const target: [number, number] = [head[0] + 1, head[1]];
      const forced = {
        ...problem,
        apple: { id: `math-apple-${i}`, kind: 'math' as const, pos: target },
      };
      const moved = moveMathSnake(forced, 'RIGHT', 12, rng);
      const eq = moved.problem.math?.equation ?? '';
      const match = eq.match(/^(\d+) × (\d+)/);
      expect(match).not.toBeNull();
      if (match) {
        const a = Number(match[1]);
        const b = Number(match[2]);
        expect(a).toBeGreaterThanOrEqual(2);
        expect(a).toBeLessThanOrEqual(5);
        expect(b).toBeGreaterThanOrEqual(2);
        expect(b).toBeLessThanOrEqual(5);
      }
    }
  });

  it('Phase 5e: closed-set multiplication uses factsKnown to bias weak facts', () => {
    // factor range [2,5] => pool {2x2, 2x3, 2x4, 2x5, 3x3, 3x4, 3x5, 4x4, 4x5, 5x5}.
    // Mark 4x5 weak (2/10), the rest mastered. Expect 4x5 to dominate.
    const mulSpecs: readonly ArithmeticSpec[] = [{ op: 'mul_result', factorRange: [2, 5] }];
    const factsKnown = {
      '2x2': { attempts: 10, correct: 10, avgResponseMs: 0, lastSeen: 0 },
      '2x3': { attempts: 10, correct: 10, avgResponseMs: 0, lastSeen: 0 },
      '2x4': { attempts: 10, correct: 10, avgResponseMs: 0, lastSeen: 0 },
      '2x5': { attempts: 10, correct: 10, avgResponseMs: 0, lastSeen: 0 },
      '3x3': { attempts: 10, correct: 10, avgResponseMs: 0, lastSeen: 0 },
      '3x4': { attempts: 10, correct: 10, avgResponseMs: 0, lastSeen: 0 },
      '3x5': { attempts: 10, correct: 10, avgResponseMs: 0, lastSeen: 0 },
      '4x4': { attempts: 10, correct: 10, avgResponseMs: 0, lastSeen: 0 },
      '4x5': { attempts: 10, correct: 2, avgResponseMs: 0, lastSeen: 0 },
      '5x5': { attempts: 10, correct: 10, avgResponseMs: 0, lastSeen: 0 },
    };
    const rng = createRng(2026);
    let weakHits = 0;
    for (let i = 0; i < 300; i += 1) {
      const problem = createMathSnakeProblem(mulSpecs, 5, rng);
      const head = problem.snake[0] ?? [0, 0];
      const target: [number, number] = [head[0] + 1, head[1]];
      const forced = {
        ...problem,
        apple: { id: `math-apple-${i}`, kind: 'math' as const, pos: target },
      };
      const moved = moveMathSnake(forced, 'RIGHT', 5, rng, factsKnown);
      const eq = moved.problem.math?.equation ?? '';
      // weak fact is 4×5 — picks (factA, factB) ordered as (a, b) with a<=b,
      // but the equation renders the picked pair as-is, so the printed form
      // is "4 × 5". Count both orientations to be safe.
      if (/^4 × 5$|^5 × 4$/.test(eq)) weakHits += 1;
    }
    // 70% targets the weakest fact; allow generous tolerance.
    expect(weakHits).toBeGreaterThan(150);
  });
});
