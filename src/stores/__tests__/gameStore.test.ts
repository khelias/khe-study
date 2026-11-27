import { describe, it, expect, beforeEach, vi } from 'vitest';
import { STAR_PURCHASE_AMOUNT, useGameStore } from '../gameStore';
import { APP_KEY } from '../../games/data';
import type { LearnerProfile } from '../../learner/types';
import { MATH_ADDITION_WITHIN_20_SKILL } from '../../curriculum/skills/math';
import { LANGUAGE_VOCABULARY_SKILL } from '../../curriculum/skills/language';
import { createLearnerProfileFromLegacyProgress } from '../../learner';

describe('gameStore', () => {
  beforeEach(() => {
    const learner = createLearnerProfileFromLegacyProgress({
      id: 'test-learner',
      displayName: 'Test learner',
      legacyProfileId: '__active__',
      levelsByProfile: { __active__: {} },
      locale: 'et',
      now: 0,
    });
    // Reset store to initial state
    useGameStore.setState({
      learners: [learner],
      activeLearnerId: learner.id,
      activeLearnerProfile: learner,
      stats: {
        gamesPlayed: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        totalScore: 0,
        maxStreak: 0,
        currentStreak: 0,
        maxLevels: {},
        gamesByType: {},
        totalTimePlayed: 0,
        lastPlayed: null,
        collectedStars: 0,
        maxSnakeLength: 0,
      },
      unlockedAchievements: [],
      soundEnabled: true,
      score: 0,
      stars: 0,
      hasSeenTutorial: false,
      ownedThemeIds: [],
    });
  });

  describe('Answer Recording', () => {
    it('should record correct answer', () => {
      const { recordAnswer } = useGameStore.getState();
      recordAnswer(true, 10);

      const state = useGameStore.getState();
      expect(state.stats.correctAnswers).toBe(1);
      expect(state.stats.wrongAnswers).toBe(0);
      expect(state.stats.totalScore).toBe(10);
      expect(state.stats.maxStreak).toBe(1);
    });

    it('should record wrong answer', () => {
      const { recordAnswer } = useGameStore.getState();
      recordAnswer(false);

      const state = useGameStore.getState();
      expect(state.stats.correctAnswers).toBe(0);
      expect(state.stats.wrongAnswers).toBe(1);
      expect(state.stats.currentStreak).toBe(0);
    });

    it('should track streak correctly', () => {
      const { recordAnswer } = useGameStore.getState();

      recordAnswer(true, 10);
      recordAnswer(true, 10);
      recordAnswer(true, 10);

      const state = useGameStore.getState();
      expect(state.stats.maxStreak).toBe(3);
      expect(state.stats.currentStreak).toBe(3);
    });

    it('should reset streak on wrong answer', () => {
      const { recordAnswer } = useGameStore.getState();

      recordAnswer(true, 10);
      recordAnswer(true, 10);
      recordAnswer(false);

      const state = useGameStore.getState();
      expect(state.stats.maxStreak).toBe(2);
      expect(state.stats.currentStreak).toBe(0);
    });
  });

  describe('Skill Attempt Recording', () => {
    it('accumulates rolling stats into the active learner profile', () => {
      const { recordSkillAttempt } = useGameStore.getState();

      recordSkillAttempt('word_cascade', true, 1000);
      recordSkillAttempt('word_cascade', false, 2000);

      const mastery =
        useGameStore.getState().activeLearnerProfile.skillMastery[LANGUAGE_VOCABULARY_SKILL.id];
      expect(mastery?.rollingStats.attempts).toBe(2);
      expect(mastery?.rollingStats.correct).toBe(1);
      expect(mastery?.rollingStats.avgResponseMs).toBe(1500);
    });

    it('does not change learner state when gameType has no skill mapping', () => {
      const before = useGameStore.getState().activeLearnerProfile;
      useGameStore.getState().recordSkillAttempt('not_a_real_game', true, 500);
      expect(useGameStore.getState().activeLearnerProfile).toBe(before);
    });
  });

  describe('Level Management', () => {
    const reachRounds = (gameType: string, level: number, count: number) => {
      for (let i = 0; i < count; i++) {
        useGameStore.getState().recordRoundResult(gameType, level, true);
      }
    };

    it('the third round that reaches its goal raises the mechanic level (not skill mastery)', () => {
      reachRounds('word_builder', 1, 2);
      expect(useGameStore.getState().getLevelForGame('word_builder')).toBe(1);

      const record = useGameStore.getState().recordRoundResult('word_builder', 1, true);

      const state = useGameStore.getState();
      expect(record.leveledUp).toBe(true);
      expect(state.activeLearnerProfile.mechanicPreference.word_builder).toMatchObject({
        difficulty: 2,
        highestLevel: 2,
        roundsReached: 0,
      });
      expect(state.getLevelForGame('word_builder')).toBe(2);
      // Stats still track max level per gameType for achievements.
      expect(state.stats.maxLevels['word_builder']).toBe(2);
      expect(
        state.activeLearnerProfile.skillMastery[LANGUAGE_VOCABULARY_SKILL.id]?.level ?? null,
      ).toBeNull();
    });

    it('a lost round does not count toward the next level', () => {
      reachRounds('word_builder', 1, 2);
      const record = useGameStore.getState().recordRoundResult('word_builder', 1, false);
      expect(record).toMatchObject({ counted: false, leveledUp: false, roundsReached: 2 });
      expect(useGameStore.getState().getLevelProgress('word_builder').roundsReached).toBe(2);
    });

    it('keeps two of three rounds after leaving the game', () => {
      reachRounds('word_builder', 1, 2);
      // Leaving ends the play session; the progress lives in the persisted learner.
      const persisted = JSON.parse(localStorage.getItem(APP_KEY) ?? '{}') as {
        state?: { activeLearnerProfile?: LearnerProfile };
      };
      expect(
        persisted.state?.activeLearnerProfile?.mechanicPreference.word_builder?.roundsReached,
      ).toBe(2);
      expect(useGameStore.getState().getLevelProgress('word_builder')).toEqual({
        level: 1,
        highestLevel: 1,
        roundsReached: 2,
      });
    });

    it('a round below the highest level counts nothing', () => {
      useGameStore.getState().recordMechanicLevelUp('word_builder', 3);
      useGameStore.getState().setLevel('word_builder', 1);

      const record = useGameStore.getState().recordRoundResult('word_builder', 1, true);

      expect(record.counted).toBe(false);
      expect(useGameStore.getState().getLevelProgress('word_builder')).toEqual({
        level: 1,
        highestLevel: 3,
        roundsReached: 0,
      });
    });

    it('should track max level correctly', () => {
      reachRounds('word_builder', 1, 3);
      reachRounds('word_builder', 2, 3);
      useGameStore.getState().setLevel('word_builder', 1);

      expect(useGameStore.getState().stats.maxLevels['word_builder']).toBe(3);
    });

    it('Phase 5b: levelling up a snake binding shares the level with siblings via mechanic preference', () => {
      const { getLevelForGame } = useGameStore.getState();

      // All snake bindings share mechanic `math_snake`, so levelling up
      // Liitmisuss bumps the TASE on Lahutususs and Korrutususs too.
      reachRounds('addition_snake', 1, 3);

      expect(
        useGameStore.getState().activeLearnerProfile.mechanicPreference.math_snake?.difficulty,
      ).toBe(2);
      expect(getLevelForGame('subtraction_snake')).toBe(2);
      expect(getLevelForGame('multiplication_snake')).toBe(2);
    });

    it('recordMechanicLevelUp writes the mechanic axis directly', () => {
      const { recordMechanicLevelUp } = useGameStore.getState();

      recordMechanicLevelUp('math_snake', 6);

      const learner = useGameStore.getState().activeLearnerProfile;
      expect(learner.mechanicPreference.math_snake?.difficulty).toBe(6);
      expect(learner.skillMastery[MATH_ADDITION_WITHIN_20_SKILL.id]?.level ?? null).toBeNull();
    });

    it('Phase 5f: setLevel writes mechanic preference only', () => {
      const { setLevel, getLevelForGame } = useGameStore.getState();
      useGameStore.getState().recordMechanicLevelUp('math_snake', 9);

      setLevel('addition_snake', 8);

      const learner = useGameStore.getState().activeLearnerProfile;
      expect(learner.mechanicPreference.math_snake?.difficulty).toBe(8);
      expect(learner.mechanicPreference.math_snake?.highestLevel).toBe(9);
      expect(getLevelForGame('subtraction_snake')).toBe(8);
      // Skill mastery untouched.
      expect(learner.skillMastery[MATH_ADDITION_WITHIN_20_SKILL.id]?.level ?? null).toBeNull();
    });

    it('setLevel refuses a level above the highest reached', () => {
      useGameStore.getState().setLevel('word_builder', 4);
      expect(useGameStore.getState().getLevelForGame('word_builder')).toBe(1);
    });

    it('Phase 5f: getLevelForGame returns 1 for cold-start learner', () => {
      const { getLevelForGame } = useGameStore.getState();
      expect(getLevelForGame('addition_snake')).toBe(1);
      expect(getLevelForGame('word_builder')).toBe(1);
    });
  });

  describe('setMechanicVariant (Phase 5d)', () => {
    it('writes variant to mechanicPreference', () => {
      const { setMechanicVariant } = useGameStore.getState();

      setMechanicVariant('picture_pairs', 'emoji_word');

      const pref = useGameStore.getState().activeLearnerProfile.mechanicPreference.picture_pairs;
      expect(pref?.variant).toBe('emoji_word');
      expect(pref?.mechanicId).toBe('picture_pairs');
    });

    it('clears variant when set to null', () => {
      const { setMechanicVariant } = useGameStore.getState();

      setMechanicVariant('picture_pairs', 'emoji_only');
      setMechanicVariant('picture_pairs', null);

      const pref = useGameStore.getState().activeLearnerProfile.mechanicPreference.picture_pairs;
      expect(pref?.variant).toBeUndefined();
    });
  });

  describe('Multi-learner support (Phase 6)', () => {
    it('starts with the seeded learner active and in the list', () => {
      const state = useGameStore.getState();
      expect(state.learners).toHaveLength(1);
      expect(state.activeLearnerId).toBe(state.activeLearnerProfile.id);
      expect(state.learners[0]?.id).toBe(state.activeLearnerId);
    });

    it('addLearner appends without changing the active one', () => {
      const before = useGameStore.getState().activeLearnerId;
      const id = useGameStore.getState().addLearner({ displayName: 'Sibling', ageHint: 6 });

      const state = useGameStore.getState();
      expect(state.learners).toHaveLength(2);
      expect(state.activeLearnerId).toBe(before);
      expect(state.learners.some((l) => l.id === id && l.displayName === 'Sibling')).toBe(true);
    });

    it('setActiveLearner switches the active learner', () => {
      const newId = useGameStore.getState().addLearner({ displayName: 'Sibling' });
      useGameStore.getState().setActiveLearner(newId);

      const state = useGameStore.getState();
      expect(state.activeLearnerId).toBe(newId);
      expect(state.activeLearnerProfile.id).toBe(newId);
      expect(state.activeLearnerProfile.displayName).toBe('Sibling');
    });

    it('setActiveLearner is a no-op for unknown ids', () => {
      const before = useGameStore.getState().activeLearnerId;
      useGameStore.getState().setActiveLearner('does-not-exist');
      expect(useGameStore.getState().activeLearnerId).toBe(before);
    });

    it('removeLearner falls back to the first remaining when the active one goes', () => {
      const id = useGameStore.getState().addLearner({ displayName: 'Sibling' });
      useGameStore.getState().setActiveLearner(id);
      useGameStore.getState().removeLearner(id);

      const state = useGameStore.getState();
      expect(state.learners).toHaveLength(1);
      expect(state.activeLearnerId).toBe(state.learners[0]!.id);
    });

    it('removeLearner refuses to delete the last learner', () => {
      const id = useGameStore.getState().activeLearnerId;
      useGameStore.getState().removeLearner(id);
      expect(useGameStore.getState().learners).toHaveLength(1);
    });

    it('per-learner mechanic preference is isolated', () => {
      const newId = useGameStore.getState().addLearner({ displayName: 'Sibling' });
      // Learner A levels up the snake mechanic.
      useGameStore.getState().recordMechanicLevelUp('math_snake', 5);
      // Switch to learner B and check their mechanic preference is empty.
      useGameStore.getState().setActiveLearner(newId);
      expect(
        useGameStore.getState().activeLearnerProfile.mechanicPreference.math_snake?.difficulty ??
          null,
      ).toBeNull();
      // Switch back, check the original still has level 5.
      const all = useGameStore.getState().learners;
      const original = all.find((l) => l.id !== newId)!;
      useGameStore.getState().setActiveLearner(original.id);
      expect(
        useGameStore.getState().activeLearnerProfile.mechanicPreference.math_snake?.difficulty,
      ).toBe(5);
    });
  });

  describe('Themes', () => {
    it('buyTheme debits stars, grants the theme and applies it', () => {
      useGameStore.setState({ stars: 45 });
      expect(useGameStore.getState().buyTheme('sea')).toBe(true);

      const state = useGameStore.getState();
      expect(state.stars).toBe(15);
      expect(state.ownedThemeIds).toEqual(['sea']);
      expect(state.activeLearnerProfile.preferences.theme).toBe('sea');
      expect(state.learners[0]?.preferences.theme).toBe('sea');
    });

    it('buyTheme leaves state untouched without enough stars', () => {
      useGameStore.setState({ stars: 29 });
      const before = useGameStore.getState();
      expect(before.buyTheme('sea')).toBe(false);

      const after = useGameStore.getState();
      expect(after.stars).toBe(29);
      expect(after.ownedThemeIds).toBe(before.ownedThemeIds);
      expect(after.activeLearnerProfile).toBe(before.activeLearnerProfile);
    });

    it('buyTheme refuses a theme already owned', () => {
      useGameStore.setState({ stars: 100, ownedThemeIds: ['sea'] });
      expect(useGameStore.getState().buyTheme('sea')).toBe(false);
      expect(useGameStore.getState().stars).toBe(100);
    });

    it('applyTheme refuses a theme that is not owned', () => {
      expect(useGameStore.getState().applyTheme('space')).toBe(false);
      expect(useGameStore.getState().activeLearnerProfile.preferences.theme).toBeUndefined();
    });

    it('applyTheme switches between owned themes and back to the default', () => {
      useGameStore.setState({ ownedThemeIds: ['sea', 'space'] });
      const { applyTheme } = useGameStore.getState();
      expect(applyTheme('space')).toBe(true);
      expect(useGameStore.getState().activeLearnerProfile.preferences.theme).toBe('space');
      expect(applyTheme('classic')).toBe(true);
      expect(useGameStore.getState().activeLearnerProfile.preferences.theme).toBe('classic');
      expect(useGameStore.getState().activeLearnerProfile.updatedAt).toBeGreaterThan(0);
    });

    it('applyTheme fills in preferences missing from a persisted learner', () => {
      const learner = useGameStore.getState().activeLearnerProfile;
      const bare = { ...learner, preferences: undefined } as unknown as typeof learner;
      useGameStore.setState({ learners: [bare], activeLearnerProfile: bare });
      expect(useGameStore.getState().applyTheme('classic')).toBe(true);
      expect(useGameStore.getState().activeLearnerProfile.preferences).toEqual({
        locale: 'et',
        theme: 'classic',
      });
    });

    it('the applied theme follows the active learner', () => {
      useGameStore.setState({ stars: 30 });
      const firstId = useGameStore.getState().activeLearnerId;
      useGameStore.getState().buyTheme('sea');
      const siblingId = useGameStore.getState().addLearner({ displayName: 'Sibling' });

      useGameStore.getState().setActiveLearner(siblingId);
      expect(useGameStore.getState().activeLearnerProfile.preferences.theme).toBeUndefined();
      // Ownership is device-scoped, so the sibling can apply it too.
      expect(useGameStore.getState().applyTheme('sea')).toBe(true);

      useGameStore.getState().setActiveLearner(firstId);
      expect(useGameStore.getState().activeLearnerProfile.preferences.theme).toBe('sea');
    });

    it('resetGame clears theme ownership', () => {
      vi.stubGlobal('confirm', () => true);
      useGameStore.setState({ ownedThemeIds: ['sea'] });
      useGameStore.getState().resetGame();
      expect(useGameStore.getState().ownedThemeIds).toEqual([]);
      vi.unstubAllGlobals();
    });
  });

  describe('Stars (Spendable Balance + Lifetime Earnings)', () => {
    beforeEach(() => {
      // Reset stars to 0 for each test
      const { spendStars } = useGameStore.getState();
      const currentStars = useGameStore.getState().stars;
      if (currentStars > 0) {
        spendStars(currentStars); // Reset to 0
      }
    });

    it('should earn stars', () => {
      const { earnStars } = useGameStore.getState();
      earnStars(5);

      const state = useGameStore.getState();
      expect(state.stars).toBe(5);
      expect(state.stats.collectedStars).toBe(5);
    });

    it('should accumulate stars', () => {
      const { earnStars } = useGameStore.getState();
      earnStars(3);
      earnStars(2);

      const state = useGameStore.getState();
      expect(state.stars).toBe(5);
    });

    it('should spend stars', () => {
      const { earnStars, spendStars } = useGameStore.getState();
      earnStars(10);

      const success = spendStars(3);
      expect(success).toBe(true);

      const state = useGameStore.getState();
      expect(state.stars).toBe(7);
      expect(state.stats.collectedStars).toBe(10);
    });

    it('should not spend stars if insufficient', () => {
      const { earnStars, spendStars } = useGameStore.getState();
      earnStars(5);

      const success = spendStars(10); // Try to spend more than available
      expect(success).toBe(false);

      const state = useGameStore.getState();
      expect(state.stars).toBe(5); // Unchanged
      expect(state.stats.collectedStars).toBe(5);
    });

    it('should buy stars into spendable balance without changing lifetime earned stars', () => {
      const { buyStars } = useGameStore.getState();

      const success = buyStars(STAR_PURCHASE_AMOUNT);

      expect(success).toBe(true);
      expect(useGameStore.getState().stars).toBe(STAR_PURCHASE_AMOUNT);
      expect(useGameStore.getState().stats.collectedStars).toBe(0);
    });

    it('should not convert bought stars into lifetime earned stars later', () => {
      const { buyStars, earnStars } = useGameStore.getState();

      buyStars(STAR_PURCHASE_AMOUNT);
      earnStars(3);

      expect(useGameStore.getState().stars).toBe(STAR_PURCHASE_AMOUNT + 3);
      expect(useGameStore.getState().stats.collectedStars).toBe(3);
    });
  });

  describe('Sound Settings', () => {
    it('should toggle sound', () => {
      const { toggleSound } = useGameStore.getState();

      expect(useGameStore.getState().soundEnabled).toBe(true);
      toggleSound();
      expect(useGameStore.getState().soundEnabled).toBe(false);
      toggleSound();
      expect(useGameStore.getState().soundEnabled).toBe(true);
    });
  });

  describe('Score Management', () => {
    it('should set score', () => {
      const { setScore } = useGameStore.getState();
      setScore(100);
      expect(useGameStore.getState().score).toBe(100);
    });

    it('should add score', () => {
      const { addScore } = useGameStore.getState();
      addScore(10);
      addScore(20);
      expect(useGameStore.getState().score).toBe(30);
    });
  });

  describe('Achievement Management', () => {
    it('should unlock achievement', () => {
      const { unlockAchievement } = useGameStore.getState();
      unlockAchievement('first_game');

      expect(useGameStore.getState().unlockedAchievements).toContain('first_game');
    });

    it('should not duplicate achievements', () => {
      const { unlockAchievement } = useGameStore.getState();
      unlockAchievement('first_game');
      unlockAchievement('first_game');

      const achievements = useGameStore
        .getState()
        .unlockedAchievements.filter((a) => a === 'first_game');
      expect(achievements.length).toBe(1);
    });
  });

  describe('Tutorial', () => {
    it('should mark tutorial as seen', () => {
      const { markTutorialSeen } = useGameStore.getState();

      expect(useGameStore.getState().hasSeenTutorial).toBe(false);
      markTutorialSeen();
      expect(useGameStore.getState().hasSeenTutorial).toBe(true);
    });
  });

  describe('Content History', () => {
    it('records played content ids per content pack without duplicates', () => {
      const { recordPlayedContent, getPlayedContent } = useGameStore.getState();

      recordPlayedContent('pack.shape_shift', 'sun');
      recordPlayedContent('pack.shape_shift', 'house');
      recordPlayedContent('pack.shape_shift', 'sun');

      expect(getPlayedContent('pack.shape_shift')).toEqual(['sun', 'house']);
      expect(getPlayedContent('other.pack')).toEqual([]);
    });
  });
});
