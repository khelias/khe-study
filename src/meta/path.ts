/**
 * Today's path, its streak and the album (ADR 0005 point 6):
 * three rounds a day picked for a learner, a sticker for each one that
 * reaches its goal, and the days in a row with a finished path. Pure rules;
 * the store applies them to the active learner.
 */

import { createRng, shuffle } from '../engine/rng';
import type { AlbumSticker, LearnerMeta, ParentFocus, TodayPath } from './types';
import { PATH_STICKER_IDS } from './stickers';

export const PATH_LENGTH = 3;
/** With a focus, this many of the three rounds come from it. */
export const FOCUS_SLOTS = 2;
/** A learner younger than this gets no game that needs reading on the path. */
export const READING_AGE = 7;

/** A game the path may pick. */
export interface PathCandidate {
  gameId: string;
  /** The picker's subject: language, math, logic or memory. */
  subject: string;
  skillIds: readonly string[];
  needsReading: boolean;
}

/** What the picker knows about the learner. */
export interface PathLearner {
  id: string;
  ageHint?: number;
  /** Per skill: answers given and how many were right. */
  skills: Readonly<Record<string, { attempts: number; correct: number }>>;
  focus: ParentFocus | null;
}

/** The learner's local calendar day, `YYYY-MM-DD`. */
export function localDay(now: number): string {
  const d = new Date(now);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** The local day before `day`. */
export function previousDay(day: string): string {
  const [y, m, d] = day.split('-').map(Number) as [number, number, number];
  return localDay(new Date(y, m - 1, d - 1, 12).getTime());
}

const seedOf = (text: string): number => {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return (h >>> 0) % 2147483646 || 1;
};

/** Whether two focuses (or two lacks of one) are the same choice. */
export const sameFocus = (a: ParentFocus | null, b: ParentFocus | null): boolean =>
  a === null || b === null
    ? a === b
    : a.kind === 'subject'
      ? b.kind === 'subject' && a.subject === b.subject
      : b.kind === 'skill' && a.skillId === b.skillId;

/** The candidates a learner of `ageHint` gets: none that needs reading under seven. */
export const readableFor = (
  candidates: readonly PathCandidate[],
  ageHint: number | undefined,
): readonly PathCandidate[] =>
  candidates.filter((c) => !(c.needsReading && ageHint !== undefined && ageHint < READING_AGE));

const fitsFocus = (focus: ParentFocus, c: PathCandidate): boolean =>
  focus.kind === 'subject' ? c.subject === focus.subject : c.skillIds.includes(focus.skillId);

/**
 * Today's three games: with a focus two from it, then the learner's weakest
 * skills, then one game per subject not yet on the path. The same learner on
 * the same day gets the same path.
 */
export function pickPath(
  learner: PathLearner,
  candidates: readonly PathCandidate[],
  day: string,
): string[] {
  const rng = createRng(seedOf(`${learner.id}:${day}`));
  const readable = readableFor(candidates, learner.ageHint);
  const pool = shuffle([...readable], rng);
  const picked: PathCandidate[] = [];
  const take = (from: readonly PathCandidate[], count: number) => {
    for (const c of from) {
      if (picked.length >= PATH_LENGTH || count <= 0) return;
      if (picked.some((p) => p.gameId === c.gameId)) continue;
      picked.push(c);
      count--;
    }
  };

  if (learner.focus) {
    const focus = learner.focus;
    take(
      pool.filter((c) => fitsFocus(focus, c)),
      FOCUS_SLOTS,
    );
  }

  const accuracy = (skillId: string): number | null => {
    const s = learner.skills[skillId];
    return s && s.attempts > 0 ? s.correct / s.attempts : null;
  };
  const weakest = Object.keys(learner.skills)
    .filter((id) => accuracy(id) !== null)
    .sort((a, b) => accuracy(a)! - accuracy(b)!);
  for (const skillId of weakest) {
    if (picked.length >= PATH_LENGTH) break;
    // One game per weak skill, so the path is not three takes on one skill.
    take(
      pool.filter((c) => c.skillIds.includes(skillId)),
      1,
    );
  }

  const subjects = [...new Set(pool.map((c) => c.subject))];
  for (const subject of subjects) {
    if (picked.some((p) => p.subject === subject)) continue;
    take(
      pool.filter((c) => c.subject === subject),
      1,
    );
  }
  take(pool, PATH_LENGTH);
  return picked.map((c) => c.gameId);
}

/** The learner's path for `day`: today's if there is one, else a new one. */
export function pathForDay(
  meta: LearnerMeta,
  learner: PathLearner,
  candidates: readonly PathCandidate[],
  day: string,
): TodayPath {
  if (meta.path?.day === day) return meta.path;
  return {
    day,
    slots: pickPath(learner, candidates, day).map((gameId) => ({ gameId, stickerId: null })),
  };
}

/** The first slot not yet done, or null when the path is finished. */
export function nextSlot(path: TodayPath): number | null {
  const index = path.slots.findIndex((s) => s.stickerId === null);
  return index === -1 ? null : index;
}

export const isPathDone = (path: TodayPath): boolean =>
  path.slots.length > 0 && nextSlot(path) === null;

/** Days in a row with a finished path, as shown on `day`: a missed day ends it. */
export function streakOn(meta: LearnerMeta, day: string): number {
  const { lastDay, days } = meta.streak;
  return lastDay === day || lastDay === previousDay(day) ? days : 0;
}

export interface SlotResult {
  meta: LearnerMeta;
  sticker: AlbumSticker;
  /** Set when this round finished the day's path: the streak it reached. */
  dayDone: { streak: number } | null;
}

/**
 * A round started from slot `slot` of the path for `day` reached its goal: the
 * slot gets the next sticker of the set, which goes into the album; the last
 * slot finishes the day and grows the streak. Null when the slot is not open
 * (another day's path, a slot already done, another game).
 */
export function completeSlot(
  meta: LearnerMeta,
  path: TodayPath,
  slot: number,
  gameId: string,
  now: number,
  /** When the round began; a round started before midnight counts for its day. */
  startedAt: number = now,
): SlotResult | null {
  const target = path.slots[slot];
  if (!target || target.stickerId !== null || target.gameId !== gameId) return null;
  if (path.day !== localDay(startedAt)) return null;

  const stickerId = PATH_STICKER_IDS[meta.album.length % PATH_STICKER_IDS.length]!;
  const sticker: AlbumSticker = { stickerId, gameId, earnedAt: now };
  const slots = path.slots.map((s, i) => (i === slot ? { ...s, stickerId } : s));
  const nextPath: TodayPath = { ...path, slots };

  let streak = meta.streak;
  let dayDone: SlotResult['dayDone'] = null;
  if (isPathDone(nextPath) && meta.streak.lastDay !== path.day) {
    const days = streakOn(meta, path.day) + 1;
    streak = { days, lastDay: path.day };
    dayDone = { streak: days };
  }
  return {
    meta: { ...meta, path: nextPath, streak, album: [...meta.album, sticker] },
    sticker,
    dayDone,
  };
}

/**
 * Today's path after a parent changed the focus: rounds already done stay,
 * the open ones take the new pick's games in order.
 */
export function refocusPath(path: TodayPath, picked: readonly string[]): TodayPath {
  const done = new Set(path.slots.filter((s) => s.stickerId !== null).map((s) => s.gameId));
  const fresh = picked.filter((gameId) => !done.has(gameId));
  return {
    ...path,
    slots: path.slots.map((slot) =>
      slot.stickerId !== null ? slot : { gameId: fresh.shift() ?? slot.gameId, stickerId: null },
    ),
  };
}

/** A path slot from the `?path=` of a game's address, or null. */
export function parsePathSlot(param: string | null): number | null {
  if (param === null || !/^\d+$/.test(param)) return null;
  const slot = Number(param);
  return slot < PATH_LENGTH ? slot : null;
}

/** What the end screen's main button does after a round. */
export type AfterRound =
  | { kind: 'album' }
  | { kind: 'slot'; slot: number; gameId: string }
  | { kind: 'again'; pathSlot: number | null };

/**
 * After a round: a finished day opens the album, a filled slot leads to the
 * path's next round, and otherwise the same game plays again, a lost path
 * round on its own slot.
 */
export function nextAfterRound(round: {
  path: TodayPath | null;
  pathSlot: number | null;
  reached: boolean;
  filled: boolean;
  dayDone: boolean;
}): AfterRound {
  if (round.dayDone) return { kind: 'album' };
  const slot = round.filled && round.path ? nextSlot(round.path) : null;
  if (slot !== null) return { kind: 'slot', slot, gameId: round.path!.slots[slot]!.gameId };
  return { kind: 'again', pathSlot: round.reached ? null : round.pathSlot };
}

/** Today's path after a parent changed the focus, picked again for its open rounds. */
export function pathAfterFocus(
  meta: LearnerMeta,
  learner: PathLearner,
  candidates: readonly PathCandidate[],
  day: string,
): TodayPath | null {
  if (meta.path?.day !== day) return meta.path;
  return refocusPath(meta.path, pickPath(learner, candidates, day));
}
