import { describe, expect, it } from 'vitest';
import {
  completeSlot,
  isPathDone,
  localDay,
  nextAfterRound,
  nextSlot,
  parsePathSlot,
  pathForDay,
  pickPath,
  previousDay,
  refocusPath,
  streakOn,
  type PathCandidate,
  type PathLearner,
  type SlotResult,
} from '../path';
import { createLearnerMeta } from '../learnerMeta';
import { PATH_STICKER_IDS } from '../stickers';
import type { LearnerMeta, TodayPath } from '../types';

const candidates: PathCandidate[] = [
  { gameId: 'word_builder', subject: 'language', skillIds: ['vocab'], needsReading: true },
  { gameId: 'letter_match', subject: 'language', skillIds: ['vocab'], needsReading: false },
  { gameId: 'addition_snake', subject: 'math', skillIds: ['add20'], needsReading: false },
  { gameId: 'balance_scale', subject: 'math', skillIds: ['equations'], needsReading: false },
  { gameId: 'pattern', subject: 'logic', skillIds: ['patterns'], needsReading: false },
  { gameId: 'robo_path', subject: 'logic', skillIds: ['sequencing'], needsReading: false },
  { gameId: 'memory_math', subject: 'memory', skillIds: ['memory'], needsReading: false },
];
const subjectOf = (gameId: string) => candidates.find((c) => c.gameId === gameId)!.subject;

const learner = (overrides: Partial<PathLearner> = {}): PathLearner => ({
  id: 'mia',
  skills: {},
  focus: null,
  ...overrides,
});

/** Noon on a local day, so a time zone never moves it to another date. */
const at = (day: string, hour = 12) => {
  const [y, m, d] = day.split('-').map(Number) as [number, number, number];
  return new Date(y, m - 1, d, hour).getTime();
};

describe('localDay', () => {
  it('turns at local midnight', () => {
    const [y, m, d] = [2026, 10, 28];
    expect(localDay(new Date(y, m, d, 23, 59).getTime())).toBe('2026-11-28');
    expect(localDay(new Date(y, m, d + 1, 0, 0).getTime())).toBe('2026-11-29');
    expect(previousDay('2026-12-01')).toBe('2026-11-30');
    expect(previousDay('2027-01-01')).toBe('2026-12-31');
  });
});

describe('pickPath', () => {
  it('gives a learner with no answers yet three games from three subjects', () => {
    const path = pickPath(learner(), candidates, '2026-11-28');
    expect(path).toHaveLength(3);
    expect(new Set(path.map(subjectOf)).size).toBe(3);
  });

  it('is the same all day and differs between learners and days', () => {
    const day = pickPath(learner(), candidates, '2026-11-28');
    expect(pickPath(learner(), candidates, '2026-11-28')).toEqual(day);
    const days = ['2026-11-29', '2026-11-30', '2026-12-01', '2026-12-02'].map((d) =>
      pickPath(learner(), candidates, d).join(),
    );
    const others = ['ott', 'eva', 'uku', 'liis'].map((id) =>
      pickPath(learner({ id }), candidates, '2026-11-28').join(),
    );
    expect(new Set([day.join(), ...days]).size).toBeGreaterThan(1);
    expect(new Set([day.join(), ...others]).size).toBeGreaterThan(1);
  });

  it('starts from the weakest skills', () => {
    const path = pickPath(
      learner({
        skills: {
          add20: { attempts: 10, correct: 3 },
          patterns: { attempts: 10, correct: 9 },
          memory: { attempts: 10, correct: 5 },
        },
      }),
      candidates,
      '2026-11-28',
    );
    expect(path[0]).toBe('addition_snake');
    expect(path[1]).toBe('memory_math');
    expect(path).toContain('pattern');
  });

  it('takes two rounds from a focus and one from elsewhere', () => {
    const subject = pickPath(
      learner({ focus: { kind: 'subject', subject: 'math' } }),
      candidates,
      '2026-11-28',
    );
    expect(subject.slice(0, 2).map(subjectOf)).toEqual(['math', 'math']);
    expect(subjectOf(subject[2]!)).not.toBe('math');

    const skill = pickPath(
      learner({ focus: { kind: 'skill', skillId: 'vocab' } }),
      candidates,
      '2026-11-28',
    );
    expect(skill.slice(0, 2).sort()).toEqual(['letter_match', 'word_builder']);
  });

  it('leaves out games that need reading for a learner under 7', () => {
    const young = learner({ ageHint: 6, focus: { kind: 'skill', skillId: 'vocab' } });
    for (const day of ['2026-11-28', '2026-11-29', '2026-11-30']) {
      expect(pickPath(young, candidates, day)).not.toContain('word_builder');
    }
    expect(pickPath(young, candidates, '2026-11-28')).toContain('letter_match');
  });
});

describe('the path through a day', () => {
  const day = '2026-11-28';
  const start = (
    meta: LearnerMeta = createLearnerMeta(),
  ): { meta: LearnerMeta; path: TodayPath } => {
    const path = pathForDay(meta, learner(), candidates, day);
    return { meta: { ...meta, path }, path };
  };

  it('keeps today’s path and picks a new one the next day', () => {
    const { meta, path } = start();
    expect(pathForDay(meta, learner(), candidates, day)).toBe(path);
    expect(pathForDay(meta, learner(), candidates, '2026-11-29').day).toBe('2026-11-29');
  });

  it('fills a slot with the next sticker only for its own game on its day', () => {
    const { meta, path } = start();
    const game = path.slots[0]!.gameId;
    expect(completeSlot(meta, path, 0, 'other_game', at(day))).toBeNull();
    expect(completeSlot(meta, path, 0, game, at('2026-11-29'))).toBeNull();

    const first = completeSlot(meta, path, 0, game, at(day))!;
    expect(first.sticker).toMatchObject({ stickerId: PATH_STICKER_IDS[0], gameId: game });
    expect(first.meta.album).toHaveLength(1);
    expect(first.dayDone).toBeNull();
    expect(nextSlot(first.meta.path!)).toBe(1);
    expect(completeSlot(first.meta, first.meta.path!, 0, game, at(day))).toBeNull();
  });

  it('finishes the day on the last slot and counts the streak once', () => {
    let { meta } = start();
    for (let slot = 0; slot < 3; slot++) {
      const result = completeSlot(meta, meta.path!, slot, meta.path!.slots[slot]!.gameId, at(day));
      meta = result!.meta;
      if (slot === 2) expect(result!.dayDone).toEqual({ streak: 1 });
    }
    expect(isPathDone(meta.path!)).toBe(true);
    expect(meta.album.map((s) => s.stickerId)).toEqual(PATH_STICKER_IDS.slice(0, 3));
    expect(streakOn(meta, day)).toBe(1);
    expect(streakOn(meta, '2026-11-29')).toBe(1);
  });

  it('grows the streak on the next day and ends it after a missed day', () => {
    const meta: LearnerMeta = {
      ...createLearnerMeta(),
      streak: { days: 4, lastDay: '2026-11-27' },
    };
    expect(streakOn(meta, day)).toBe(4);
    expect(streakOn(meta, '2026-11-29')).toBe(0);

    const playDay = (from: LearnerMeta): SlotResult => {
      let current = start(from).meta;
      let last: SlotResult | null = null;
      for (let slot = 0; slot < 3; slot++) {
        last = completeSlot(
          current,
          current.path!,
          slot,
          current.path!.slots[slot]!.gameId,
          at(day),
        );
        if (!last) throw new Error(`slot ${slot} did not fill`);
        current = last.meta;
      }
      return last!;
    };
    expect(playDay(meta).dayDone).toEqual({ streak: 5 });

    const missed: LearnerMeta = {
      ...createLearnerMeta(),
      streak: { days: 4, lastDay: '2026-11-25' },
    };
    expect(playDay(missed).dayDone).toEqual({ streak: 1 });
  });

  it('keeps the rounds done when the focus changes and refills the open ones', () => {
    const { meta, path } = start();
    const done = completeSlot(meta, path, 0, path.slots[0]!.gameId, at(day))!.meta.path!;
    const refocused = refocusPath(done, ['balance_scale', 'addition_snake', 'pattern']);
    expect(refocused.slots[0]).toEqual(done.slots[0]);
    expect(refocused.slots.slice(1).every((s) => s.stickerId === null)).toBe(true);
    expect(refocused.slots.slice(1).map((s) => s.gameId)).not.toContain(done.slots[0]!.gameId);
  });
});

describe('nextAfterRound', () => {
  const path: TodayPath = {
    day: '2026-11-28',
    slots: [
      { gameId: 'pattern', stickerId: 'fox' },
      { gameId: 'robo_path', stickerId: null },
      { gameId: 'memory_math', stickerId: null },
    ],
  };
  const round = { path, pathSlot: 0, reached: true, filled: true, dayDone: false };

  it("leads a filled slot to the path's next round and a finished day to the album", () => {
    expect(nextAfterRound(round)).toEqual({ kind: 'slot', slot: 1, gameId: 'robo_path' });
    expect(nextAfterRound({ ...round, dayDone: true })).toEqual({ kind: 'album' });
  });

  it('plays a lost path round again on its slot, and a picker round with none', () => {
    expect(nextAfterRound({ ...round, pathSlot: 1, reached: false, filled: false })).toEqual({
      kind: 'again',
      pathSlot: 1,
    });
    expect(nextAfterRound({ ...round, pathSlot: null, filled: false })).toEqual({
      kind: 'again',
      pathSlot: null,
    });
  });

  it('reads a slot only within the path from its address', () => {
    expect(parsePathSlot('2')).toBe(2);
    expect(parsePathSlot('3')).toBeNull();
    expect(parsePathSlot('x')).toBeNull();
    expect(parsePathSlot(null)).toBeNull();
  });
});
