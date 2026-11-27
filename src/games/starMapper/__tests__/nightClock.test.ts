import { describe, expect, it } from 'vitest';
import {
  advance,
  budgetFor,
  dawnProgress,
  MAX_STEP_MS,
  MOOD_CAP,
  MOOD_NIGHT_MS,
  skyOffsetMs,
  SKY_TURN_MS,
  startClock,
  type NightClock,
} from '../nightClock';

const run = (state: NightClock, ms: number, running = true): NightClock => {
  let s = state;
  for (let t = 0; t < ms; t += 50) s = advance(s, 50, running);
  return s;
};

describe('night clock', () => {
  it('gives no budget at levels 1-4, then 90/80/75/70/60 s', () => {
    expect([1, 2, 3, 4].map(budgetFor)).toEqual([null, null, null, null]);
    expect([5, 6, 7, 8, 9, 14].map(budgetFor)).toEqual([
      90_000, 80_000, 75_000, 70_000, 60_000, 60_000,
    ]);
  });

  it('never fails at levels 1-4 and stops at 90 % of the way to dawn', () => {
    const s = run(startClock(3), MOOD_NIGHT_MS * 3);
    expect(s.failed).toBe(false);
    expect(dawnProgress(s)).toBeCloseTo(MOOD_CAP);
    expect(skyOffsetMs(s)).toBeCloseTo(MOOD_CAP * SKY_TURN_MS);
  });

  it('does not advance while not running', () => {
    const s = run(startClock(5), 10_000, false);
    expect(s.elapsedMs).toBe(0);
  });

  it('caps one frame after a stall', () => {
    expect(advance(startClock(5), 30_000, true).elapsedMs).toBe(MAX_STEP_MS);
  });

  it('fails once when the budget is reached and stays failed', () => {
    const failed = run(startClock(9), 61_000);
    expect(failed.failed).toBe(true);
    expect(dawnProgress(failed)).toBe(1);
    expect(advance(failed, 50, true)).toBe(failed);
  });

  it('warns at 75 % of the budget, never without one', () => {
    expect(run(startClock(5), 67_000).warned).toBe(false);
    expect(run(startClock(5), 68_000).warned).toBe(true);
    expect(run(startClock(2), 200_000).warned).toBe(false);
  });

  it('a reset starts a fresh night', () => {
    const failed = run(startClock(6), 81_000);
    expect(failed.failed).toBe(true);
    const fresh = startClock(6);
    expect(fresh).toEqual({ elapsedMs: 0, budgetMs: 80_000, warned: false, failed: false });
  });

  it('holds still after the last line: the view stops running it', () => {
    const almost = run(startClock(5), 89_000);
    expect(almost.failed).toBe(false);
    // The last line was drawn: the view no longer runs the clock until a new problem.
    expect(run(almost, 5000, false)).toBe(almost);
  });
});
