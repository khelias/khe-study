import { createStats } from '../engine/stats';
import type { Stats } from '../types/stats';
import type { AlbumSticker, LearnerMeta, ParentFocus, TodayPath } from './types';

export function createLearnerMeta(): LearnerMeta {
  return {
    stars: 0,
    stats: createStats(),
    achievements: [],
    highScores: {},
    ownedThemeIds: [],
    path: null,
    streak: { days: 0, lastDay: null },
    album: [],
    focus: null,
  };
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
    path: b.path ?? a.path,
    streak: b.streak.days >= a.streak.days ? b.streak : a.streak,
    album: [...a.album, ...b.album.filter((s) => !a.album.some((t) => sameSticker(s, t)))],
    focus: b.focus ?? a.focus,
  };
}

const sameSticker = (a: AlbumSticker, b: AlbumSticker): boolean =>
  a.stickerId === b.stickerId && a.earnedAt === b.earnedAt;

const isDay = (value: unknown): value is string =>
  typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);

function normalizePath(value: unknown): TodayPath | null {
  if (!isRecord(value) || !isDay(value.day) || !Array.isArray(value.slots)) return null;
  const slots = value.slots.filter(isRecord).flatMap((slot) =>
    typeof slot.gameId === 'string'
      ? [
          {
            gameId: slot.gameId,
            stickerId: typeof slot.stickerId === 'string' ? slot.stickerId : null,
          },
        ]
      : [],
  );
  return slots.length > 0 ? { day: value.day, slots } : null;
}

function normalizeFocus(value: unknown): ParentFocus | null {
  if (!isRecord(value)) return null;
  if (value.kind === 'subject' && typeof value.subject === 'string') {
    return { kind: 'subject', subject: value.subject };
  }
  if (value.kind === 'skill' && typeof value.skillId === 'string') {
    return { kind: 'skill', skillId: value.skillId };
  }
  return null;
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
    path: normalizePath(raw.path),
    streak: isRecord(raw.streak)
      ? {
          days: Math.floor(nonNegative(raw.streak.days)),
          lastDay: isDay(raw.streak.lastDay) ? raw.streak.lastDay : null,
        }
      : { days: 0, lastDay: null },
    album: Array.isArray(raw.album)
      ? raw.album
          .filter(isRecord)
          .flatMap((s) =>
            typeof s.stickerId === 'string' && typeof s.gameId === 'string'
              ? [{ stickerId: s.stickerId, gameId: s.gameId, earnedAt: nonNegative(s.earnedAt) }]
              : [],
          )
      : [],
    focus: normalizeFocus(raw.focus),
  };
}
