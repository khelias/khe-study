import { ASTRONOMY_VISIBLE_CONSTELLATIONS_SKILL } from '../curriculum/skills/astronomy';
import {
  LANGUAGE_LONG_VOCABULARY_SKILL,
  LANGUAGE_SPATIAL_SENTENCES_SKILL,
  LANGUAGE_SYLLABIFICATION_SKILL,
  LANGUAGE_VOCABULARY_SKILL,
} from '../curriculum/skills/language';
import {
  MATH_ADDITION_MEMORY_SKILL,
  MATH_ADDITION_WITHIN_20_SKILL,
  MATH_ADDITION_WITHIN_100_SKILL,
  MATH_BALANCE_EQUATIONS_SKILL,
  MATH_COMPARE_NUMBERS_SKILL,
  MATH_DIVISION_FACTS_1_TO_5_SKILL,
  MATH_DIVISION_FACTS_1_TO_10_SKILL,
  MATH_GEOMETRY_SHAPES_SKILL,
  MATH_GRID_NAVIGATION_SKILL,
  MATH_MIXED_PROBLEM_SOLVING_SKILL,
  MATH_MULTIPLICATION_1_TO_5_SKILL,
  MATH_MULTIPLICATION_1_TO_10_SKILL,
  MATH_PATTERN_SEQUENCES_SKILL,
  MATH_SUBTRACTION_WITHIN_20_SKILL,
  MATH_SUBTRACTION_WITHIN_100_SKILL,
  MATH_TIME_READING_SKILL,
  MATH_UNIT_CONVERSIONS_SKILL,
} from '../curriculum/skills/math';
import type { LocaleCode, SkillId } from '../curriculum/types';
import type { GameBindingId, LearnerProfile, MechanicProgression, SkillMastery } from './types';

type LegacyLevelsByProfile = Record<string, Record<string, number>>;
type LegacyGameLevels = Record<string, number>;

/**
 * Classifies how each game binding uses its level value (per ADR-0003).
 *
 * - `skill_only`: generator reads level for question difficulty only; the
 *   stored MechanicProgression is degenerate (kept for storage symmetry).
 * - `mechanic_aware`: generator reads level for game-mechanic ramp (grid
 *   size, obstacle count, mode bands, unlocked question kinds) in addition
 *   to question difficulty.
 */
export type LegacyGameBindingKind = 'skill_only' | 'mechanic_aware';

export const LEGACY_GAME_SKILL_IDS: Record<string, readonly SkillId[]> = {
  word_builder: [LANGUAGE_VOCABULARY_SKILL.id],
  word_cascade: [LANGUAGE_VOCABULARY_SKILL.id],
  word_cascade_long: [LANGUAGE_LONG_VOCABULARY_SKILL.id],
  picture_pairs: [LANGUAGE_VOCABULARY_SKILL.id],
  letter_match: [LANGUAGE_VOCABULARY_SKILL.id],
  syllable_builder: [LANGUAGE_SYLLABIFICATION_SKILL.id],
  sentence_logic: [LANGUAGE_SPATIAL_SENTENCES_SKILL.id],
  addition_snake: [MATH_ADDITION_WITHIN_20_SKILL.id],
  addition_big_snake: [MATH_ADDITION_WITHIN_100_SKILL.id],
  subtraction_snake: [MATH_SUBTRACTION_WITHIN_20_SKILL.id],
  subtraction_big_snake: [MATH_SUBTRACTION_WITHIN_100_SKILL.id],
  multiplication_snake: [MATH_MULTIPLICATION_1_TO_5_SKILL.id],
  multiplication_big_snake: [MATH_MULTIPLICATION_1_TO_10_SKILL.id],
  addition_fact_drill_within_20: [MATH_ADDITION_WITHIN_20_SKILL.id],
  addition_fact_drill_within_100: [MATH_ADDITION_WITHIN_100_SKILL.id],
  subtraction_fact_drill_within_20: [MATH_SUBTRACTION_WITHIN_20_SKILL.id],
  subtraction_fact_drill_within_100: [MATH_SUBTRACTION_WITHIN_100_SKILL.id],
  multiplication_fact_drill_1_5: [MATH_MULTIPLICATION_1_TO_5_SKILL.id],
  multiplication_fact_drill_1_10: [MATH_MULTIPLICATION_1_TO_10_SKILL.id],
  division_fact_drill_1_5: [MATH_DIVISION_FACTS_1_TO_5_SKILL.id],
  division_fact_drill_1_10: [MATH_DIVISION_FACTS_1_TO_10_SKILL.id],
  pattern: [MATH_PATTERN_SEQUENCES_SKILL.id],
  memory_math: [MATH_ADDITION_MEMORY_SKILL.id],
  robo_path: [MATH_GRID_NAVIGATION_SKILL.id],
  unit_conversion: [MATH_UNIT_CONVERSIONS_SKILL.id],
  compare_sizes: [MATH_COMPARE_NUMBERS_SKILL.id],
  balance_scale: [MATH_BALANCE_EQUATIONS_SKILL.id],
  time_match: [MATH_TIME_READING_SKILL.id],
  shape_shift: [MATH_GEOMETRY_SHAPES_SKILL.id],
  shape_dash: [MATH_GEOMETRY_SHAPES_SKILL.id],
  star_mapper: [ASTRONOMY_VISIBLE_CONSTELLATIONS_SKILL.id],
  battlelearn: [MATH_MIXED_PROBLEM_SOLVING_SKILL.id],
  battlelearn_multiplication: [MATH_MULTIPLICATION_1_TO_10_SKILL.id],
  battlelearn_multiplication_1_5: [MATH_MULTIPLICATION_1_TO_5_SKILL.id],
};

export const LEGACY_GAME_BINDING_KIND: Record<string, LegacyGameBindingKind> = {
  word_builder: 'skill_only',
  word_cascade: 'skill_only',
  word_cascade_long: 'skill_only',
  picture_pairs: 'skill_only',
  letter_match: 'skill_only',
  syllable_builder: 'skill_only',
  sentence_logic: 'skill_only',
  memory_math: 'skill_only',
  unit_conversion: 'skill_only',
  compare_sizes: 'skill_only',
  balance_scale: 'skill_only',
  time_match: 'skill_only',
  addition_fact_drill_within_20: 'skill_only',
  addition_fact_drill_within_100: 'skill_only',
  subtraction_fact_drill_within_20: 'skill_only',
  subtraction_fact_drill_within_100: 'skill_only',
  multiplication_fact_drill_1_5: 'skill_only',
  multiplication_fact_drill_1_10: 'skill_only',
  division_fact_drill_1_5: 'skill_only',
  division_fact_drill_1_10: 'skill_only',
  addition_snake: 'mechanic_aware',
  addition_big_snake: 'mechanic_aware',
  subtraction_snake: 'mechanic_aware',
  subtraction_big_snake: 'mechanic_aware',
  multiplication_snake: 'mechanic_aware',
  multiplication_big_snake: 'mechanic_aware',
  pattern: 'mechanic_aware',
  robo_path: 'mechanic_aware',
  shape_shift: 'mechanic_aware',
  shape_dash: 'mechanic_aware',
  star_mapper: 'mechanic_aware',
  battlelearn: 'mechanic_aware',
  battlelearn_multiplication: 'mechanic_aware',
  battlelearn_multiplication_1_5: 'mechanic_aware',
};

interface CreateLegacyLearnerParams {
  id?: string;
  displayName: string;
  legacyProfileId: string;
  levelsByProfile: LegacyLevelsByProfile;
  locale: LocaleCode;
  now: number;
}

function sanitizeLevel(level: unknown): number {
  return typeof level === 'number' && Number.isFinite(level) ? Math.max(1, Math.floor(level)) : 1;
}

function createEmptyMastery(skillId: SkillId, level: number, now: number): SkillMastery {
  return {
    skillId,
    level,
    rollingStats: {
      attempts: 0,
      correct: 0,
      avgResponseMs: 0,
    },
    lastPlayedAt: now,
  };
}

function createMechanicProgression(
  bindingId: GameBindingId,
  level: number,
  now: number,
): MechanicProgression {
  return {
    bindingId,
    level,
    lastPlayedAt: now,
  };
}

function createLocalLearnerId(): string {
  if (globalThis.crypto && 'randomUUID' in globalThis.crypto) {
    return globalThis.crypto.randomUUID();
  }
  return `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function migrateLegacyGameLevelsToSkillMastery(
  gameLevels: LegacyGameLevels,
  now: number,
): Record<SkillId, SkillMastery> {
  const mastery: Record<SkillId, SkillMastery> = {};

  for (const [gameType, rawLevel] of Object.entries(gameLevels)) {
    const skillIds = LEGACY_GAME_SKILL_IDS[gameType];
    if (!skillIds) continue;

    const level = sanitizeLevel(rawLevel);
    for (const skillId of skillIds) {
      const existing = mastery[skillId];
      mastery[skillId] = createEmptyMastery(skillId, Math.max(existing?.level ?? 1, level), now);
    }
  }

  return mastery;
}

export function migrateLegacyGameLevelsToMechanicProgression(
  gameLevels: LegacyGameLevels,
  now: number,
): Record<GameBindingId, MechanicProgression> {
  const progression: Record<GameBindingId, MechanicProgression> = {};

  for (const [gameType, rawLevel] of Object.entries(gameLevels)) {
    if (!(gameType in LEGACY_GAME_SKILL_IDS)) continue;
    progression[gameType] = createMechanicProgression(gameType, sanitizeLevel(rawLevel), now);
  }

  return progression;
}

export function createLearnerProfileFromLegacyProgress({
  id,
  displayName,
  legacyProfileId,
  levelsByProfile,
  locale,
  now,
}: CreateLegacyLearnerParams): LearnerProfile {
  const gameLevels = levelsByProfile[legacyProfileId] ?? {};

  return {
    id: id ?? createLocalLearnerId(),
    displayName,
    persona: 'kid',
    preferences: { locale },
    skillMastery: migrateLegacyGameLevelsToSkillMastery(gameLevels, now),
    mechanicProgression: migrateLegacyGameLevelsToMechanicProgression(gameLevels, now),
    createdAt: now,
    updatedAt: now,
  };
}

export function applyLegacyGameLevelToLearner(
  learner: LearnerProfile,
  gameType: string,
  level: number,
  now: number,
): LearnerProfile {
  const skillIds = LEGACY_GAME_SKILL_IDS[gameType];
  if (!skillIds) return learner;

  const skillMastery = { ...learner.skillMastery };
  const sanitizedLevel = sanitizeLevel(level);
  for (const skillId of skillIds) {
    const existing = skillMastery[skillId];
    const nextMastery = createEmptyMastery(skillId, sanitizedLevel, now);
    skillMastery[skillId] = {
      ...nextMastery,
      rollingStats: existing?.rollingStats ?? nextMastery.rollingStats,
      lastPlayedAt: now,
    };
  }

  const mechanicProgression = {
    ...learner.mechanicProgression,
    [gameType]: createMechanicProgression(gameType, sanitizedLevel, now),
  };

  return {
    ...learner,
    skillMastery,
    mechanicProgression,
    updatedAt: now,
  };
}

export function getLearnerLevelForLegacyGame(
  learner: LearnerProfile,
  gameType: string,
  fallbackLevel = 1,
): number {
  const skillIds = LEGACY_GAME_SKILL_IDS[gameType];
  if (!skillIds) return fallbackLevel;

  return skillIds.reduce((level, skillId) => {
    return Math.max(level, learner.skillMastery[skillId]?.level ?? fallbackLevel);
  }, fallbackLevel);
}

/**
 * Returns the level the adaptive engine should use for a binding.
 *
 * - For `skill_only` bindings, reads from the highest-mastery skill the
 *   binding touches.
 * - For `mechanic_aware` bindings, reads from `mechanicProgression`, falling
 *   back to skill mastery if the binding has not been played yet.
 *
 * Bindings unknown to the legacy map return `fallbackLevel`.
 */
export function getLearnerLevelForBinding(
  learner: LearnerProfile,
  bindingId: GameBindingId,
  fallbackLevel = 1,
): number {
  const kind = LEGACY_GAME_BINDING_KIND[bindingId];
  if (!kind) return fallbackLevel;

  if (kind === 'mechanic_aware') {
    const mechanic = learner.mechanicProgression[bindingId];
    if (mechanic) return mechanic.level;
  }

  return getLearnerLevelForLegacyGame(learner, bindingId, fallbackLevel);
}
