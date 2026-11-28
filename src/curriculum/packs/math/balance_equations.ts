import type { ContentPack } from '../../types';
import { MATH_BALANCE_EQUATIONS_SKILL } from '../../skills/math';

/**
 * The pan the unknown weight sits on: always the right one, or either. From the
 * second rule on, the unknown may be found on the left as well.
 */
export type BalanceEquationHiddenSide = 'right' | 'either';

export interface BalanceEquationProgressionItem {
  minLevel: number;
  maxLevel?: number;
  minSum: number;
  maxSum: number;
  minVisibleWeight: number;
  optionCount: number;
  distractorOffsets: readonly number[];
  fallbackMaxOption: number;
  hiddenSide: BalanceEquationHiddenSide;
  /** Weights on the pan with no unknown. */
  fullPanWeights: 2 | 3;
  /** Unknown weights, all equal: one beside a known weight, or two alone (? + ? = 8). */
  hiddenWeights: 1 | 2;
}

// A new rule every few levels (growth table): the unknown on either pan from 6,
// three weights on the full pan from 8, two equal unknowns from 12.
const ITEMS: readonly BalanceEquationProgressionItem[] = [
  {
    minLevel: 1,
    maxLevel: 2,
    minSum: 4,
    maxSum: 7,
    minVisibleWeight: 2,
    optionCount: 3,
    distractorOffsets: [-2, -1, 1, 2],
    fallbackMaxOption: 10,
    hiddenSide: 'right',
    fullPanWeights: 2,
    hiddenWeights: 1,
  },
  {
    minLevel: 3,
    maxLevel: 4,
    minSum: 6,
    maxSum: 10,
    minVisibleWeight: 2,
    optionCount: 3,
    distractorOffsets: [-3, -2, -1, 1, 2, 3],
    fallbackMaxOption: 12,
    hiddenSide: 'right',
    fullPanWeights: 2,
    hiddenWeights: 1,
  },
  {
    minLevel: 5,
    maxLevel: 5,
    minSum: 9,
    maxSum: 14,
    minVisibleWeight: 2,
    optionCount: 4,
    distractorOffsets: [-4, -3, -2, -1, 1, 2, 3, 4],
    fallbackMaxOption: 16,
    hiddenSide: 'right',
    fullPanWeights: 2,
    hiddenWeights: 1,
  },
  {
    minLevel: 6,
    maxLevel: 6,
    minSum: 9,
    maxSum: 14,
    minVisibleWeight: 2,
    optionCount: 4,
    distractorOffsets: [-4, -3, -2, -1, 1, 2, 3, 4],
    fallbackMaxOption: 16,
    hiddenSide: 'either',
    fullPanWeights: 2,
    hiddenWeights: 1,
  },
  {
    minLevel: 7,
    maxLevel: 7,
    minSum: 12,
    maxSum: 18,
    minVisibleWeight: 3,
    optionCount: 4,
    distractorOffsets: [-5, -4, -3, -2, 2, 3, 4, 5],
    fallbackMaxOption: 20,
    hiddenSide: 'either',
    fullPanWeights: 2,
    hiddenWeights: 1,
  },
  {
    minLevel: 8,
    maxLevel: 9,
    minSum: 12,
    maxSum: 18,
    minVisibleWeight: 3,
    optionCount: 4,
    distractorOffsets: [-5, -4, -3, -2, 2, 3, 4, 5],
    fallbackMaxOption: 20,
    hiddenSide: 'either',
    fullPanWeights: 3,
    hiddenWeights: 1,
  },
  {
    minLevel: 10,
    maxLevel: 11,
    minSum: 16,
    maxSum: 24,
    minVisibleWeight: 3,
    optionCount: 4,
    distractorOffsets: [-7, -5, -3, -2, 2, 3, 5, 7],
    fallbackMaxOption: 28,
    hiddenSide: 'either',
    fullPanWeights: 3,
    hiddenWeights: 1,
  },
  {
    minLevel: 12,
    maxLevel: 14,
    minSum: 16,
    maxSum: 24,
    minVisibleWeight: 3,
    optionCount: 4,
    distractorOffsets: [-4, -3, -2, -1, 1, 2, 3, 4],
    fallbackMaxOption: 16,
    hiddenSide: 'either',
    fullPanWeights: 3,
    hiddenWeights: 2,
  },
  {
    minLevel: 15,
    minSum: 21,
    maxSum: 32,
    minVisibleWeight: 4,
    optionCount: 5,
    distractorOffsets: [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5],
    fallbackMaxOption: 20,
    hiddenSide: 'either',
    fullPanWeights: 3,
    hiddenWeights: 2,
  },
];

export function getBalanceEquationProgression(
  items: readonly BalanceEquationProgressionItem[],
  level = 1,
): BalanceEquationProgressionItem {
  const progression = items.find(
    (item) => level >= item.minLevel && (item.maxLevel === undefined || level <= item.maxLevel),
  );
  if (!progression) {
    throw new Error(`No balance equation progression found for level ${level}`);
  }
  return progression;
}

export const MATH_BALANCE_EQUATIONS_PACK: ContentPack<BalanceEquationProgressionItem> = {
  id: 'math.balance_equations.core',
  skillId: MATH_BALANCE_EQUATIONS_SKILL.id,
  locale: 'et',
  version: '1.2.0',
  title: {
    et: 'Tasakaaluvõrrandite astmestik',
    en: 'Balance equation progression',
  },
  items: ITEMS,
};
