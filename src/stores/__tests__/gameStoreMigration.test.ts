import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createStats } from '../../engine/stats';
import { APP_KEY } from '../../games/data';
import { LANGUAGE_VOCABULARY_SKILL } from '../../curriculum/skills/language';
import {
  MATH_GEOMETRY_SHAPES_SPATIAL_SKILL,
  MATH_GEOMETRY_SHAPES_VERBAL_SKILL,
} from '../../curriculum/skills/math';

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

    expect(state.stars).toBe(14);
    expect(state.stats.collectedStars).toBe(14);
    expect(state.hearts).toBe(5);
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

    expect(useGameStore.getState().stars).toBe(8);
    expect(useGameStore.getState().hearts).toBe(3);
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

    expect(useGameStore.getState().stars).toBe(4);
    expect(useGameStore.getState().stats.collectedStars).toBe(18);
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

    expect(useGameStore.getState().stars).toBe(50);
    expect(useGameStore.getState().stats.collectedStars).toBe(0);
  });
});
