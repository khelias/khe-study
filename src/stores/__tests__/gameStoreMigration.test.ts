import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createStats } from '../../engine/stats';
import { APP_KEY } from '../../games/data';
import { LANGUAGE_VOCABULARY_SKILL } from '../../curriculum/skills/language';
import {
  MATH_GEOMETRY_SHAPES_SPATIAL_SKILL,
  MATH_GEOMETRY_SHAPES_VERBAL_SKILL,
} from '../../curriculum/skills/math';
import { createLearnerMeta } from '../../meta/learnerMeta';

describe('gameStore persist migration', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  it('declares an explicit persist version', async () => {
    const { GAME_STORE_VERSION, useGameStore } = await import('../gameStore');

    expect(useGameStore.persist.getOptions().version).toBe(GAME_STORE_VERSION);
  });

  it('migrates legacy serialized payloads during hydration', async () => {
    localStorage.setItem(
      APP_KEY,
      JSON.stringify({
        state: {
          profile: 'starter',
          levels: {
            starter: {
              word_builder: 6,
              word_cascade: 3,
              shape_dash: 2,
              shape_shift: 5,
            },
            advanced: {
              word_builder: 9,
            },
          },
          stats: {
            ...createStats(),
            collectedStars: 2,
          },
          collectedStars: 14,
          hearts: 9,
          featuredGameIds: ['battlelearn', 'word_cascade', 42],
        },
        version: 0,
      }),
    );

    const { GAME_STORE_VERSION, useGameStore } = await import('../gameStore');
    await useGameStore.persist.rehydrate();
    const state = useGameStore.getState();

    expect(state.activeLearnerProfile.meta.stars).toBe(14);
    expect(state.activeLearnerProfile.meta.stats.collectedStars).toBe(14);
    expect('hearts' in state).toBe(false);
    expect(state.favouriteGameIds).toEqual(['battlelearn', 'word_cascade']);
    expect(state.playedContentByPack).toEqual({});
    // Legacy `levels` (v4 nested + v5 flat) is folded into the learner's
    // skill mastery so v6 keeps the highest level reached, then dropped from
    // the persisted state.
    expect('levels' in state).toBe(false);
    expect(state.activeLearnerProfile.persona).toBe('kid');
    expect(state.activeLearnerProfile.displayName).toBe('Learner');
    expect(state.activeLearnerProfile.skillMastery[LANGUAGE_VOCABULARY_SKILL.id]?.level).toBe(9);
    expect(
      state.activeLearnerProfile.skillMastery[MATH_GEOMETRY_SHAPES_SPATIAL_SKILL.id]?.level,
    ).toBe(5);
    expect(
      state.activeLearnerProfile.skillMastery[MATH_GEOMETRY_SHAPES_VERBAL_SKILL.id]?.level,
    ).toBe(2);
    // v6 → v7 (Phase 5a): mechanic difficulty seeded from highest skill level
    // among games sharing that mechanic. word_builder and word_cascade share
    // LANGUAGE_VOCABULARY_SKILL (level 9 after starter+advanced merge), but
    // each is its own mechanic id, so each gets difficulty 9 individually.
    expect(state.activeLearnerProfile.mechanicPreference.word_builder?.difficulty).toBe(9);
    expect(state.activeLearnerProfile.mechanicPreference.word_cascade?.difficulty).toBe(9);
    expect(state.activeLearnerProfile.mechanicPreference.shape_shift?.difficulty).toBe(5);
    expect(state.activeLearnerProfile.mechanicPreference.shape_dash?.difficulty).toBe(2);

    const persisted = JSON.parse(localStorage.getItem(APP_KEY) ?? '{}') as { version?: number };
    expect(persisted.version).toBe(GAME_STORE_VERSION);
  });

  it('seeds mechanicPreference from the highest skill level across games sharing a mechanic', async () => {
    // All three snake bindings share mechanic `math_snake`. The migration must
    // keep the highest level reached on any of them so an existing user does
    // not restart from level 1 on the new TASE axis.
    localStorage.setItem(
      APP_KEY,
      JSON.stringify({
        state: {
          levels: {
            starter: {
              addition_snake: 4,
              subtraction_snake: 7,
              multiplication_snake: 2,
            },
          },
          stats: createStats(),
          hearts: 3,
        },
        version: 5,
      }),
    );

    const { useGameStore } = await import('../gameStore');
    await useGameStore.persist.rehydrate();
    const state = useGameStore.getState();

    // math_snake mechanic should pick up the max (7) across all three snake
    // bindings, even though each binding maps to its own skill.
    expect(state.activeLearnerProfile.mechanicPreference.math_snake?.difficulty).toBe(7);
  });

  it('exposes mechanic difficulty via getLevelForGame for snake mechanic', async () => {
    localStorage.setItem(
      APP_KEY,
      JSON.stringify({
        state: {
          levels: { starter: { addition_snake: 5 } },
          stats: createStats(),
          hearts: 3,
        },
        version: 5,
      }),
    );

    const { useGameStore } = await import('../gameStore');
    await useGameStore.persist.rehydrate();
    // All snake bindings share mechanic `math_snake`, so the mechanic
    // difficulty drives the level for every snake binding (not just the one
    // that was levelled up).
    expect(useGameStore.getState().getLevelForGame('subtraction_snake')).toBe(5);
    expect(useGameStore.getState().getLevelForGame('multiplication_snake')).toBe(5);
  });

  it('migrates a v9 store with hearts and levels: hearts go, levels become reached levels', async () => {
    const { createLearnerProfileFromLegacyProgress } = await import('../../learner');
    const base = createLearnerProfileFromLegacyProgress({
      displayName: 'A',
      legacyProfileId: '__active__',
      levelsByProfile: { __active__: {} },
      locale: 'et',
      now: 0,
    });
    const active = {
      ...base,
      id: 'a',
      mechanicPreference: {
        math_snake: { mechanicId: 'math_snake', difficulty: 4, lastUpdatedAt: 0 },
      },
    };
    const sibling = {
      ...base,
      id: 'b',
      displayName: 'B',
      mechanicPreference: {
        word_builder: { mechanicId: 'word_builder', difficulty: 2, lastUpdatedAt: 0 },
      },
    };
    localStorage.setItem(
      APP_KEY,
      JSON.stringify({
        state: {
          hearts: 2,
          stars: 7,
          learners: [active, sibling],
          activeLearnerId: 'a',
          activeLearnerProfile: active,
        },
        version: 9,
      }),
    );

    const { useGameStore } = await import('../gameStore');
    await useGameStore.persist.rehydrate();
    const state = useGameStore.getState();

    expect('hearts' in state).toBe(false);
    expect(state.activeLearnerProfile.meta.stars).toBe(7);
    expect(state.activeLearnerProfile.mechanicPreference.math_snake).toMatchObject({
      difficulty: 4,
      highestLevel: 4,
      roundsReached: 0,
    });
    expect(state.getLevelForGame('addition_snake')).toBe(4);
    expect(state.getLevelProgress('addition_snake').highestLevel).toBe(4);
    const b = state.learners.find((l) => l.id === 'b');
    expect(b?.mechanicPreference.word_builder).toMatchObject({ highestLevel: 2, roundsReached: 0 });
    expect(JSON.parse(localStorage.getItem(APP_KEY) ?? '{}').state.hearts).toBeUndefined();
  });

  it('migrates v8 state with no theme ownership', async () => {
    localStorage.setItem(APP_KEY, JSON.stringify({ state: { stars: 12 }, version: 8 }));

    const { useGameStore } = await import('../gameStore');
    await useGameStore.persist.rehydrate();

    expect(useGameStore.getState().activeLearnerProfile.meta.ownedThemeIds).toEqual([]);
    expect(useGameStore.getState().activeLearnerProfile.meta.stars).toBe(12);
  });

  it('keeps string theme ids, including unknown ones, and drops the rest', async () => {
    localStorage.setItem(
      APP_KEY,
      JSON.stringify({ state: { ownedThemeIds: ['sea', 7, 'retired', 'sea'] }, version: 8 }),
    );

    const { useGameStore } = await import('../gameStore');
    await useGameStore.persist.rehydrate();

    expect(useGameStore.getState().activeLearnerProfile.meta.ownedThemeIds).toEqual([
      'sea',
      'retired',
    ]);
  });

  it('migrates stars from legacy stats when top-level stars are missing', async () => {
    localStorage.setItem(
      APP_KEY,
      JSON.stringify({
        state: {
          stats: {
            ...createStats(),
            collectedStars: 8,
          },
        },
        version: 0,
      }),
    );

    const { useGameStore } = await import('../gameStore');
    await useGameStore.persist.rehydrate();

    expect(useGameStore.getState().activeLearnerProfile.meta.stars).toBe(8);
  });

  it('preserves lifetime earned stars separately from spendable balance', async () => {
    localStorage.setItem(
      APP_KEY,
      JSON.stringify({
        state: {
          stars: 4,
          stats: {
            ...createStats(),
            collectedStars: 18,
          },
        },
        version: 2,
      }),
    );

    const { useGameStore } = await import('../gameStore');
    await useGameStore.persist.rehydrate();

    expect(useGameStore.getState().activeLearnerProfile.meta.stars).toBe(4);
    expect(useGameStore.getState().activeLearnerProfile.meta.stats.collectedStars).toBe(18);
  });

  it('does not treat legacy spendable-only star balance as lifetime earned stars', async () => {
    localStorage.setItem(
      APP_KEY,
      JSON.stringify({
        state: {
          stars: 50,
          stats: {
            ...createStats(),
            collectedStars: 0,
          },
        },
        version: 2,
      }),
    );

    const { useGameStore } = await import('../gameStore');
    await useGameStore.persist.rehydrate();

    expect(useGameStore.getState().activeLearnerProfile.meta.stars).toBe(50);
    expect(useGameStore.getState().activeLearnerProfile.meta.stats.collectedStars).toBe(0);
  });

  describe('v10 -> v11: rewards move to the learner', () => {
    const deviceRewards = {
      stars: 23,
      score: 900,
      stats: { ...createStats(), gamesPlayed: 4, collectedStars: 31 },
      unlockedAchievements: ['first_game'],
      highScores: { word_builder: 120 },
      ownedThemeIds: ['sea'],
      soundEnabled: false,
      hasSeenTutorial: true,
      favouriteGameIds: ['word_builder'],
      playedContentByPack: { pack: ['x'] },
    };

    async function learnerPair() {
      const { createLearnerProfileFromLegacyProgress } = await import('../../learner');
      const make = (id: string, theme?: string) => {
        const { meta: _meta, ...v10 } = createLearnerProfileFromLegacyProgress({
          id,
          displayName: id.toUpperCase(),
          legacyProfileId: '__active__',
          levelsByProfile: { __active__: {} },
          locale: 'et',
          now: 0,
        });
        return { ...v10, preferences: { locale: 'et', theme } };
      };
      return { a: make('a', 'sea'), b: make('b', 'space') };
    }

    async function hydrate(state: Record<string, unknown>) {
      localStorage.setItem(APP_KEY, JSON.stringify({ state, version: 10 }));
      const { useGameStore } = await import('../gameStore');
      await useGameStore.persist.rehydrate();
      return useGameStore;
    }

    it('gives one learner the device rewards and drops the device fields', async () => {
      const { a } = await learnerPair();
      const store = await hydrate({
        ...deviceRewards,
        learners: [a],
        activeLearnerId: 'a',
        activeLearnerProfile: a,
      });
      const state = store.getState();

      expect(state.activeLearnerProfile.meta).toEqual({
        ...createLearnerMeta(),
        stars: 23,
        stats: deviceRewards.stats,
        achievements: ['first_game'],
        highScores: { word_builder: 120 },
        ownedThemeIds: ['sea'],
      });
      expect(state.learners[0]?.meta).toEqual(state.activeLearnerProfile.meta);
      expect(state.soundEnabled).toBe(false);
      expect(state.hasSeenTutorial).toBe(true);
      expect(state.favouriteGameIds).toEqual(['word_builder']);
      expect(state.playedContentByPack).toEqual({ pack: ['x'] });
      expect(state.demoStarsEnabled).toBe(false);
      const stored = JSON.parse(localStorage.getItem(APP_KEY) ?? '{}').state;
      for (const field of ['stars', 'score', 'stats', 'unlockedAchievements', 'highScores']) {
        expect(stored[field]).toBeUndefined();
      }
      expect(stored.ownedThemeIds).toBeUndefined();
    });

    it('gives the active one of two learners the rewards; the other keeps only its shown theme', async () => {
      const { a, b } = await learnerPair();
      const store = await hydrate({
        ...deviceRewards,
        learners: [a, b],
        activeLearnerId: 'b',
        activeLearnerProfile: b,
      });
      const state = store.getState();

      expect(state.activeLearnerProfile.id).toBe('b');
      expect(state.activeLearnerProfile.meta.stars).toBe(23);
      const other = state.learners.find((l) => l.id === 'a');
      expect(other?.meta).toEqual({
        ...createLearnerMeta(),
        stars: 0,
        stats: createStats(),
        achievements: [],
        highScores: {},
        ownedThemeIds: ['sea'],
      });
    });

    it('gives a store without learners one learner holding the rewards', async () => {
      const store = await hydrate({ ...deviceRewards });
      const state = store.getState();

      expect(state.learners).toHaveLength(1);
      expect(state.learners[0]?.id).toBe(state.activeLearnerId);
      expect(state.activeLearnerProfile.meta.stars).toBe(23);
      expect(state.activeLearnerProfile.meta.ownedThemeIds).toEqual(['sea']);
    });

    it('a second learner keeps a theme it shows that the device owned', async () => {
      const { a, b } = await learnerPair();
      const shown = { ...b, preferences: { locale: 'et', theme: 'sea' } };
      const store = await hydrate({
        ...deviceRewards,
        learners: [a, shown],
        activeLearnerId: 'a',
        activeLearnerProfile: a,
      });

      const sibling = store.getState().learners.find((l) => l.id === 'b');
      expect(sibling?.meta.ownedThemeIds).toEqual(['sea']);
      expect(sibling?.meta.stars).toBe(0);
    });

    it('joins a learner meta written back by an older build with the device values', async () => {
      const { a } = await learnerPair();
      const kept = {
        ...a,
        meta: {
          stars: 200,
          stats: { ...createStats(), gamesPlayed: 9 },
          achievements: ['streak_5'],
          highScores: { word_builder: 300 },
          ownedThemeIds: ['space'],
        },
      };
      const store = await hydrate({
        ...deviceRewards,
        learners: [kept],
        activeLearnerId: 'a',
        activeLearnerProfile: kept,
      });

      expect(store.getState().activeLearnerProfile.meta).toEqual({
        ...createLearnerMeta(),
        stars: 223,
        stats: { ...createStats(), gamesPlayed: 9 },
        achievements: ['streak_5', 'first_game'],
        highScores: { word_builder: 300 },
        ownedThemeIds: ['space', 'sea'],
      });
    });

    it('a second learner showing a theme it does not own falls back to the default', async () => {
      const { a, b } = await learnerPair();
      const store = await hydrate({
        ...deviceRewards,
        learners: [a, b],
        activeLearnerId: 'a',
        activeLearnerProfile: a,
      });
      const { renderHook } = await import('@testing-library/react');
      const { useAppliedTheme } = await import('../../features/theme/useAppliedTheme');
      const { getDefaultTheme } = await import('../../meta/themeCatalog');

      expect(renderHook(() => useAppliedTheme()).result.current.id).toBe('sea');
      store.getState().setActiveLearner('b');
      expect(store.getState().activeLearnerProfile.preferences.theme).toBe('space');
      expect(renderHook(() => useAppliedTheme()).result.current.id).toBe(getDefaultTheme().id);
    });
  });
});
