import {
  MATH_ADDITION_MEMORY_SKILL,
  MATH_DIVISION_FACTS_1_TO_5_SKILL,
  MATH_DIVISION_FACTS_1_TO_10_SKILL,
  MATH_MULTIPLICATION_1_TO_5_SKILL,
  MATH_MULTIPLICATION_1_TO_10_SKILL,
  MATH_TIME_READING_SKILL,
} from '../curriculum/skills/math';
import type { SkillId } from '../curriculum/types';

/**
 * Closed-set skills have a small, enumerable fact pool. Per-fact mastery
 * (`SkillMastery.factsKnown[factKey]`) is meaningful — Phase 1 onwards
 * accumulates attempts/correct/avgResponseMs per fact (e.g. "4x5") so the
 * adaptive engine can pick the weakest fact next.
 *
 * Open-set skills (everything not listed here) only track `rollingStats`
 * aggregated across all challenges — the challenge space is too large or
 * combinatorial for per-fact tracking to be useful.
 */
const CLOSED_SET_SKILL_IDS: ReadonlySet<SkillId> = new Set<SkillId>([
  MATH_MULTIPLICATION_1_TO_5_SKILL.id,
  MATH_MULTIPLICATION_1_TO_10_SKILL.id,
  MATH_DIVISION_FACTS_1_TO_5_SKILL.id,
  MATH_DIVISION_FACTS_1_TO_10_SKILL.id,
  MATH_ADDITION_MEMORY_SKILL.id,
  MATH_TIME_READING_SKILL.id,
]);

export function isClosedSetSkill(skillId: SkillId): boolean {
  return CLOSED_SET_SKILL_IDS.has(skillId);
}
