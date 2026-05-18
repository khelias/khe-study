import { describe, expect, it } from 'vitest';
import { ASTRONOMY_VISIBLE_CONSTELLATIONS_SKILL } from '../../curriculum/skills/astronomy';
import { LANGUAGE_VOCABULARY_SKILL } from '../../curriculum/skills/language';
import {
  MATH_ADDITION_WITHIN_20_SKILL,
  MATH_GEOMETRY_SHAPES_SKILL,
  MATH_MULTIPLICATION_1_TO_5_SKILL,
} from '../../curriculum/skills/math';
import { gameRegistry } from '../../games/registry';
import '../../games/registrations';
import {
  LEGACY_GAME_BINDING_KIND,
  LEGACY_GAME_SKILL_IDS,
  applyLegacyGameLevelToLearner,
  createLearnerProfileFromLegacyProgress,
  getLearnerLevelForBinding,
  getLearnerLevelForLegacyGame,
  migrateLegacyGameLevelsToMechanicProgression,
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

  it('migrates legacy levels into mechanic progression keyed by binding id', () => {
    const progression = migrateLegacyGameLevelsToMechanicProgression(
      { battlelearn: 4, multiplication_fact_drill_1_5: 7, unknown_game: 99 },
      123,
    );

    expect(progression.battlelearn).toEqual({
      bindingId: 'battlelearn',
      level: 4,
      lastPlayedAt: 123,
    });
    expect(progression.multiplication_fact_drill_1_5?.level).toBe(7);
    expect(progression.unknown_game).toBeUndefined();
  });

  it('createLearnerProfileFromLegacyProgress seeds both dimensions', () => {
    const learner = createLearnerProfileFromLegacyProgress({
      id: 'learner-1',
      displayName: 'Õppija',
      legacyProfileId: 'starter',
      levelsByProfile: { starter: { battlelearn_multiplication_1_5: 3 } },
      locale: 'et',
      now: 123,
    });

    expect(learner.skillMastery[MATH_MULTIPLICATION_1_TO_5_SKILL.id]?.level).toBe(3);
    expect(learner.mechanicProgression.battlelearn_multiplication_1_5?.level).toBe(3);
  });

  it('applyLegacyGameLevelToLearner updates mechanic progression alongside skill mastery', () => {
    const learner = createLearnerProfileFromLegacyProgress({
      id: 'learner-1',
      displayName: 'Õppija',
      legacyProfileId: 'starter',
      levelsByProfile: { starter: { battlelearn: 1 } },
      locale: 'et',
      now: 123,
    });

    const updated = applyLegacyGameLevelToLearner(learner, 'battlelearn', 5, 456);

    expect(updated.mechanicProgression.battlelearn).toEqual({
      bindingId: 'battlelearn',
      level: 5,
      lastPlayedAt: 456,
    });
  });

  it('getLearnerLevelForBinding reads mechanic progression for mechanic-aware bindings', () => {
    const learner = createLearnerProfileFromLegacyProgress({
      id: 'learner-1',
      displayName: 'Õppija',
      legacyProfileId: 'starter',
      levelsByProfile: {
        starter: {
          battlelearn_multiplication: 4,
          battlelearn_multiplication_1_5: 2,
        },
      },
      locale: 'et',
      now: 123,
    });

    expect(getLearnerLevelForBinding(learner, 'battlelearn_multiplication')).toBe(4);
    expect(getLearnerLevelForBinding(learner, 'battlelearn_multiplication_1_5')).toBe(2);
  });

  it('getLearnerLevelForBinding falls back to skill mastery when binding is skill-only', () => {
    const learner = createLearnerProfileFromLegacyProgress({
      id: 'learner-1',
      displayName: 'Õppija',
      legacyProfileId: 'starter',
      levelsByProfile: {
        starter: { multiplication_fact_drill_1_5: 6 },
      },
      locale: 'et',
      now: 123,
    });

    expect(getLearnerLevelForBinding(learner, 'multiplication_fact_drill_1_5')).toBe(6);
  });

  it('classifies every registered game binding', () => {
    const registeredIds = gameRegistry.getIds();

    for (const id of registeredIds) {
      expect(LEGACY_GAME_SKILL_IDS, `${id} missing skill id mapping`).toHaveProperty(id);
      expect(LEGACY_GAME_BINDING_KIND, `${id} missing binding kind`).toHaveProperty(id);
    }
  });
});
