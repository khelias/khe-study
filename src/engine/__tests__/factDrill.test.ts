import { describe, expect, it } from 'vitest';
import {
  FACT_DRILL_DEFAULT_DURATION,
  FACT_DRILL_RECENT_WINDOW,
  buildFactPool,
  createFactDrillSession,
  factPairKey,
  makeFact,
  pickNextFact,
  recordCorrect,
  recordWrong,
  tickTimer,
} from '../factDrill';
import { createRng } from '../rng';

describe('factDrill — pool construction', () => {
  it('builds unique factor pairs with a <= b within range', () => {
    const pool = buildFactPool([2, 5]);
    // pairs: (2,2)(2,3)(2,4)(2,5)(3,3)(3,4)(3,5)(4,4)(4,5)(5,5) — 10 pairs
    expect(pool).toHaveLength(10);
    for (const [a, b] of pool) {
      expect(a).toBeGreaterThanOrEqual(2);
      expect(b).toBeLessThanOrEqual(5);
      expect(a).toBeLessThanOrEqual(b);
    }
  });

  it('produces 45 pairs for the 2..10 multiplication table', () => {
    const pool = buildFactPool([2, 10]);
    // Sum 1..9 = 45
    expect(pool).toHaveLength(45);
  });

  it('normalizes inverted ranges and floors non-integers', () => {
    const pool = buildFactPool([5, 2]);
    expect(pool).toHaveLength(1);
    expect(pool[0]).toEqual([5, 5]);
  });
});

describe('factDrill — pickNextFact', () => {
  it('returns null on empty pool', () => {
    const picked = pickNextFact([], new Set(), createRng(1));
    expect(picked).toBeNull();
  });

  it('avoids recently used pairs when fresh options exist', () => {
    const pool = buildFactPool([2, 5]);
    const recent = new Set<string>();
    for (let i = 0; i < pool.length - 1; i += 1) {
      const [a, b] = pool[i] as [number, number];
      recent.add(factPairKey(a, b));
    }
    const picked = pickNextFact(pool, recent, createRng(42));
    expect(picked).not.toBeNull();
    const last = pool[pool.length - 1] as [number, number];
    expect(picked).toEqual(last);
  });

  it('falls back to the full pool when all pairs are recent', () => {
    const pool = buildFactPool([2, 3]);
    const recent = new Set(pool.map(([a, b]) => factPairKey(a, b)));
    const picked = pickNextFact(pool, recent, createRng(7));
    expect(picked).not.toBeNull();
    expect(pool.some(([a, b]) => a === picked![0] && b === picked![1])).toBe(true);
  });

  it('factPairKey is commutative', () => {
    expect(factPairKey(3, 7)).toBe(factPairKey(7, 3));
  });
});

describe('factDrill — makeFact', () => {
  it('renders an equation and computes multiplication answer by default', () => {
    const rng = createRng(123);
    const problem = makeFact(3, 7, '×', [2, 10], rng);
    expect(problem.type).toBe('fact_drill');
    expect(problem.answer).toBe(21);
    expect(problem.opSymbol).toBe('×');
    expect(problem.equation).toMatch(/^(3 × 7|7 × 3)$/);
    expect(problem.factorRange).toEqual([2, 10]);
    expect(problem.uid.length).toBeGreaterThan(0);
  });

  it('honors a custom compute function for non-multiplication operations', () => {
    const rng = createRng(5);
    const sum = makeFact(8, 6, '+', [0, 20], rng, (x, y) => x + y);
    expect(sum.answer).toBe(14);
    expect(sum.opSymbol).toBe('+');
  });

  it('randomizes factor orientation across calls', () => {
    // Stubbed RNG: alternates < 0.5 / >= 0.5 so both orientations are observed.
    let i = 0;
    const samples = [0.1, 0.9, 0.2, 0.8];
    const rng = (): number => {
      const value = samples[i % samples.length] ?? 0.5;
      i += 1;
      return value;
    };
    const seenOrientations = new Set<string>();
    for (let n = 0; n < 4; n += 1) {
      const problem = makeFact(2, 9, '×', [2, 10], rng);
      seenOrientations.add(`${problem.factorA},${problem.factorB}`);
    }
    expect(seenOrientations.has('2,9')).toBe(true);
    expect(seenOrientations.has('9,2')).toBe(true);
  });
});

describe('factDrill — session transitions', () => {
  it('starts a session with the requested duration', () => {
    const state = createFactDrillSession(45);
    expect(state.timeRemaining).toBe(45);
    expect(state.isFinished).toBe(false);
    expect(state.correctCount).toBe(0);
    expect(state.wrongCount).toBe(0);
    expect(state.currentStreak).toBe(0);
    expect(state.bestStreak).toBe(0);
  });

  it('defaults the duration to FACT_DRILL_DEFAULT_DURATION', () => {
    const state = createFactDrillSession();
    expect(state.timeRemaining).toBe(FACT_DRILL_DEFAULT_DURATION);
  });

  it('marks zero-duration sessions finished immediately', () => {
    const state = createFactDrillSession(0);
    expect(state.isFinished).toBe(true);
  });

  it('recordCorrect bumps count, streak, and best streak', () => {
    let state = createFactDrillSession(60);
    state = recordCorrect(state);
    state = recordCorrect(state);
    state = recordCorrect(state);
    expect(state.correctCount).toBe(3);
    expect(state.currentStreak).toBe(3);
    expect(state.bestStreak).toBe(3);
  });

  it('recordWrong resets streak but preserves bestStreak and correctCount', () => {
    let state = createFactDrillSession(60);
    state = recordCorrect(state);
    state = recordCorrect(state);
    state = recordWrong(state);
    expect(state.correctCount).toBe(2);
    expect(state.wrongCount).toBe(1);
    expect(state.currentStreak).toBe(0);
    expect(state.bestStreak).toBe(2);
  });

  it('tickTimer counts down and finishes at zero', () => {
    let state = createFactDrillSession(2);
    state = tickTimer(state, 0.5);
    expect(state.timeRemaining).toBeCloseTo(1.5, 5);
    expect(state.isFinished).toBe(false);
    state = tickTimer(state, 5);
    expect(state.timeRemaining).toBe(0);
    expect(state.isFinished).toBe(true);
  });

  it('tickTimer is idempotent after finish', () => {
    let state = createFactDrillSession(1);
    state = tickTimer(state, 2);
    const after = tickTimer(state, 5);
    expect(after).toBe(state);
  });

  it('tickTimer ignores negative deltas', () => {
    let state = createFactDrillSession(10);
    state = tickTimer(state, -3);
    expect(state.timeRemaining).toBe(10);
  });
});

describe('factDrill — public constants', () => {
  it('exposes a positive recent-window size', () => {
    expect(FACT_DRILL_RECENT_WINDOW).toBeGreaterThan(0);
  });
});
