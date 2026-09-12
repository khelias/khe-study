import type { ContentPack } from '../../types';
import { MATH_COMPARE_NUMBERS_SKILL } from '../../skills/math';

export type CompareNumberAnswer = 'left' | 'right' | 'equal';
export type CompareNumberDisplayMode =
  'dice' | 'dice_with_numbers' | 'small_dice_or_number' | 'number';

export interface CompareNumberStageItem {
  minLevel: number;
  maxLevel?: number;
  maxValue: number;
  minDifference: number;
  equalChance: number;
  maxDiceValue: number;
  displayMode: CompareNumberDisplayMode;
  showNumbers: boolean;
  symbolOptions: readonly CompareNumberAnswer[];
  smallDiceMaxValue?: number;
  diceModeProbability?: number;
}

const ITEMS: readonly CompareNumberStageItem[] = [
  {
    minLevel: 1,
    maxLevel: 1,
    maxValue: 6,
    minDifference: 2,
    equalChance: 0,
    maxDiceValue: 6,
    displayMode: 'dice',
    showNumbers: false,
    symbolOptions: ['left', 'right'],
  },
  {
    minLevel: 2,
    maxLevel: 3,
    maxValue: 6,
    minDifference: 1,
    equalChance: 0.2,
    maxDiceValue: 6,
    displayMode: 'dice',
    showNumbers: false,
    symbolOptions: ['left', 'right', 'equal'],
  },
  {
    minLevel: 4,
    maxLevel: 5,
    maxValue: 12,
    minDifference: 1,
    equalChance: 0.25,
    maxDiceValue: 6,
    displayMode: 'dice_with_numbers',
    showNumbers: true,
    symbolOptions: ['left', 'right', 'equal'],
  },
  {
    minLevel: 6,
    maxLevel: 7,
    maxValue: 20,
    minDifference: 1,
    equalChance: 0.3,
    maxDiceValue: 6,
    displayMode: 'small_dice_or_number',
    showNumbers: true,
    symbolOptions: ['left', 'right', 'equal'],
    smallDiceMaxValue: 12,
    diceModeProbability: 0.6,
  },
  {
    minLevel: 8,
    maxLevel: 9,
    maxValue: 30,
    minDifference: 1,
    equalChance: 0.35,
    maxDiceValue: 6,
    displayMode: 'small_dice_or_number',
    showNumbers: true,
    symbolOptions: ['left', 'right', 'equal'],
    smallDiceMaxValue: 12,
    diceModeProbability: 0.6,
  },
  {
    minLevel: 10,
    maxLevel: 11,
    maxValue: 50,
    minDifference: 1,
    equalChance: 0.35,
    maxDiceValue: 6,
    displayMode: 'number',
    showNumbers: true,
    symbolOptions: ['left', 'right', 'equal'],
  },
  {
    minLevel: 12,
    maxValue: 100,
    minDifference: 1,
    equalChance: 0.35,
    maxDiceValue: 6,
    displayMode: 'number',
    showNumbers: true,
    symbolOptions: ['left', 'right', 'equal'],
  },
];

export function getCompareNumberStage(
  items: readonly CompareNumberStageItem[],
  effectiveLevel: number,
): CompareNumberStageItem {
  const stage = items.find(
    (item) =>
      effectiveLevel >= item.minLevel &&
      (item.maxLevel === undefined || effectiveLevel <= item.maxLevel),
  );
  if (!stage) {
    throw new Error(`No compare number stage found for level ${effectiveLevel}`);
  }
  return stage;
}

export const MATH_COMPARE_NUMBERS_PACK: ContentPack<CompareNumberStageItem> = {
  id: 'math.compare_numbers.core',
  skillId: MATH_COMPARE_NUMBERS_SKILL.id,
  locale: 'et',
  version: '1.0.0',
  title: {
    et: 'Arvude võrdlemise astmed',
    en: 'Comparing numbers stages',
  },
  items: ITEMS,
};
