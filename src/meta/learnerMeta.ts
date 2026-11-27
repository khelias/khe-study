import { createStats } from '../engine/stats';
import type { Stats } from '../types/stats';
import type { LearnerMeta } from './types';

export function createLearnerMeta(): LearnerMeta {
  return { stars: 0, stats: createStats(), achievements: [], highScores: {}, ownedThemeIds: [] };
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const nonNegative = (value: unknown): number =>
  typeof value === 'number' && Number.isFinite(value) ? Math.max(0, value) : 0;

const stringIds = (value: unknown): string[] =>
  Array.isArray(value)
    ? [...new Set(value.filter((id): id is string => typeof id === 'string'))]
    : [];

/**
 * Two records of one learner joined, so neither loses progress: stars add up,
 * the stats with more games played win (`b`'s on a tie), achievements and themes are united
 * and each high score is the better one.
 */
export function mergeLearnerMeta(a: LearnerMeta, b: LearnerMeta): LearnerMeta {
  const highScores = { ...a.highScores };
  for (const [game, score] of Object.entries(b.highScores)) {
    highScores[game] = Math.max(highScores[game] ?? 0, score);
  }
  return {
    stars: a.stars + b.stars,
    stats: b.stats.gamesPlayed >= a.stats.gamesPlayed ? b.stats : a.stats,
    achievements: [...new Set([...a.achievements, ...b.achievements])],
    highScores,
    ownedThemeIds: [...new Set([...a.ownedThemeIds, ...b.ownedThemeIds])],
  };
}

/** A stored meta field as a whole `LearnerMeta`: missing or malformed parts start empty. */
export function normalizeLearnerMeta(value: unknown): LearnerMeta {
  const raw = isRecord(value) ? value : {};
  const highScores: Record<string, number> = {};
  if (isRecord(raw.highScores)) {
    for (const [game, score] of Object.entries(raw.highScores)) {
      if (typeof score === 'number' && Number.isFinite(score)) highScores[game] = score;
    }
  }
  return {
    stars: nonNegative(raw.stars),
    stats: isRecord(raw.stats)
      ? { ...createStats(), ...(raw.stats as Partial<Stats>) }
      : createStats(),
    achievements: stringIds(raw.achievements),
    highScores,
    ownedThemeIds: stringIds(raw.ownedThemeIds),
  };
}
