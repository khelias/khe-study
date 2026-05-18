import { describe, expect, it } from 'vitest';
import { ASTRONOMY_VISIBLE_CONSTELLATIONS_SKILL } from '../../curriculum/skills/astronomy';
import { LANGUAGE_VOCABULARY_SKILL } from '../../curriculum/skills/language';
import {
  MATH_ADDITION_WITHIN_20_SKILL,
  MATH_GEOMETRY_SHAPES_SKILL,
} from '../../curriculum/skills/math';
import {
  applyLegacyGameLevelToLearner,
  createLearnerProfileFromLegacyProgress,
  getLearnerLevelForLegacyGame,
  migrateLegacyGameLevelsToSkillMastery,
} from '../legacyProgress';

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
    expect(mastery[MATH_GEOMETRY_SHAPES_SKILL.id]?.level).toBe(5);
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
});
