/**
 * The night before dawn: each task runs on a clock that turns the sky and
 * brings the dawn. Levels 1-4 have no budget, so the night stops at 90 % of
 * the way to dawn and never fails; from level 5 the dawn reaching the target
 * fails the task once. Pure: the view feeds it frame deltas while the task is
 * open.
 */

export interface NightClock {
  elapsedMs: number;
  budgetMs: number | null;
  /** The dawn has come far enough for the owl to hurry the learner (budget only). */
  warned: boolean;
  failed: boolean;
}

/** Seconds to dawn by level, from level 5 (the last applies from 9 on). */
const BUDGET_S = [90, 80, 75, 70, 60] as const;

/** Without a budget the night takes this long to reach its 90 % mark. */
export const MOOD_NIGHT_MS = 108_000;
export const MOOD_CAP = 0.9;
/** How far the sky turns over a whole night, in sky time. */
export const SKY_TURN_MS = 45 * 60_000;
/** A frame after a stall (a hidden tab, a slow device) adds no more than this. */
export const MAX_STEP_MS = 100;
/** Share of the budget after which the dawn is close. */
export const DAWN_WARN = 0.75;

export function budgetFor(level: number): number | null {
  if (level < 5) return null;
  return BUDGET_S[Math.min(level - 5, BUDGET_S.length - 1)]! * 1000;
}

export const startClock = (level: number): NightClock => ({
  elapsedMs: 0,
  budgetMs: budgetFor(level),
  warned: false,
  failed: false,
});

export function advance(state: NightClock, dtMs: number, running: boolean): NightClock {
  if (!running || state.failed || dtMs <= 0) return state;
  const elapsedMs = state.elapsedMs + Math.min(dtMs, MAX_STEP_MS);
  if (state.budgetMs === null) return { ...state, elapsedMs: Math.min(elapsedMs, MOOD_NIGHT_MS) };
  if (elapsedMs >= state.budgetMs) {
    return { ...state, elapsedMs: state.budgetMs, warned: true, failed: true };
  }
  return { ...state, elapsedMs, warned: elapsedMs >= state.budgetMs * DAWN_WARN };
}

/** How far the dawn has come, 0 to 1 (0.9 at most without a budget). */
export function dawnProgress(state: NightClock): number {
  if (state.budgetMs === null) return (state.elapsedMs / MOOD_NIGHT_MS) * MOOD_CAP;
  return Math.min(1, state.elapsedMs / state.budgetMs);
}

/** Sky time added to the scene's moment: the real sidereal turn, sped up. */
export const skyOffsetMs = (state: NightClock): number => dawnProgress(state) * SKY_TURN_MS;
