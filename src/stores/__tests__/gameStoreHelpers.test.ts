import { describe, expect, it } from 'vitest';
import { createStats } from '../../engine/stats';
import {
  applyMechanicLevelToLearner,
  commitActiveLearner,
  createActiveLearnerProfile,
  readMechanicLevelProgress,
  unlockAchievementsFor,
  withAppliedTheme,
} from '../gameStoreHelpers';

describe('gameStoreHelpers', () => {
  it('commits active learner updates in lockstep with the learners list', () => {
    const first = createActiveLearnerProfile('A');
    const second = createActiveLearnerProfile('B');
    const updated = { ...first, displayName: 'A2' };

    const result = commitActiveLearner(
      { learners: [first, second], activeLearnerId: first.id },
      updated,
    );

    expect(result.activeLearnerProfile).toBe(updated);
    expect(result.learners).toEqual([updated, second]);
  });

  it('fills default preferences when applying a theme to a learner missing preferences', () => {
    const base = createActiveLearnerProfile('A');
    const withoutPrefs = { ...base, preferences: undefined as unknown as typeof base.preferences };

    const themed = withAppliedTheme(withoutPrefs, 'forest', 1234);

    expect(themed.preferences).toEqual({ locale: 'et', theme: 'forest' });
    expect(themed.updatedAt).toBe(1234);
  });

  it('reads mechanic level progress with pre-v10 fallbacks', () => {
    expect(readMechanicLevelProgress(undefined)).toEqual({ highestLevel: 1, roundsReached: 0 });
    expect(
      readMechanicLevelProgress({ mechanicId: 'math_snake', difficulty: 4, lastUpdatedAt: 0 }),
    ).toEqual({ highestLevel: 4, roundsReached: 0 });
    expect(
      readMechanicLevelProgress({
        mechanicId: 'math_snake',
        difficulty: 2,
        highestLevel: 5,
        roundsReached: 2,
        lastUpdatedAt: 0,
      }),
    ).toEqual({ highestLevel: 5, roundsReached: 2 });
  });

  it('returns the same learner reference when mechanic level is unchanged and resets rounds on new high', () => {
    const base = createActiveLearnerProfile('A');
    const seeded = applyMechanicLevelToLearner(base, 'math_snake', 3, 100);
    expect(seeded.mechanicPreference.math_snake).toMatchObject({
      difficulty: 3,
      highestLevel: 3,
      roundsReached: 0,
    });

    const unchanged = applyMechanicLevelToLearner(seeded, 'math_snake', 3, 200);
    expect(unchanged).toBe(seeded);

    const withRounds = {
      ...seeded,
      mechanicPreference: {
        ...seeded.mechanicPreference,
        math_snake: { ...seeded.mechanicPreference.math_snake!, roundsReached: 2 },
      },
    };
    const lowered = applyMechanicLevelToLearner(withRounds, 'math_snake', 2, 300);
    expect(lowered.mechanicPreference.math_snake).toMatchObject({
      difficulty: 2,
      highestLevel: 3,
      roundsReached: 2,
    });

    const raised = applyMechanicLevelToLearner(withRounds, 'math_snake', 4, 400);
    expect(raised.mechanicPreference.math_snake).toMatchObject({
      difficulty: 4,
      highestLevel: 4,
      roundsReached: 0,
    });
  });

  it('returns empty achievement data and original array when nothing new unlocks', () => {
    const unlocked = ['first_answer'];
    const result = unlockAchievementsFor(createStats(), unlocked);

    expect(result.achievementData).toEqual([]);
    expect(result.unlockedAchievements).toBe(unlocked);
  });
});
