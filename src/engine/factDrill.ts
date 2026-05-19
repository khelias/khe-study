/**
 * Fact Drill Engine
 *
 * Pure session logic for the `fact_drill` mechanic: a fixed-duration sprint
 * (default 60s) of single-equation fact questions. Built operation-neutral so
 * the same engine serves multiplication today and addition/subtraction
 * sidumised later by passing a different `opSymbol` and factor range.
 *
 * UI concerns (timer ticking, key input, rendering) live in FactDrillView;
 * this module only owns state transitions over a session.
 */

import type { FactStats } from '../learner/types';
import type { FactDrillProblem, RngFunction } from '../types/game';
import { getRandom, uid } from './rng';

/** Default sprint length in seconds. Overridable per binding via GameConfig.timerDuration. */
export const FACT_DRILL_DEFAULT_DURATION = 60;

/**
 * Size of the recent-history window used to avoid repeating a fact too
 * quickly. Picked small so even tiny pools (e.g. multiplication 1–5 has
 * only 16 unique products) still have viable picks. The view forwards the
 * last N keys to `pickNextFact`.
 */
export const FACT_DRILL_RECENT_WINDOW = 4;

/** Snapshot of a live fact-drill session. All transitions are pure. */
export interface FactDrillSessionState {
  /** Total correct answers so far. */
  correctCount: number;
  /** Total wrong answers so far (informational; does not penalize). */
  wrongCount: number;
  /** Current consecutive-correct streak. */
  currentStreak: number;
  /** Best streak achieved during this session. */
  bestStreak: number;
  /** Time remaining in seconds. */
  timeRemaining: number;
  /** True once the session has ended (timer reached zero). */
  isFinished: boolean;
}

/** Initial state for a new session. */
export function createFactDrillSession(
  duration: number = FACT_DRILL_DEFAULT_DURATION,
): FactDrillSessionState {
  return {
    correctCount: 0,
    wrongCount: 0,
    currentStreak: 0,
    bestStreak: 0,
    timeRemaining: Math.max(0, duration),
    isFinished: duration <= 0,
  };
}

/**
 * Produce all distinct factor pairs in [min, max] with a <= b so commutative
 * duplicates (3×4 vs 4×3) are not both in the pool. The view shuffles a/b
 * order when rendering so the learner still sees both orientations.
 */
export function buildFactPool(factorRange: [number, number]): Array<[number, number]> {
  const [rawMin, rawMax] = factorRange;
  const min = Math.max(0, Math.floor(rawMin));
  const max = Math.max(min, Math.floor(rawMax));
  const pairs: Array<[number, number]> = [];
  for (let a = min; a <= max; a += 1) {
    for (let b = a; b <= max; b += 1) {
      pairs.push([a, b]);
    }
  }
  return pairs;
}

/** Canonical key for de-duplication within the recent-history window. */
export function factPairKey(a: number, b: number): string {
  return a <= b ? `${a}x${b}` : `${b}x${a}`;
}

/**
 * Phase 5c: probability that the next pick targets the weakest fact rather
 * than retention (mastered) facts. 0.7 = spend most reps on shaky knowledge;
 * 0.3 of the time we still touch mastered facts so they don't fade.
 */
export const WEAKEST_FACT_PROBABILITY = 0.7;

/**
 * Phase 5c: pick the next fact biased toward the weakest entry in
 * `factsKnown`. Weakness is `1 - correct/attempts`; pairs with no attempts
 * count as fully weak (treated as `weakness = 1`). 70% of the time the
 * weakest fact (or a fresh one) is chosen; 30% the strongest, for retention.
 *
 * Returns `null` if the pool is empty. When `factsKnown` is empty or every
 * pair already shares the maximum weakness, callers should fall back to
 * uniform random selection (the caller's existing path).
 */
export function pickWeakestFact(
  pool: ReadonlyArray<readonly [number, number]>,
  factsKnown: Readonly<Record<string, FactStats>> | undefined,
  rng: RngFunction = Math.random,
): [number, number] | null {
  if (pool.length === 0) return null;
  if (!factsKnown || Object.keys(factsKnown).length === 0) {
    // No history yet — caller's uniform path is the right behaviour.
    return null;
  }

  const scored = pool.map(([a, b]) => {
    const stats = factsKnown[factPairKey(a, b)];
    const attempts = stats?.attempts ?? 0;
    const correct = stats?.correct ?? 0;
    const weakness = attempts === 0 ? 1 : 1 - correct / attempts;
    return { pair: [a, b] as const, weakness, attempts };
  });

  const targetWeakest = rng() < WEAKEST_FACT_PROBABILITY;
  if (targetWeakest) {
    // Prefer unseen pairs first; fall back to highest weakness among seen.
    const unseen = scored.filter((s) => s.attempts === 0);
    if (unseen.length > 0) {
      const pick = getRandom(unseen, rng);
      if (pick) return [pick.pair[0], pick.pair[1]];
    }
    const maxWeakness = Math.max(...scored.map((s) => s.weakness));
    const weakest = scored.filter((s) => s.weakness === maxWeakness);
    const pick = getRandom(weakest, rng);
    return pick ? [pick.pair[0], pick.pair[1]] : null;
  }
  // Retention pass — touch a mastered fact (lowest weakness > 0 attempts).
  const seen = scored.filter((s) => s.attempts > 0);
  if (seen.length === 0) return null;
  const minWeakness = Math.min(...seen.map((s) => s.weakness));
  const mastered = seen.filter((s) => s.weakness === minWeakness);
  const pick = getRandom(mastered, rng);
  return pick ? [pick.pair[0], pick.pair[1]] : null;
}

/**
 * Pick the next fact, preferring pairs not present in `recentKeys`. Falls back
 * to the full pool if every pair is recent (pool smaller than the window).
 * Returns `null` only if the pool is empty.
 *
 * Phase 5c: when `factsKnown` is supplied, biases selection toward the
 * learner's weakest fact via `pickWeakestFact`. Falls through to the
 * uniform recent-aware pick when there is no per-fact history yet.
 */
export function pickNextFact(
  pool: ReadonlyArray<readonly [number, number]>,
  recentKeys: ReadonlySet<string>,
  rng: RngFunction = Math.random,
  factsKnown?: Readonly<Record<string, FactStats>>,
): [number, number] | null {
  if (pool.length === 0) return null;
  const fresh = pool.filter(([a, b]) => !recentKeys.has(factPairKey(a, b)));
  const source = fresh.length > 0 ? fresh : pool;

  if (factsKnown && Object.keys(factsKnown).length > 0) {
    const weighted = pickWeakestFact(source, factsKnown, rng);
    if (weighted) return weighted;
  }

  const picked = getRandom(source, rng);
  if (!picked) return null;
  return [picked[0], picked[1]];
}

/**
 * Build a `FactDrillProblem` from a factor pair.
 *
 * `opSymbol` is the displayed operator ('×', '+', '−', '÷'). The default
 * compute multiplies; addition / subtraction / division bindings pass their
 * own. `allowSwap` controls whether the orientation can flip — true for
 * commutative ops (× and +), false for non-commutative ones (− and ÷) so
 * the caller keeps full control over operand order.
 */
export function makeFact(
  a: number,
  b: number,
  opSymbol: string,
  factorRange: [number, number],
  rng: RngFunction = Math.random,
  compute: (x: number, y: number) => number = (x, y) => x * y,
  allowSwap: boolean = true,
): FactDrillProblem {
  const swap = allowSwap && rng() < 0.5;
  const left = swap ? b : a;
  const right = swap ? a : b;
  return {
    type: 'fact_drill',
    uid: uid(rng),
    factorA: left,
    factorB: right,
    opSymbol,
    equation: `${left} ${opSymbol} ${right}`,
    answer: compute(left, right),
    factorRange,
  };
}

/** Pure transition: record a correct answer. */
export function recordCorrect(state: FactDrillSessionState): FactDrillSessionState {
  const currentStreak = state.currentStreak + 1;
  return {
    ...state,
    correctCount: state.correctCount + 1,
    currentStreak,
    bestStreak: Math.max(state.bestStreak, currentStreak),
  };
}

/** Pure transition: record a wrong answer. Streak resets; score is untouched. */
export function recordWrong(state: FactDrillSessionState): FactDrillSessionState {
  return {
    ...state,
    wrongCount: state.wrongCount + 1,
    currentStreak: 0,
  };
}

/**
 * Pure transition: advance the timer by `deltaSeconds`. Once `timeRemaining`
 * hits zero the session is marked finished and stays there idempotently.
 */
export function tickTimer(
  state: FactDrillSessionState,
  deltaSeconds: number,
): FactDrillSessionState {
  if (state.isFinished) return state;
  const next = Math.max(0, state.timeRemaining - Math.max(0, deltaSeconds));
  return {
    ...state,
    timeRemaining: next,
    isFinished: next <= 0,
  };
}
