/**
 * Curriculum context public API.
 *
 * Importing this module as a side effect (or via `registerAll`) registers every
 * known skill and content pack into the runtime registries. Mechanics should
 * import this once at bootstrap (e.g. from `src/games/registrations.ts`) so
 * that `getPackItems(...)` resolves without order-of-import surprises.
 */

import { contentPackRegistry, skillRegistry } from './registry';
import { ASTRONOMY_VISIBLE_CONSTELLATIONS_SKILL } from './skills/astronomy';
import { ASTRONOMY_VISIBLE_FROM_ESTONIA_PACK } from './packs/astronomy/visibleFromEstonia';
import {
  LANGUAGE_LONG_VOCABULARY_SKILL,
  LANGUAGE_SPATIAL_SENTENCES_SKILL,
  LANGUAGE_SYLLABIFICATION_SKILL,
  LANGUAGE_VOCABULARY_SKILL,
} from './skills/language';
import { LANGUAGE_SYLLABIFICATION_ET_PACK } from './packs/language/syllables_et';
import { LANGUAGE_SYLLABIFICATION_EN_PACK } from './packs/language/syllables_en';
import { LANGUAGE_SPATIAL_SENTENCES_PACK } from './packs/language/spatialSentences';
import {
  LANGUAGE_LONG_VOCABULARY_EN_PACK,
  LANGUAGE_LONG_VOCABULARY_ET_PACK,
  LANGUAGE_VOCABULARY_EN_PACK,
  LANGUAGE_VOCABULARY_ET_PACK,
} from './packs/language/vocabulary';
import {
  MATH_ADDITION_WITHIN_20_SKILL,
  MATH_ADDITION_WITHIN_100_SKILL,
  MATH_SUBTRACTION_WITHIN_20_SKILL,
  MATH_SUBTRACTION_WITHIN_100_SKILL,
  MATH_MULTIPLICATION_1_TO_5_SKILL,
  MATH_MULTIPLICATION_1_TO_10_SKILL,
  MATH_GEOMETRY_SHAPES_SKILL,
  MATH_PATTERN_SEQUENCES_SKILL,
  MATH_UNIT_CONVERSIONS_SKILL,
  MATH_COMPARE_NUMBERS_SKILL,
  MATH_TIME_READING_SKILL,
  MATH_BALANCE_EQUATIONS_SKILL,
  MATH_ADDITION_MEMORY_SKILL,
  MATH_GRID_NAVIGATION_SKILL,
  MATH_MIXED_PROBLEM_SOLVING_SKILL,
  MATH_DIVISION_FACTS_1_TO_5_SKILL,
  MATH_DIVISION_FACTS_1_TO_10_SKILL,
} from './skills/math';
import { MATH_ADDITION_WITHIN_20_PACK } from './packs/math/addition_within_20';
import { MATH_ADDITION_WITHIN_100_PACK } from './packs/math/addition_within_100';
import { MATH_SUBTRACTION_WITHIN_20_PACK } from './packs/math/subtraction_within_20';
import { MATH_SUBTRACTION_WITHIN_100_PACK } from './packs/math/subtraction_within_100';
import { MATH_MULTIPLICATION_1_5_PACK } from './packs/math/multiplication_1_5';
import { MATH_MULTIPLICATION_1_10_PACK } from './packs/math/multiplication_1_10';
import { MATH_GEOMETRY_SHAPES_PACK } from './packs/math/geometry_shapes';
import { MATH_PATTERN_SEQUENCES_PACK } from './packs/math/pattern_sequences';
import { MATH_UNIT_CONVERSIONS_PACK } from './packs/math/unit_conversions';
import { MATH_COMPARE_NUMBERS_PACK } from './packs/math/compare_numbers';
import { MATH_TIME_READING_PACK } from './packs/math/time_reading';
import { MATH_BALANCE_EQUATIONS_PACK } from './packs/math/balance_equations';
import { MATH_ADDITION_MEMORY_PACK } from './packs/math/addition_memory';
import { MATH_GRID_NAVIGATION_PACK } from './packs/math/grid_navigation';
import { MATH_BATTLELEARN_PACK } from './packs/math/battlelearn';
import { SHAPE_SHIFT_PUZZLES_PACK } from './packs/geometry/shapeShiftPuzzles';
import { MATH_DIVISION_FACTS_1_5_PACK } from './packs/math/division_facts_1_5';
import { MATH_DIVISION_FACTS_1_10_PACK } from './packs/math/division_facts_1_10';

let registered = false;

export function registerAll(): void {
  if (registered) return;
  // Astronomy
  skillRegistry.register(ASTRONOMY_VISIBLE_CONSTELLATIONS_SKILL);
  contentPackRegistry.register(ASTRONOMY_VISIBLE_FROM_ESTONIA_PACK);
  // Language (one skill, locale-scoped packs)
  skillRegistry.register(LANGUAGE_SYLLABIFICATION_SKILL);
  skillRegistry.register(LANGUAGE_SPATIAL_SENTENCES_SKILL);
  skillRegistry.register(LANGUAGE_VOCABULARY_SKILL);
  skillRegistry.register(LANGUAGE_LONG_VOCABULARY_SKILL);
  contentPackRegistry.register(LANGUAGE_SYLLABIFICATION_ET_PACK);
  contentPackRegistry.register(LANGUAGE_SYLLABIFICATION_EN_PACK);
  contentPackRegistry.register(LANGUAGE_SPATIAL_SENTENCES_PACK);
  contentPackRegistry.register(LANGUAGE_VOCABULARY_ET_PACK);
  contentPackRegistry.register(LANGUAGE_VOCABULARY_EN_PACK);
  contentPackRegistry.register(LANGUAGE_LONG_VOCABULARY_ET_PACK);
  contentPackRegistry.register(LANGUAGE_LONG_VOCABULARY_EN_PACK);
  // Math (one skill per focused pack; math_snake mechanic binds to each separately)
  skillRegistry.register(MATH_ADDITION_WITHIN_20_SKILL);
  skillRegistry.register(MATH_ADDITION_WITHIN_100_SKILL);
  skillRegistry.register(MATH_SUBTRACTION_WITHIN_20_SKILL);
  skillRegistry.register(MATH_SUBTRACTION_WITHIN_100_SKILL);
  skillRegistry.register(MATH_MULTIPLICATION_1_TO_5_SKILL);
  skillRegistry.register(MATH_MULTIPLICATION_1_TO_10_SKILL);
  skillRegistry.register(MATH_GEOMETRY_SHAPES_SKILL);
  skillRegistry.register(MATH_PATTERN_SEQUENCES_SKILL);
  skillRegistry.register(MATH_UNIT_CONVERSIONS_SKILL);
  skillRegistry.register(MATH_COMPARE_NUMBERS_SKILL);
  skillRegistry.register(MATH_TIME_READING_SKILL);
  skillRegistry.register(MATH_BALANCE_EQUATIONS_SKILL);
  skillRegistry.register(MATH_ADDITION_MEMORY_SKILL);
  skillRegistry.register(MATH_GRID_NAVIGATION_SKILL);
  skillRegistry.register(MATH_MIXED_PROBLEM_SOLVING_SKILL);
  skillRegistry.register(MATH_DIVISION_FACTS_1_TO_5_SKILL);
  skillRegistry.register(MATH_DIVISION_FACTS_1_TO_10_SKILL);
  contentPackRegistry.register(MATH_ADDITION_WITHIN_20_PACK);
  contentPackRegistry.register(MATH_ADDITION_WITHIN_100_PACK);
  contentPackRegistry.register(MATH_SUBTRACTION_WITHIN_20_PACK);
  contentPackRegistry.register(MATH_SUBTRACTION_WITHIN_100_PACK);
  contentPackRegistry.register(MATH_MULTIPLICATION_1_5_PACK);
  contentPackRegistry.register(MATH_MULTIPLICATION_1_10_PACK);
  contentPackRegistry.register(MATH_GEOMETRY_SHAPES_PACK);
  contentPackRegistry.register(MATH_PATTERN_SEQUENCES_PACK);
  contentPackRegistry.register(MATH_UNIT_CONVERSIONS_PACK);
  contentPackRegistry.register(MATH_COMPARE_NUMBERS_PACK);
  contentPackRegistry.register(MATH_TIME_READING_PACK);
  contentPackRegistry.register(MATH_BALANCE_EQUATIONS_PACK);
  contentPackRegistry.register(MATH_ADDITION_MEMORY_PACK);
  contentPackRegistry.register(MATH_GRID_NAVIGATION_PACK);
  contentPackRegistry.register(MATH_BATTLELEARN_PACK);
  contentPackRegistry.register(MATH_DIVISION_FACTS_1_5_PACK);
  contentPackRegistry.register(MATH_DIVISION_FACTS_1_10_PACK);
  contentPackRegistry.register(SHAPE_SHIFT_PUZZLES_PACK);
  registered = true;
}

// Side-effect registration on import.
registerAll();

export {
  contentPackRegistry,
  skillRegistry,
  getPackItems,
  getPackItemsForLocale,
} from './registry';
export type {
  Skill,
  SkillId,
  ContentPack,
  ContentPackId,
  AnyContentPack,
  LocaleCode,
} from './types';
