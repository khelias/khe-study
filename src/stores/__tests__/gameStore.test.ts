import { describe, it, expect, beforeEach } from 'vitest';
import { STAR_PURCHASE_AMOUNT, useGameStore } from '../gameStore';
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
      hearts: 3,
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
    it('Phase 5f: recordLevelUp writes mechanic preference (not skill mastery level)', () => {
      const { recordLevelUp, getLevelForGame } = useGameStore.getState();
      recordLevelUp('word_builder', 2);

      const state = useGameStore.getState();
      // Mechanic preference is the single TASE axis.
      expect(state.activeLearnerProfile.mechanicPreference.word_builder?.difficulty).toBe(2);
      expect(getLevelForGame('word_builder')).toBe(2);
      // Stats still track max level per gameType for achievements.
      expect(state.stats.maxLevels['word_builder']).toBe(2);
      // Skill mastery level is no longer written by recordLevelUp.
      expect(
        state.activeLearnerProfile.skillMastery[LANGUAGE_VOCABULARY_SKILL.id]?.level ?? null,
      ).toBeNull();
    });

    it('should track max level correctly', () => {
      const { recordLevelUp } = useGameStore.getState();

      recordLevelUp('word_builder', 3);
      recordLevelUp('word_builder', 2); // Lower level shouldn't change max

      const state = useGameStore.getState();
      expect(state.stats.maxLevels['word_builder']).toBe(3);
    });

    it('Phase 5b: levelling up a snake binding shares the level with siblings via mechanic preference', () => {
      const { recordLevelUp, getLevelForGame } = useGameStore.getState();

      // All snake bindings share mechanic `math_snake`, so levelling up
      // Liitmisuss bumps the TASE on Lahutususs and Korrutususs too.
      recordLevelUp('addition_snake', 5);

      expect(
        useGameStore.getState().activeLearnerProfile.mechanicPreference.math_snake?.difficulty,
      ).toBe(5);
      expect(getLevelForGame('subtraction_snake')).toBe(5);
      expect(getLevelForGame('multiplication_snake')).toBe(5);
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

      setLevel('addition_snake', 8);

      const learner = useGameStore.getState().activeLearnerProfile;
      expect(learner.mechanicPreference.math_snake?.difficulty).toBe(8);
      expect(getLevelForGame('subtraction_snake')).toBe(8);
      // Skill mastery untouched.
      expect(learner.skillMastery[MATH_ADDITION_WITHIN_20_SKILL.id]?.level ?? null).toBeNull();
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
      useGameStore.getState().recordLevelUp('addition_snake', 5);
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

    it('should keep lifetime stars when spendable stars are spent on hearts', () => {
      const { earnStars, buyHeartsWithStars, spendHeart } = useGameStore.getState();
      earnStars(20);
      spendHeart();
      spendHeart();

      const success = buyHeartsWithStars(2);

      expect(success).toBe(true);
      expect(useGameStore.getState().stars).toBe(0);
      expect(useGameStore.getState().hearts).toBe(3);
      expect(useGameStore.getState().stats.collectedStars).toBe(20);
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

  describe('Hearts (Global Resource)', () => {
    beforeEach(() => {
      // Reset hearts to default for each test
      const { addHeart, spendHeart } = useGameStore.getState();
      const currentHearts = useGameStore.getState().hearts;
      if (currentHearts > 3) {
        // Spend excess hearts
        for (let i = currentHearts; i > 3; i--) {
          spendHeart();
        }
      } else if (currentHearts < 3) {
        // Add missing hearts
        addHeart(3 - currentHearts);
      }
    });

    it('should start with default hearts', () => {
      const state = useGameStore.getState();
      expect(state.hearts).toBe(3);
    });

    it('should spend hearts', () => {
      const { spendHeart } = useGameStore.getState();

      const success1 = spendHeart();
      expect(success1).toBe(true);
      expect(useGameStore.getState().hearts).toBe(2);

      const success2 = spendHeart();
      expect(success2).toBe(true);
      expect(useGameStore.getState().hearts).toBe(1);
    });

    it('should not spend hearts if none available', () => {
      const { spendHeart } = useGameStore.getState();

      // Spend all hearts
      spendHeart();
      spendHeart();
      spendHeart();

      const success = spendHeart();
      expect(success).toBe(false);
      expect(useGameStore.getState().hearts).toBe(0);
    });

    it('should add hearts up to max', () => {
      const { addHeart, spendHeart } = useGameStore.getState();

      // Spend some hearts first
      spendHeart();
      spendHeart();
      expect(useGameStore.getState().hearts).toBe(1);

      // Add hearts
      addHeart(2);
      expect(useGameStore.getState().hearts).toBe(3);

      // Try to add more than max (should cap at 5)
      addHeart(5);
      expect(useGameStore.getState().hearts).toBe(5);
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
