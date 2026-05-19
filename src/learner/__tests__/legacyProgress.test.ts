import { describe, expect, it } from 'vitest';
import { ASTRONOMY_VISIBLE_CONSTELLATIONS_SKILL } from '../../curriculum/skills/astronomy';
import { LANGUAGE_VOCABULARY_SKILL } from '../../curriculum/skills/language';
import {
  MATH_ADDITION_WITHIN_20_SKILL,
  MATH_GEOMETRY_SHAPES_SPATIAL_SKILL,
  MATH_GEOMETRY_SHAPES_VERBAL_SKILL,
} from '../../curriculum/skills/math';
import {
  applyAttemptToLearner,
  applyLegacyGameLevelToLearner,
  createLearnerProfileFromLegacyProgress,
  getLearnerLevelForLegacyGame,
  migrateLegacyGameLevelsToSkillMastery,
} from '../legacyProgress';
import { MATH_MULTIPLICATION_1_TO_5_SKILL } from '../../curriculum/skills/math';

describe('legacy learner progress migration', () => {
  it('maps legacy game levels to skill mastery levels', () => {
    const mastery = migrateLegacyGameLevelsToSkillMastery(
      {
        word_builder: 4,
        word_cascade: 7,
        shape_dash: 2,
        shape_shift: 5,
        star_mapper: 3,
        unknown_game: 99,
      },
      123,
    );

    expect(mastery[LANGUAGE_VOCABULARY_SKILL.id]?.level).toBe(7);
    expect(mastery[MATH_GEOMETRY_SHAPES_SPATIAL_SKILL.id]?.level).toBe(5);
    expect(mastery[MATH_GEOMETRY_SHAPES_VERBAL_SKILL.id]?.level).toBe(2);
    expect(mastery[ASTRONOMY_VISIBLE_CONSTELLATIONS_SKILL.id]?.level).toBe(3);
    expect(mastery['unknown_game']).toBeUndefined();
  });

  it('creates one active learner from the selected legacy profile only', () => {
    const learner = createLearnerProfileFromLegacyProgress({
      id: 'learner-1',
      displayName: 'Õppija',
      legacyProfileId: 'starter',
      levelsByProfile: {
        starter: { word_builder: 4 },
        advanced: { word_builder: 9 },
      },
      locale: 'et',
      now: 123,
    });

    expect(learner).toMatchObject({
      id: 'learner-1',
      displayName: 'Õppija',
      persona: 'kid',
      preferences: { locale: 'et' },
      createdAt: 123,
      updatedAt: 123,
    });
    expect(learner.skillMastery[LANGUAGE_VOCABULARY_SKILL.id]?.level).toBe(4);
  });

  it('updates and reads levels through skill mastery', () => {
    const learner = createLearnerProfileFromLegacyProgress({
      id: 'learner-1',
      displayName: 'Õppija',
      legacyProfileId: 'starter',
      levelsByProfile: { starter: { addition_snake: 2 } },
      locale: 'et',
      now: 123,
    });

    const updated = applyLegacyGameLevelToLearner(learner, 'addition_snake', 6, 456);

    expect(updated.skillMastery[MATH_ADDITION_WITHIN_20_SKILL.id]?.level).toBe(6);
    expect(updated.skillMastery[MATH_ADDITION_WITHIN_20_SKILL.id]?.lastPlayedAt).toBe(456);
    expect(getLearnerLevelForLegacyGame(updated, 'addition_snake')).toBe(6);
  });

  describe('applyAttemptToLearner', () => {
    const baseLearner = () =>
      createLearnerProfileFromLegacyProgress({
        id: 'learner-1',
        displayName: 'Õppija',
        legacyProfileId: 'starter',
        levelsByProfile: { starter: {} },
        locale: 'et',
        now: 0,
      });

    it('accumulates rolling stats across attempts for an open-set skill', () => {
      let learner = baseLearner();
      learner = applyAttemptToLearner(learner, 'word_cascade', true, 1000, 10);
      learner = applyAttemptToLearner(learner, 'word_cascade', false, 2000, 20);
      learner = applyAttemptToLearner(learner, 'word_cascade', true, 3000, 30);

      const mastery = learner.skillMastery[LANGUAGE_VOCABULARY_SKILL.id];
      expect(mastery?.rollingStats.attempts).toBe(3);
      expect(mastery?.rollingStats.correct).toBe(2);
      expect(mastery?.rollingStats.avgResponseMs).toBe(2000);
      expect(mastery?.lastPlayedAt).toBe(30);
      expect(mastery?.factsKnown).toBeUndefined();
    });

    it('records factsKnown for closed-set skills when factKey is provided', () => {
      let learner = baseLearner();
      learner = applyAttemptToLearner(learner, 'multiplication_snake', true, 1500, 10, '4×5');
      learner = applyAttemptToLearner(learner, 'multiplication_snake', false, 2500, 20, '4×5');
      learner = applyAttemptToLearner(learner, 'multiplication_snake', true, 800, 30, '1×1');

      const mastery = learner.skillMastery[MATH_MULTIPLICATION_1_TO_5_SKILL.id];
      expect(mastery?.factsKnown?.['4×5']).toMatchObject({
        attempts: 2,
        correct: 1,
        avgResponseMs: 2000,
        lastSeen: 20,
      });
      expect(mastery?.factsKnown?.['1×1']).toMatchObject({ attempts: 1, correct: 1, lastSeen: 30 });
      expect(mastery?.rollingStats.attempts).toBe(3);
    });

    it('caps response time at 30 seconds to protect against idle tabs', () => {
      let learner = baseLearner();
      learner = applyAttemptToLearner(learner, 'word_cascade', true, 999_999, 10);

      const mastery = learner.skillMastery[LANGUAGE_VOCABULARY_SKILL.id];
      expect(mastery?.rollingStats.avgResponseMs).toBe(30_000);
    });

    it('ignores factKey on open-set skills', () => {
      let learner = baseLearner();
      learner = applyAttemptToLearner(learner, 'word_cascade', true, 500, 10, 'banana');

      const mastery = learner.skillMastery[LANGUAGE_VOCABULARY_SKILL.id];
      expect(mastery?.factsKnown).toBeUndefined();
    });

    it('is a no-op when the gameType has no skill mapping', () => {
      const before = baseLearner();
      const after = applyAttemptToLearner(before, 'totally_unknown_game', true, 500, 10);
      expect(after).toBe(before);
    });
  });

  describe('getLearnerLevelForLegacyGame (learner-primary)', () => {
    const learnerAt = (gameType: string, level: number) => {
      const base = createLearnerProfileFromLegacyProgress({
        id: 'learner-1',
        displayName: 'Õppija',
        legacyProfileId: 'starter',
        levelsByProfile: { starter: {} },
        locale: 'et',
        now: 0,
      });
      return applyLegacyGameLevelToLearner(base, gameType, level, 0);
    };

    it('prefers learner mastery over the legacy fallback even when the fallback is higher', () => {
      const learner = learnerAt('word_cascade', 3);
      expect(getLearnerLevelForLegacyGame(learner, 'word_cascade', 7)).toBe(3);
    });

    it('falls back to the legacy level when no mapped skill has mastery yet', () => {
      const learner = createLearnerProfileFromLegacyProgress({
        id: 'learner-1',
        displayName: 'Õppija',
        legacyProfileId: 'starter',
        levelsByProfile: { starter: {} },
        locale: 'et',
        now: 0,
      });
      expect(getLearnerLevelForLegacyGame(learner, 'word_cascade', 4)).toBe(4);
    });

    it('shares vocabulary skill level across all four bound mechanics', () => {
      const learner = learnerAt('word_cascade', 5);
      expect(getLearnerLevelForLegacyGame(learner, 'word_cascade')).toBe(5);
      expect(getLearnerLevelForLegacyGame(learner, 'word_builder')).toBe(5);
      expect(getLearnerLevelForLegacyGame(learner, 'picture_pairs')).toBe(5);
      expect(getLearnerLevelForLegacyGame(learner, 'letter_match')).toBe(5);
    });
  });
});
