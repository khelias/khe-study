import type { ContentPack, LocaleCode } from '../../types';
import {
  MATH_MIXED_PROBLEM_SOLVING_SKILL,
  MATH_MULTIPLICATION_1_TO_10_SKILL,
  MATH_MULTIPLICATION_1_TO_5_SKILL,
} from '../../skills/math';

export type BattleLearnProfile = 'starter' | 'advanced';
export type BattleLearnQuestionFlow = 'initial' | 'followup';
export type BattleLearnCellContentType = 'empty' | 'problem' | 'star' | 'heart';
export type BattleLearnSequencePatternGroup = 'starter_sequence' | 'advanced_pattern';

export type BattleLearnQuestionKind =
  | 'count_ships'
  | 'count_objects'
  | 'simple_addition'
  | 'simple_subtraction'
  | 'greater_than'
  | 'less_than'
  | 'ammunition'
  | 'missing_number_add'
  | 'missing_number_sub'
  | 'word_problem_1'
  | 'word_problem_2'
  | 'two_step'
  | 'time_problem'
  | 'coin_problem'
  | 'navigate'
  | 'sequence_next'
  | 'area'
  | 'perimeter'
  | 'word_problem_3'
  | 'logic_puzzle'
  | 'pattern_next'
  | 'distance'
  | 'multi_move'
  | 'fleet_multiply'
  | 'multiplication_fact'
  | 'formation_count'
  | 'vector_add';

export interface BattleLearnProfileStageItem {
  kind: 'profile_stage';
  profile: BattleLearnProfile;
  minLevel: number;
  maxLevel?: number;
  gridSize: number;
  shipLengths: readonly number[];
}

export interface BattleLearnCellDistributionItem {
  kind: 'cell_distribution';
  weights: readonly {
    cell: BattleLearnCellContentType;
    weight: number;
  }[];
}

export interface BattleLearnQuestionStageItem {
  kind: 'question_stage';
  profile: BattleLearnProfile;
  flow: BattleLearnQuestionFlow;
  minLevel: number;
  maxLevel?: number;
  questionKinds: readonly BattleLearnQuestionKind[];
}

export interface BattleLearnCountObjectLabelsItem {
  kind: 'count_object_labels';
  locale: LocaleCode;
  labels: readonly string[];
}

export interface BattleLearnSequencePatternItem {
  kind: 'sequence_pattern';
  group: BattleLearnSequencePatternGroup;
  sequence: readonly number[];
  answer: number;
}

export interface BattleLearnMultiplicationFactStageItem {
  kind: 'multiplication_fact_stage';
  minLevel: number;
  maxLevel?: number;
  minFactor: number;
  maxFactor: number;
}

export type BattleLearnCurriculumItem =
  | BattleLearnProfileStageItem
  | BattleLearnCellDistributionItem
  | BattleLearnQuestionStageItem
  | BattleLearnCountObjectLabelsItem
  | BattleLearnSequencePatternItem
  | BattleLearnMultiplicationFactStageItem;

const ITEMS: readonly BattleLearnCurriculumItem[] = [
  {
    kind: 'profile_stage',
    profile: 'starter',
    minLevel: 1,
    maxLevel: 1,
    gridSize: 4,
    shipLengths: [2],
  },
  {
    kind: 'profile_stage',
    profile: 'starter',
    minLevel: 2,
    maxLevel: 3,
    gridSize: 4,
    shipLengths: [2, 2],
  },
  {
    kind: 'profile_stage',
    profile: 'starter',
    minLevel: 4,
    maxLevel: 6,
    gridSize: 5,
    shipLengths: [3, 2],
  },
  { kind: 'profile_stage', profile: 'starter', minLevel: 7, gridSize: 6, shipLengths: [3, 2, 2] },
  {
    kind: 'profile_stage',
    profile: 'advanced',
    minLevel: 1,
    maxLevel: 2,
    gridSize: 5,
    shipLengths: [3, 2],
  },
  {
    kind: 'profile_stage',
    profile: 'advanced',
    minLevel: 3,
    maxLevel: 5,
    gridSize: 6,
    shipLengths: [3, 2, 2],
  },
  {
    kind: 'profile_stage',
    profile: 'advanced',
    minLevel: 6,
    maxLevel: 10,
    gridSize: 7,
    shipLengths: [4, 3, 2],
  },
  {
    kind: 'profile_stage',
    profile: 'advanced',
    minLevel: 11,
    gridSize: 8,
    shipLengths: [4, 3, 3, 2],
  },
  {
    kind: 'cell_distribution',
    weights: [
      { cell: 'empty', weight: 0.72 },
      { cell: 'problem', weight: 0.15 },
      { cell: 'star', weight: 0.1 },
      { cell: 'heart', weight: 0.03 },
    ],
  },
  {
    kind: 'question_stage',
    profile: 'starter',
    flow: 'initial',
    minLevel: 1,
    maxLevel: 1,
    questionKinds: ['count_ships', 'simple_addition', 'count_ships'],
  },
  {
    kind: 'question_stage',
    profile: 'starter',
    flow: 'initial',
    minLevel: 2,
    maxLevel: 3,
    questionKinds: [
      'count_ships',
      'count_objects',
      'simple_addition',
      'simple_subtraction',
      'greater_than',
      'less_than',
    ],
  },
  {
    kind: 'question_stage',
    profile: 'starter',
    flow: 'initial',
    minLevel: 4,
    maxLevel: 6,
    questionKinds: [
      'ammunition',
      'missing_number_add',
      'missing_number_sub',
      'word_problem_1',
      'word_problem_2',
      'two_step',
      'time_problem',
      'coin_problem',
      'simple_addition',
      'simple_subtraction',
    ],
  },
  {
    kind: 'question_stage',
    profile: 'starter',
    flow: 'initial',
    minLevel: 7,
    questionKinds: [
      'navigate',
      'sequence_next',
      'area',
      'perimeter',
      'word_problem_3',
      'two_step',
      'logic_puzzle',
    ],
  },
  {
    kind: 'question_stage',
    profile: 'advanced',
    flow: 'initial',
    minLevel: 1,
    maxLevel: 5,
    questionKinds: [
      'pattern_next',
      'distance',
      'word_problem_3',
      'navigate',
      'area',
      'pattern_next',
      'distance',
    ],
  },
  {
    kind: 'question_stage',
    profile: 'advanced',
    flow: 'initial',
    minLevel: 6,
    maxLevel: 10,
    questionKinds: [
      'multi_move',
      'fleet_multiply',
      'formation_count',
      'distance',
      'word_problem_3',
      'area',
      'fleet_multiply',
      'multi_move',
    ],
  },
  {
    kind: 'question_stage',
    profile: 'advanced',
    flow: 'initial',
    minLevel: 11,
    questionKinds: [
      'vector_add',
      'multi_move',
      'fleet_multiply',
      'formation_count',
      'distance',
      'vector_add',
      'multi_move',
    ],
  },
  {
    kind: 'question_stage',
    profile: 'starter',
    flow: 'followup',
    minLevel: 1,
    maxLevel: 3,
    questionKinds: [
      'count_ships',
      'count_objects',
      'simple_addition',
      'simple_subtraction',
      'greater_than',
      'less_than',
    ],
  },
  {
    kind: 'question_stage',
    profile: 'starter',
    flow: 'followup',
    minLevel: 4,
    maxLevel: 6,
    questionKinds: [
      'ammunition',
      'missing_number_add',
      'missing_number_sub',
      'word_problem_1',
      'word_problem_2',
      'two_step',
      'time_problem',
      'coin_problem',
      'simple_addition',
      'simple_subtraction',
    ],
  },
  {
    kind: 'question_stage',
    profile: 'starter',
    flow: 'followup',
    minLevel: 7,
    questionKinds: [
      'word_problem_3',
      'navigate',
      'two_step',
      'sequence_next',
      'area',
      'perimeter',
      'logic_puzzle',
    ],
  },
  {
    kind: 'question_stage',
    profile: 'advanced',
    flow: 'followup',
    minLevel: 1,
    maxLevel: 5,
    questionKinds: [
      'pattern_next',
      'distance',
      'word_problem_3',
      'navigate',
      'area',
      'perimeter',
      'logic_puzzle',
    ],
  },
  {
    kind: 'question_stage',
    profile: 'advanced',
    flow: 'followup',
    minLevel: 6,
    maxLevel: 10,
    questionKinds: [
      'multi_move',
      'fleet_multiply',
      'formation_count',
      'distance',
      'word_problem_3',
      'area',
      'perimeter',
      'time_problem',
      'coin_problem',
    ],
  },
  {
    kind: 'question_stage',
    profile: 'advanced',
    flow: 'followup',
    minLevel: 11,
    questionKinds: [
      'vector_add',
      'multi_move',
      'fleet_multiply',
      'formation_count',
      'distance',
      'logic_puzzle',
    ],
  },
  {
    kind: 'count_object_labels',
    locale: 'et',
    labels: ['laeva', 'torpeedot', 'meremeest', 'kahurit'],
  },
  {
    kind: 'count_object_labels',
    locale: 'en',
    labels: ['ships', 'torpedoes', 'sailors', 'cannons'],
  },
  { kind: 'sequence_pattern', group: 'starter_sequence', sequence: [2, 4, 6], answer: 8 },
  { kind: 'sequence_pattern', group: 'starter_sequence', sequence: [5, 10, 15], answer: 20 },
  { kind: 'sequence_pattern', group: 'starter_sequence', sequence: [1, 3, 5], answer: 7 },
  { kind: 'sequence_pattern', group: 'starter_sequence', sequence: [10, 20, 30], answer: 40 },
  { kind: 'sequence_pattern', group: 'starter_sequence', sequence: [3, 6, 9], answer: 12 },
  { kind: 'sequence_pattern', group: 'advanced_pattern', sequence: [2, 4, 8], answer: 16 },
  { kind: 'sequence_pattern', group: 'advanced_pattern', sequence: [5, 10, 15], answer: 20 },
  { kind: 'sequence_pattern', group: 'advanced_pattern', sequence: [3, 6, 12], answer: 24 },
  { kind: 'sequence_pattern', group: 'advanced_pattern', sequence: [1, 3, 5], answer: 7 },
  { kind: 'sequence_pattern', group: 'advanced_pattern', sequence: [10, 20, 30], answer: 40 },
  { kind: 'sequence_pattern', group: 'advanced_pattern', sequence: [1, 2, 4], answer: 8 },
  { kind: 'sequence_pattern', group: 'advanced_pattern', sequence: [3, 9, 27], answer: 81 },
];

const MULTIPLICATION_SHARED_ITEMS: readonly BattleLearnCurriculumItem[] = [
  {
    kind: 'profile_stage',
    profile: 'starter',
    minLevel: 1,
    maxLevel: 2,
    gridSize: 4,
    shipLengths: [2],
  },
  {
    kind: 'profile_stage',
    profile: 'starter',
    minLevel: 3,
    maxLevel: 5,
    gridSize: 5,
    shipLengths: [3, 2],
  },
  { kind: 'profile_stage', profile: 'starter', minLevel: 6, gridSize: 6, shipLengths: [3, 2, 2] },
  {
    kind: 'profile_stage',
    profile: 'advanced',
    minLevel: 1,
    maxLevel: 3,
    gridSize: 5,
    shipLengths: [3, 2],
  },
  {
    kind: 'profile_stage',
    profile: 'advanced',
    minLevel: 4,
    maxLevel: 7,
    gridSize: 6,
    shipLengths: [3, 2, 2],
  },
  {
    kind: 'profile_stage',
    profile: 'advanced',
    minLevel: 8,
    gridSize: 7,
    shipLengths: [4, 3, 2],
  },
  {
    kind: 'cell_distribution',
    weights: [
      { cell: 'empty', weight: 0.7 },
      { cell: 'problem', weight: 0.18 },
      { cell: 'star', weight: 0.09 },
      { cell: 'heart', weight: 0.03 },
    ],
  },
  {
    kind: 'question_stage',
    profile: 'starter',
    flow: 'initial',
    minLevel: 1,
    questionKinds: ['multiplication_fact'],
  },
  {
    kind: 'question_stage',
    profile: 'starter',
    flow: 'followup',
    minLevel: 1,
    questionKinds: ['multiplication_fact'],
  },
  {
    kind: 'question_stage',
    profile: 'advanced',
    flow: 'initial',
    minLevel: 1,
    questionKinds: ['multiplication_fact', 'fleet_multiply', 'multiplication_fact'],
  },
  {
    kind: 'question_stage',
    profile: 'advanced',
    flow: 'followup',
    minLevel: 1,
    questionKinds: ['multiplication_fact', 'fleet_multiply', 'multiplication_fact'],
  },
];

const MULTIPLICATION_ITEMS: readonly BattleLearnCurriculumItem[] = [
  ...MULTIPLICATION_SHARED_ITEMS,
  { kind: 'multiplication_fact_stage', minLevel: 1, maxLevel: 2, minFactor: 2, maxFactor: 5 },
  { kind: 'multiplication_fact_stage', minLevel: 3, maxLevel: 5, minFactor: 2, maxFactor: 7 },
  { kind: 'multiplication_fact_stage', minLevel: 6, minFactor: 2, maxFactor: 10 },
];

const MULTIPLICATION_1_5_ITEMS: readonly BattleLearnCurriculumItem[] = [
  ...MULTIPLICATION_SHARED_ITEMS,
  { kind: 'multiplication_fact_stage', minLevel: 1, maxLevel: 2, minFactor: 2, maxFactor: 3 },
  { kind: 'multiplication_fact_stage', minLevel: 3, maxLevel: 5, minFactor: 2, maxFactor: 4 },
  { kind: 'multiplication_fact_stage', minLevel: 6, minFactor: 2, maxFactor: 5 },
];

function levelMatches(item: { minLevel: number; maxLevel?: number }, level: number): boolean {
  return level >= item.minLevel && (item.maxLevel === undefined || level <= item.maxLevel);
}

export function getBattleLearnProfileStage(
  items: readonly BattleLearnCurriculumItem[],
  profile: BattleLearnProfile,
  level: number,
): BattleLearnProfileStageItem {
  const stage = items.find(
    (item): item is BattleLearnProfileStageItem =>
      item.kind === 'profile_stage' && item.profile === profile && levelMatches(item, level),
  );
  if (!stage) {
    throw new Error(`Missing BattleLearn profile stage for ${profile} level ${level}`);
  }
  return stage;
}

export function getBattleLearnCellDistribution(
  items: readonly BattleLearnCurriculumItem[],
): BattleLearnCellDistributionItem {
  const distribution = items.find(
    (item): item is BattleLearnCellDistributionItem => item.kind === 'cell_distribution',
  );
  if (!distribution) {
    throw new Error('Missing BattleLearn cell distribution');
  }
  return distribution;
}

export function getBattleLearnQuestionStage(
  items: readonly BattleLearnCurriculumItem[],
  flow: BattleLearnQuestionFlow,
  profile: BattleLearnProfile,
  level: number,
): BattleLearnQuestionStageItem {
  const stage = items.find(
    (item): item is BattleLearnQuestionStageItem =>
      item.kind === 'question_stage' &&
      item.flow === flow &&
      item.profile === profile &&
      levelMatches(item, level),
  );
  if (!stage) {
    throw new Error(`Missing BattleLearn ${flow} question stage for ${profile} level ${level}`);
  }
  return stage;
}

export function getBattleLearnCountObjectLabels(
  items: readonly BattleLearnCurriculumItem[],
  locale: LocaleCode,
): readonly string[] {
  const labels = items.find(
    (item): item is BattleLearnCountObjectLabelsItem =>
      item.kind === 'count_object_labels' && item.locale === locale,
  );
  if (!labels || labels.labels.length === 0) {
    throw new Error(`Missing BattleLearn count-object labels for locale ${locale}`);
  }
  return labels.labels;
}

export function getBattleLearnSequencePatterns(
  items: readonly BattleLearnCurriculumItem[],
  group: BattleLearnSequencePatternGroup,
): readonly BattleLearnSequencePatternItem[] {
  const patterns = items.filter(
    (item): item is BattleLearnSequencePatternItem =>
      item.kind === 'sequence_pattern' && item.group === group,
  );
  if (patterns.length === 0) {
    throw new Error(`Missing BattleLearn sequence patterns for ${group}`);
  }
  return patterns;
}

export function getBattleLearnMultiplicationFactStage(
  items: readonly BattleLearnCurriculumItem[],
  level: number,
): BattleLearnMultiplicationFactStageItem {
  const stage = items.find(
    (item): item is BattleLearnMultiplicationFactStageItem =>
      item.kind === 'multiplication_fact_stage' && levelMatches(item, level),
  );
  if (!stage) {
    throw new Error(`Missing BattleLearn multiplication fact stage for level ${level}`);
  }
  return stage;
}

export const MATH_BATTLELEARN_PACK: ContentPack<BattleLearnCurriculumItem> = {
  id: 'math.mixed_problem_solving.battlelearn',
  skillId: MATH_MIXED_PROBLEM_SOLVING_SKILL.id,
  locale: 'et',
  version: '1.0.0',
  title: {
    et: 'BattleLearni probleemülesannete astmestik',
    en: 'BattleLearn problem progression',
  },
  items: ITEMS,
};

export const MATH_BATTLELEARN_MULTIPLICATION_PACK: ContentPack<BattleLearnCurriculumItem> = {
  id: 'math.multiplication_1_10.battlelearn',
  skillId: MATH_MULTIPLICATION_1_TO_10_SKILL.id,
  locale: 'et',
  version: '1.0.0',
  title: {
    et: 'Laevade uputamise korrutustabel',
    en: 'BattleLearn multiplication table',
  },
  items: MULTIPLICATION_ITEMS,
};

export const MATH_BATTLELEARN_MULTIPLICATION_1_5_PACK: ContentPack<BattleLearnCurriculumItem> = {
  id: 'math.multiplication_1_5.battlelearn',
  skillId: MATH_MULTIPLICATION_1_TO_5_SKILL.id,
  locale: 'et',
  version: '1.0.0',
  title: {
    et: 'Laevade uputamise korrutustabel 1-5',
    en: 'BattleLearn multiplication 1-5',
  },
  items: MULTIPLICATION_1_5_ITEMS,
};
