import { describe, expect, it } from 'vitest';
import {
  FACT_DRILL_DEFAULT_DURATION,
  FACT_DRILL_RECENT_WINDOW,
  buildFactForOperator,
  buildFactPool,
  createFactDrillSession,
  factPairKey,
  makeFact,
  pickNextFact,
  pickWeakestFact,
  recordCorrect,
  recordWrong,
  tickTimer,
} from '../factDrill';
import { createRng } from '../rng';
import type { FactStats } from '../../learner/types';

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

describe('factDrill — pickWeakestFact (Phase 5c)', () => {
  const makeStats = (attempts: number, correct: number): FactStats => ({
    attempts,
    correct,
    avgResponseMs: 1000,
    lastSeen: 0,
  });

  it('returns null when factsKnown is empty (caller should use uniform path)', () => {
    const pool = buildFactPool([2, 3]);
    expect(pickWeakestFact(pool, {}, createRng(1))).toBeNull();
    expect(pickWeakestFact(pool, undefined, createRng(1))).toBeNull();
  });

  it('biases toward the weakest fact much more than the mastered one', () => {
    const pool = buildFactPool([1, 2]); // pairs: (1,1) (1,2) (2,2)
    const factsKnown: Record<string, FactStats> = {
      '1x1': makeStats(10, 10), // mastered
      '1x2': makeStats(10, 10), // mastered
      '2x2': makeStats(10, 2), // weak
    };
    const counts = { '1x1': 0, '1x2': 0, '2x2': 0 } as Record<string, number>;
    const rng = createRng(2026);
    for (let i = 0; i < 1000; i += 1) {
      const picked = pickWeakestFact(pool, factsKnown, rng);
      if (!picked) continue;
      counts[factPairKey(picked[0], picked[1])] =
        (counts[factPairKey(picked[0], picked[1])] ?? 0) + 1;
    }
    // 70% target the weakest (2x2); the other 30% retention on mastered.
    // Allow generous tolerance (±5%) to keep the test stable.
    expect(counts['2x2']).toBeGreaterThan(600);
    expect((counts['1x1'] ?? 0) + (counts['1x2'] ?? 0)).toBeLessThan(400);
  });

  it('prefers unseen pairs over partially-seen ones on the weakness pass', () => {
    const pool = buildFactPool([1, 3]); // 6 pairs
    const factsKnown: Record<string, FactStats> = {
      // Mark one pair as mastered, leave the others unseen.
      '1x1': makeStats(10, 10),
    };
    const rng = createRng(7);
    const unseenHits = new Set<string>();
    for (let i = 0; i < 200; i += 1) {
      const picked = pickWeakestFact(pool, factsKnown, rng);
      if (!picked) continue;
      const key = factPairKey(picked[0], picked[1]);
      if (key !== '1x1') unseenHits.add(key);
    }
    // We should see almost all 5 unseen pairs hit at least once over 200 rolls.
    expect(unseenHits.size).toBeGreaterThanOrEqual(4);
  });
});

describe('factDrill — pickNextFact with factsKnown (Phase 5c)', () => {
  it('falls through to uniform when factsKnown is empty', () => {
    const pool = buildFactPool([2, 3]);
    const picked = pickNextFact(pool, new Set(), createRng(99), {});
    // Just confirms no crash and a valid pair from the pool.
    expect(picked).not.toBeNull();
    expect(pool.some(([a, b]) => a === picked![0] && b === picked![1])).toBe(true);
  });

  it('biases toward weakest when factsKnown is populated', () => {
    const pool = buildFactPool([1, 2]);
    const factsKnown = {
      '1x1': { attempts: 10, correct: 10, avgResponseMs: 0, lastSeen: 0 },
      '1x2': { attempts: 10, correct: 10, avgResponseMs: 0, lastSeen: 0 },
      '2x2': { attempts: 10, correct: 2, avgResponseMs: 0, lastSeen: 0 },
    };
    let weakHits = 0;
    const rng = createRng(11);
    for (let i = 0; i < 500; i += 1) {
      const picked = pickNextFact(pool, new Set(), rng, factsKnown);
      if (picked && factPairKey(picked[0], picked[1]) === '2x2') weakHits += 1;
    }
    expect(weakHits).toBeGreaterThan(300);
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

  it('respects allowSwap=false (keeps caller order for non-commutative ops)', () => {
    // Even with a swap-favoring RNG, allowSwap=false must keep (a, b).
    const rng = (): number => 0.0;
    for (let i = 0; i < 3; i += 1) {
      const problem = makeFact(8, 3, '−', [1, 10], rng, (x, y) => x - y, false);
      expect(problem.factorA).toBe(8);
      expect(problem.factorB).toBe(3);
      expect(problem.answer).toBe(5);
    }
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

describe('factDrill — buildFactForOperator', () => {
  it('multiplication: answer is the product, swap allowed', () => {
    const rng = createRng(7);
    const problem = buildFactForOperator('×', [3, 4], [2, 5], rng);
    expect(problem.opSymbol).toBe('×');
    expect(problem.answer).toBe(12);
    expect([problem.factorA, problem.factorB].sort((a, b) => a - b)).toEqual([3, 4]);
  });

  it('addition: answer is the sum across every pool pair', () => {
    const range: [number, number] = [1, 10];
    const pool = buildFactPool(range);
    const rng = createRng(11);
    for (const pair of pool) {
      const problem = buildFactForOperator('+', pair, range, rng);
      expect(problem.opSymbol).toBe('+');
      expect(problem.answer).toBe(pair[0] + pair[1]);
    }
  });

  it('subtraction: answer is non-negative and equals larger − smaller', () => {
    const range: [number, number] = [1, 20];
    const pool = buildFactPool(range);
    const rng = createRng(13);
    for (const pair of pool) {
      const [smaller, larger] = pair;
      const problem = buildFactForOperator('−', pair, range, rng);
      expect(problem.opSymbol).toBe('−');
      expect(problem.factorA).toBe(larger);
      expect(problem.factorB).toBe(smaller);
      expect(problem.answer).toBe(larger - smaller);
      expect(problem.answer).toBeGreaterThanOrEqual(0);
    }
  });

  it('division: answer is integer and dividend is exact multiple of divisor', () => {
    const range: [number, number] = [2, 10];
    const pool = buildFactPool(range);
    const rng = createRng(17);
    for (const pair of pool) {
      const [q, d] = pair;
      const problem = buildFactForOperator('÷', pair, range, rng);
      expect(problem.opSymbol).toBe('÷');
      expect(problem.factorA).toBe(q * d);
      expect(problem.factorB).toBe(d);
      expect(problem.answer).toBe(q);
      expect(Number.isInteger(problem.answer)).toBe(true);
      expect(problem.factorA % problem.factorB).toBe(0);
    }
  });

  it('division: never produces fractional equations like 4 ÷ 5', () => {
    const range: [number, number] = [2, 5];
    const pool = buildFactPool(range);
    const rng = createRng(19);
    for (let i = 0; i < 200; i += 1) {
      const pair = pool[i % pool.length];
      if (!pair) continue;
      const problem = buildFactForOperator('÷', pair, range, rng);
      expect(problem.factorA % problem.factorB).toBe(0);
    }
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
