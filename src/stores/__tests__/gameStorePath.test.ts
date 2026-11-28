import { beforeEach, describe, expect, it } from 'vitest';
import { useGameStore } from '../gameStore';
import { migrateGameStoreState } from '../gameStoreMigration';
import { createLearnerProfileFromLegacyProgress } from '../../learner';
import { GAME_CONFIG } from '../../games/data';
import { createPin, checkPin } from '../../meta/pin';

const learnerNamed = (id: string) =>
  createLearnerProfileFromLegacyProgress({
    id,
    displayName: id,
    legacyProfileId: '__active__',
    levelsByProfile: { __active__: {} },
    locale: 'et',
    now: 0,
  });

const NOON = new Date(2026, 10, 28, 12).getTime();
const meta = () => useGameStore.getState().activeLearnerProfile.meta;

describe("gameStore: today's path", () => {
  beforeEach(() => {
    const mia = learnerNamed('mia');
    useGameStore.setState({
      learners: [mia, learnerNamed('ott')],
      activeLearnerId: mia.id,
      activeLearnerProfile: mia,
      parentPin: null,
    });
  });

  it('picks today’s path once and keeps it through the day', () => {
    const path = useGameStore.getState().ensureTodayPath(NOON);
    expect(path.day).toBe('2026-11-28');
    expect(path.slots).toHaveLength(3);
    expect(path.slots.every((s) => s.gameId in GAME_CONFIG && s.stickerId === null)).toBe(true);
    expect(useGameStore.getState().ensureTodayPath(NOON + 3_600_000)).toBe(path);
    expect(meta().path).toBe(path);
  });

  it('gives each learner a path of their own', () => {
    useGameStore.getState().ensureTodayPath(NOON);
    useGameStore.getState().setActiveLearner('ott');
    expect(meta().path).toBeNull();
    useGameStore.getState().ensureTodayPath(NOON);
    expect(meta().path).not.toBeNull();
    const mia = useGameStore.getState().learners.find((l) => l.id === 'mia')!;
    expect(mia.meta.path?.day).toBe('2026-11-28');
  });

  it('puts a sticker in the album for a path round and finishes the day on the third', () => {
    const path = useGameStore.getState().ensureTodayPath(NOON);
    const { completePathSlot } = useGameStore.getState();
    expect(completePathSlot(0, path.slots[0]!.gameId, NOON)?.dayDone).toBeNull();
    expect(completePathSlot(1, path.slots[1]!.gameId, NOON)?.dayDone).toBeNull();
    expect(completePathSlot(2, path.slots[2]!.gameId, NOON)?.dayDone).toEqual({ streak: 1 });
    expect(meta().album).toHaveLength(3);
    expect(meta().streak).toEqual({ days: 1, lastDay: '2026-11-28' });
  });

  it('turns today’s open rounds to the focus and back', () => {
    useGameStore.getState().ensureTodayPath(NOON);
    useGameStore.getState().setParentFocus({ kind: 'subject', subject: 'memory' }, NOON);
    const focused = meta().path!.slots.map((s) => GAME_CONFIG[s.gameId]!.category);
    expect(focused.filter((c) => c === 'memory').length).toBeGreaterThanOrEqual(2);
    expect(meta().focus).toEqual({ kind: 'subject', subject: 'memory' });

    useGameStore.getState().setParentFocus(null, NOON);
    expect(meta().focus).toBeNull();
  });

  it('forgets the PIN and every focus, never progress', async () => {
    useGameStore.getState().setParentPin(await createPin('1234'));
    useGameStore.getState().setParentFocus({ kind: 'skill', skillId: 'x' }, NOON);
    useGameStore.getState().earnStars(5);
    useGameStore.getState().clearParentPin();
    const state = useGameStore.getState();
    expect(state.parentPin).toBeNull();
    expect(state.learners.every((l) => l.meta.focus === null)).toBe(true);
    expect(meta().stars).toBe(5);
  });

  it('picks today’s open rounds again without the focus a forgotten PIN removes', () => {
    const now = Date.now();
    useGameStore.getState().setParentFocus({ kind: 'subject', subject: 'memory' }, now);
    useGameStore.getState().ensureTodayPath(now);
    useGameStore.getState().setParentFocus({ kind: 'subject', subject: 'memory' }, now);
    const focused = meta().path!.slots.map((s) => s.gameId);
    useGameStore.getState().clearParentPin();
    useGameStore.getState().setParentFocus(null, now);
    const unfocused = meta().path!.slots.map((s) => s.gameId);
    useGameStore.getState().setParentFocus({ kind: 'subject', subject: 'memory' }, now);
    useGameStore.getState().clearParentPin();
    expect(meta().path!.slots.map((s) => s.gameId)).toEqual(unfocused);
    expect(unfocused).not.toEqual(focused);
  });

  it('counts a round started before midnight for its own day', () => {
    const evening = new Date(2026, 10, 28, 23, 58).getTime();
    const path = useGameStore.getState().ensureTodayPath(evening);
    const game = path.slots[0]!.gameId;
    const after = evening + 5 * 60_000;
    expect(useGameStore.getState().completePathSlot(0, game, evening, after)).not.toBeNull();
    expect(meta().path!.slots[0]!.stickerId).not.toBeNull();
  });
});

describe('the parent PIN', () => {
  it('keeps a salted hash and checks the digits against it', async () => {
    const a = await createPin('2580');
    const b = await createPin('2580');
    expect(a.hash).not.toContain('2580');
    expect(a.salt).not.toBe(b.salt);
    expect(await checkPin(a, '2580')).toBe(true);
    expect(await checkPin(a, '2581')).toBe(false);
    expect(await checkPin(a, '25800')).toBe(false);
  });
});

describe('gameStore migration v11 -> v12', () => {
  it('starts each learner with an empty path, streak, album and focus', () => {
    const mia = learnerNamed('mia');
    const { meta: v11Meta } = mia;
    const old = {
      stars: v11Meta.stars,
      stats: v11Meta.stats,
      achievements: ['first_game'],
      highScores: {},
      ownedThemeIds: [],
    };
    const state = migrateGameStoreState(
      {
        learners: [{ ...mia, meta: old }],
        activeLearnerId: mia.id,
        activeLearnerProfile: { ...mia, meta: old },
      },
      11,
    ) as { activeLearnerProfile: { meta: Record<string, unknown> }; parentPin: unknown };
    expect(state.activeLearnerProfile.meta).toMatchObject({
      achievements: ['first_game'],
      path: null,
      streak: { days: 0, lastDay: null },
      album: [],
      focus: null,
    });
    expect(state.parentPin).toBeNull();
  });

  it('keeps a stored PIN and drops a malformed one', () => {
    const mia = learnerNamed('mia');
    const base = { learners: [mia], activeLearnerId: mia.id, activeLearnerProfile: mia };
    const kept = migrateGameStoreState({ ...base, parentPin: { salt: 'aa', hash: 'bb' } }, 12) as {
      parentPin: unknown;
    };
    expect(kept.parentPin).toEqual({ salt: 'aa', hash: 'bb' });
    const dropped = migrateGameStoreState({ ...base, parentPin: '1234' }, 12) as {
      parentPin: unknown;
    };
    expect(dropped.parentPin).toBeNull();
  });
});
