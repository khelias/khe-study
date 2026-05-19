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
  MATH_GEOMETRY_SHAPES_SPATIAL_SKILL,
  MATH_GEOMETRY_SHAPES_VERBAL_SKILL,
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
import { isClosedSetSkill } from './skillClassification';
import type { FactStats, LearnerProfile, SkillMastery } from './types';

type LegacyLevelsByProfile = Record<string, Record<string, number>>;
type LegacyGameLevels = Record<string, number>;

/**
 * gameType → skillId(s) for every binding registered in `src/games/registrations.ts`.
 *
 * Source of truth: registrations.ts. When a binding is added there, add the
 * matching entry here in the same change. A vitest-time assertion in
 * `__tests__/legacyProgress.coverage.test.ts` fails the build if the two
 * diverge.
 */
export const LEGACY_GAME_SKILL_IDS: Record<string, readonly SkillId[]> = {
  // Language
  word_builder: [LANGUAGE_VOCABULARY_SKILL.id],
  word_cascade: [LANGUAGE_VOCABULARY_SKILL.id],
  word_cascade_long: [LANGUAGE_LONG_VOCABULARY_SKILL.id],
  picture_pairs: [LANGUAGE_VOCABULARY_SKILL.id],
  letter_match: [LANGUAGE_VOCABULARY_SKILL.id],
  syllable_builder: [LANGUAGE_SYLLABIFICATION_SKILL.id],
  sentence_logic: [LANGUAGE_SPATIAL_SENTENCES_SKILL.id],
  // Math — snake family (one skill per binding)
  addition_snake: [MATH_ADDITION_WITHIN_20_SKILL.id],
  addition_big_snake: [MATH_ADDITION_WITHIN_100_SKILL.id],
  subtraction_snake: [MATH_SUBTRACTION_WITHIN_20_SKILL.id],
  subtraction_big_snake: [MATH_SUBTRACTION_WITHIN_100_SKILL.id],
  multiplication_snake: [MATH_MULTIPLICATION_1_TO_5_SKILL.id],
  multiplication_big_snake: [MATH_MULTIPLICATION_1_TO_10_SKILL.id],
  // Math — fact drill family (shares skills with snake counterparts)
  multiplication_fact_drill_1_5: [MATH_MULTIPLICATION_1_TO_5_SKILL.id],
  multiplication_fact_drill_1_10: [MATH_MULTIPLICATION_1_TO_10_SKILL.id],
  addition_fact_drill_within_20: [MATH_ADDITION_WITHIN_20_SKILL.id],
  addition_fact_drill_within_100: [MATH_ADDITION_WITHIN_100_SKILL.id],
  subtraction_fact_drill_within_20: [MATH_SUBTRACTION_WITHIN_20_SKILL.id],
  subtraction_fact_drill_within_100: [MATH_SUBTRACTION_WITHIN_100_SKILL.id],
  division_fact_drill_1_5: [MATH_DIVISION_FACTS_1_TO_5_SKILL.id],
  division_fact_drill_1_10: [MATH_DIVISION_FACTS_1_TO_10_SKILL.id],
  // Math — other
  pattern: [MATH_PATTERN_SEQUENCES_SKILL.id],
  memory_math: [MATH_ADDITION_MEMORY_SKILL.id],
  robo_path: [MATH_GRID_NAVIGATION_SKILL.id],
  unit_conversion: [MATH_UNIT_CONVERSIONS_SKILL.id],
  compare_sizes: [MATH_COMPARE_NUMBERS_SKILL.id],
  balance_scale: [MATH_BALANCE_EQUATIONS_SKILL.id],
  time_match: [MATH_TIME_READING_SKILL.id],
  // Geometry — split per Phase 0 audit: spatial reasoning vs verbal recognition
  shape_shift: [MATH_GEOMETRY_SHAPES_SPATIAL_SKILL.id],
  shape_dash: [MATH_GEOMETRY_SHAPES_VERBAL_SKILL.id],
  // Astronomy
  star_mapper: [ASTRONOMY_VISIBLE_CONSTELLATIONS_SKILL.id],
  // BattleLearn — mixed default + narrowed multiplication variants
  battlelearn: [MATH_MIXED_PROBLEM_SOLVING_SKILL.id],
  battlelearn_multiplication: [MATH_MULTIPLICATION_1_TO_10_SKILL.id],
  battlelearn_multiplication_1_5: [MATH_MULTIPLICATION_1_TO_5_SKILL.id],
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

/** Idle tabs and stuck modals can produce huge response times; cap at 30s. */
const MAX_RESPONSE_MS = 30_000;

function sanitizeResponseMs(responseTimeMs: number): number {
  if (!Number.isFinite(responseTimeMs) || responseTimeMs < 0) return 0;
  return Math.min(responseTimeMs, MAX_RESPONSE_MS);
}

function nextAvgResponseMs(prevAvg: number, prevAttempts: number, sample: number): number {
  return (prevAvg * prevAttempts + sample) / (prevAttempts + 1);
}

function accumulateFactStats(
  prev: FactStats | undefined,
  isCorrect: boolean,
  responseMs: number,
  now: number,
): FactStats {
  const attempts = (prev?.attempts ?? 0) + 1;
  const correct = (prev?.correct ?? 0) + (isCorrect ? 1 : 0);
  const avgResponseMs = nextAvgResponseMs(
    prev?.avgResponseMs ?? 0,
    prev?.attempts ?? 0,
    responseMs,
  );
  return { attempts, correct, avgResponseMs, lastSeen: now };
}

/**
 * Accumulate one answer attempt onto every skill that `gameType` maps to.
 * Open-set skills update `rollingStats` only; closed-set skills also update
 * `factsKnown[factKey]` when a `factKey` is supplied.
 */
export function applyAttemptToLearner(
  learner: LearnerProfile,
  gameType: string,
  isCorrect: boolean,
  responseTimeMs: number,
  now: number,
  factKey?: string,
): LearnerProfile {
  const skillIds = LEGACY_GAME_SKILL_IDS[gameType];
  if (!skillIds || skillIds.length === 0) return learner;

  const responseMs = sanitizeResponseMs(responseTimeMs);
  const skillMastery = { ...learner.skillMastery };

  for (const skillId of skillIds) {
    const existing = skillMastery[skillId] ?? createEmptyMastery(skillId, 1, now);
    const attempts = existing.rollingStats.attempts + 1;
    const correct = existing.rollingStats.correct + (isCorrect ? 1 : 0);
    const avgResponseMs = nextAvgResponseMs(
      existing.rollingStats.avgResponseMs,
      existing.rollingStats.attempts,
      responseMs,
    );

    const nextFactsKnown =
      factKey && isClosedSetSkill(skillId)
        ? {
            ...(existing.factsKnown ?? {}),
            [factKey]: accumulateFactStats(
              existing.factsKnown?.[factKey],
              isCorrect,
              responseMs,
              now,
            ),
          }
        : existing.factsKnown;

    skillMastery[skillId] = {
      ...existing,
      rollingStats: { attempts, correct, avgResponseMs },
      ...(nextFactsKnown !== undefined ? { factsKnown: nextFactsKnown } : {}),
      lastPlayedAt: now,
    };
  }

  return { ...learner, skillMastery, updatedAt: now };
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
    mechanicPreference: {},
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

  return {
    ...learner,
    skillMastery,
    updatedAt: now,
  };
}

/**
 * Learner-primary level read. Returns the highest mastery level across every
 * skill the gameType maps to. Falls back to `fallbackLevel` only when no
 * mapped skill has any mastery recorded yet (fresh learner, pre-Phase 1
 * legacy data not yet migrated).
 *
 * Skill-sharing consequence: gameTypes that map to the same skill report the
 * same level after either is played. E.g. `language.vocabulary` is shared by
 * word_builder, word_cascade, picture_pairs, letter_match — leveling up in
 * one reflects across the rest.
 */
export function getLearnerLevelForLegacyGame(
  learner: LearnerProfile,
  gameType: string,
  fallbackLevel = 1,
): number {
  const skillIds = LEGACY_GAME_SKILL_IDS[gameType];
  if (!skillIds || skillIds.length === 0) return fallbackLevel;

  let bestLearnerLevel: number | undefined;
  for (const skillId of skillIds) {
    const lvl = learner.skillMastery[skillId]?.level;
    if (lvl != null && (bestLearnerLevel === undefined || lvl > bestLearnerLevel)) {
      bestLearnerLevel = lvl;
    }
  }

  return bestLearnerLevel ?? fallbackLevel;
}
