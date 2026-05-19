import type { Skill } from '../types';

// Every math-snake card is a focused skill. One pack per skill, one binding
// per pack — no "mixed" catch-all.

export const MATH_ADDITION_WITHIN_20_SKILL: Skill = {
  id: 'math.addition_within_20',
  name: { et: 'Liitmine kuni 20', en: 'Addition within 20' },
  taxonomy: {
    subject: 'matemaatika',
    grade: 1,
    level: 'foundation',
    topic: 'math.addition.within_20',
  },
};

export const MATH_ADDITION_WITHIN_100_SKILL: Skill = {
  id: 'math.addition_within_100',
  name: { et: 'Liitmine kuni 100', en: 'Addition within 100' },
  taxonomy: {
    subject: 'matemaatika',
    grade: 3,
    level: 'intermediate',
    topic: 'math.addition.within_100',
  },
  prerequisites: ['math.addition_within_20'],
};

export const MATH_SUBTRACTION_WITHIN_20_SKILL: Skill = {
  id: 'math.subtraction_within_20',
  name: { et: 'Lahutamine kuni 20', en: 'Subtraction within 20' },
  taxonomy: {
    subject: 'matemaatika',
    grade: 1,
    level: 'foundation',
    topic: 'math.subtraction.within_20',
  },
  prerequisites: ['math.addition_within_20'],
};

export const MATH_SUBTRACTION_WITHIN_100_SKILL: Skill = {
  id: 'math.subtraction_within_100',
  name: { et: 'Lahutamine kuni 100', en: 'Subtraction within 100' },
  taxonomy: {
    subject: 'matemaatika',
    grade: 3,
    level: 'intermediate',
    topic: 'math.subtraction.within_100',
  },
  prerequisites: ['math.subtraction_within_20'],
};

/**
 * Multiplication facts 1–5: 2. klass foundation. Factors 2 through 5,
 * 16 unique products — the canonical set Estonian põhikool ainekava expects
 * mastered by the end of grade 2.
 */
export const MATH_MULTIPLICATION_1_TO_5_SKILL: Skill = {
  id: 'math.multiplication_1_to_5',
  name: { et: 'Korrutustabel 1–5', en: 'Multiplication 1–5' },
  taxonomy: {
    subject: 'matemaatika',
    grade: 2,
    level: 'foundation',
    topic: 'math.multiplication.small_factors',
  },
};

/**
 * Full multiplication table 1–10: grade 3 target. Factors 2 through 10,
 * 81 unique products covering the full põhikool 3. klass curriculum goal.
 */
export const MATH_MULTIPLICATION_1_TO_10_SKILL: Skill = {
  id: 'math.multiplication_1_to_10',
  name: { et: 'Korrutustabel 1–10', en: 'Multiplication 1–10' },
  taxonomy: {
    subject: 'matemaatika',
    grade: 3,
    level: 'intermediate',
    topic: 'math.multiplication.full_table',
  },
  prerequisites: ['math.multiplication_1_to_5'],
};

/**
 * Division facts 1–5: 3. klass — the inverse of multiplication 1–5.
 * Quotient and divisor both 2–5; 16 unique facts mirroring the
 * multiplication 1–5 set (dividend ÷ divisor = quotient).
 */
export const MATH_DIVISION_FACTS_1_TO_5_SKILL: Skill = {
  id: 'math.division_facts_1_to_5',
  name: { et: 'Jagamine 1–5', en: 'Division 1–5' },
  taxonomy: {
    subject: 'matemaatika',
    grade: 3,
    level: 'foundation',
    topic: 'math.division.small_factors',
  },
  prerequisites: ['math.multiplication_1_to_5'],
};

/**
 * Division facts 1–10: 3.–4. klass — the inverse of the full times table.
 * Quotient and divisor both 2–10; mirrors multiplication 1–10.
 */
export const MATH_DIVISION_FACTS_1_TO_10_SKILL: Skill = {
  id: 'math.division_facts_1_to_10',
  name: { et: 'Jagamine 1–10', en: 'Division 1–10' },
  taxonomy: {
    subject: 'matemaatika',
    grade: 3,
    level: 'intermediate',
    topic: 'math.division.full_table',
  },
  prerequisites: ['math.division_facts_1_to_5', 'math.multiplication_1_to_10'],
};

/**
 * Spatial reasoning over geometric shapes: rotate, place, and assemble pieces.
 * Bound to shape_shift (Tangram-style puzzles).
 */
export const MATH_GEOMETRY_SHAPES_SPATIAL_SKILL: Skill = {
  id: 'math.geometry_shapes_spatial',
  name: { et: 'Kujundite ruumiline arutlus', en: 'Spatial shape reasoning' },
  taxonomy: {
    subject: 'matemaatika',
    grade: 1,
    level: 'foundation',
    topic: 'math.geometry.spatial_reasoning',
  },
};

/**
 * Verbal recognition of shape names: "which is a triangle?", "how many sides?".
 * Bound to shape_dash (runner with shape-name gates).
 */
export const MATH_GEOMETRY_SHAPES_VERBAL_SKILL: Skill = {
  id: 'math.geometry_shapes_verbal',
  name: { et: 'Kujundite nimetamine', en: 'Shape names' },
  taxonomy: {
    subject: 'matemaatika',
    grade: 1,
    level: 'foundation',
    topic: 'math.geometry.shape_names',
  },
};

export const MATH_PATTERN_SEQUENCES_SKILL: Skill = {
  id: 'math.pattern_sequences',
  name: { et: 'Mustrijadad', en: 'Pattern sequences' },
  taxonomy: {
    subject: 'matemaatika',
    grade: 1,
    level: 'foundation',
    topic: 'math.patterns.sequences',
  },
};

export const MATH_UNIT_CONVERSIONS_SKILL: Skill = {
  id: 'math.unit_conversions',
  name: { et: 'Ühikute teisendamine', en: 'Unit conversions' },
  taxonomy: {
    subject: 'matemaatika',
    grade: 3,
    level: 'foundation',
    topic: 'math.measurement.unit_conversions',
  },
};

export const MATH_COMPARE_NUMBERS_SKILL: Skill = {
  id: 'math.compare_numbers',
  name: { et: 'Arvude võrdlemine', en: 'Comparing numbers' },
  taxonomy: {
    subject: 'matemaatika',
    grade: 1,
    level: 'foundation',
    topic: 'math.numbers.comparison',
  },
};

export const MATH_TIME_READING_SKILL: Skill = {
  id: 'math.time_reading',
  name: { et: 'Kellaaja lugemine', en: 'Reading time' },
  taxonomy: {
    subject: 'matemaatika',
    grade: 2,
    level: 'foundation',
    topic: 'math.measurement.time_reading',
  },
};

export const MATH_BALANCE_EQUATIONS_SKILL: Skill = {
  id: 'math.balance_equations',
  name: { et: 'Tasakaaluvõrrandid', en: 'Balance equations' },
  taxonomy: {
    subject: 'matemaatika',
    grade: 2,
    level: 'foundation',
    topic: 'math.algebra.balance_equations',
  },
};

export const MATH_ADDITION_MEMORY_SKILL: Skill = {
  id: 'math.addition_memory',
  name: { et: 'Liitmistehete meeldejätmine', en: 'Addition memory' },
  taxonomy: {
    subject: 'matemaatika',
    grade: 1,
    level: 'foundation',
    topic: 'math.addition.memory_matching',
  },
};

export const MATH_GRID_NAVIGATION_SKILL: Skill = {
  id: 'math.grid_navigation',
  name: { et: 'Ruudustikul liikumine', en: 'Grid navigation' },
  taxonomy: {
    subject: 'matemaatika',
    grade: 2,
    level: 'foundation',
    topic: 'math.geometry.grid_navigation',
  },
};

export const MATH_MIXED_PROBLEM_SOLVING_SKILL: Skill = {
  id: 'math.mixed_problem_solving',
  name: { et: 'Segatüüpi probleemülesanded', en: 'Mixed problem solving' },
  taxonomy: {
    subject: 'matemaatika',
    grade: 3,
    level: 'intermediate',
    topic: 'math.problem_solving.mixed',
  },
  prerequisites: ['math.addition_within_20', 'math.subtraction_within_20', 'math.grid_navigation'],
};
