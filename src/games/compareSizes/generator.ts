import { getPackItems } from '../../curriculum';
import {
  MATH_COMPARE_NUMBERS_PACK,
  getCompareNumberStage,
  type CompareNumberStageItem,
} from '../../curriculum/packs/math/compare_numbers';
import { uid } from '../../engine/rng';
import type { CompareSizesProblem, RngFunction } from '../../types/game';

export function generateCompareSizes(
  level: number,
  rng: RngFunction = Math.random,
): CompareSizesProblem {
  const effectiveLevel = level;
  const stage = getCompareNumberStage(
    getPackItems<CompareNumberStageItem>(MATH_COMPARE_NUMBERS_PACK.id),
    effectiveLevel,
  );

  // REDESIGNED Level progression - More challenging and balanced:
  // 1: Dice (1-6) with symbols - concrete visual + symbol practice
  // 2-3: Dice (1-6) with symbols, introduce equality
  // 4-5: Dice + Numbers (1-12, double dice) with all symbols
  // 6-7: Numbers (1-20) with closer values and all symbols
  // 8-9: Mixed: dice/numbers (1-30) with smaller gaps
  // 10+: Numbers (1-50+) with very close values

  const showSymbols = true; // Always show symbols - this is the focus!

  let leftValue: number;
  let rightValue: number;
  let answer: 'left' | 'right' | 'equal';

  if (rng() < stage.equalChance) {
    // Equal case
    leftValue = Math.floor(rng() * stage.maxValue) + 1;
    rightValue = leftValue;
    answer = 'equal';
  } else {
    // Different values - use smaller gaps for more challenge
    leftValue = Math.floor(rng() * stage.maxValue) + 1;

    // Ensure minimum difference but prefer smaller gaps at higher levels
    let rightValue_temp: number;
    let attempts = 0;
    const MAX_DIFFICULTY_GAP = 5;
    const maxGap =
      effectiveLevel <= 3
        ? stage.maxValue
        : Math.min(MAX_DIFFICULTY_GAP, Math.floor(stage.maxValue / 4));
    const RANDOM_VALUE_CHANCE = 0.3; // 30% chance for any value

    do {
      // At higher levels, prefer values close to leftValue for increased difficulty
      if (effectiveLevel >= 6 && rng() > RANDOM_VALUE_CHANCE) {
        // 70% chance to generate a nearby value
        const offset = Math.floor(rng() * maxGap) + stage.minDifference;
        rightValue_temp = rng() > 0.5 ? leftValue + offset : leftValue - offset;
        // Clamp to valid range
        rightValue_temp = Math.max(1, Math.min(stage.maxValue, rightValue_temp));
      } else {
        // 30% chance for any value (or always at lower levels)
        rightValue_temp = Math.floor(rng() * stage.maxValue) + 1;
      }
      attempts++;
    } while (Math.abs(leftValue - rightValue_temp) < stage.minDifference && attempts < 20);

    rightValue = rightValue_temp;
    answer = leftValue > rightValue ? 'left' : 'right';
  }

  // Determine representation mode - prefer visual at higher levels without numbers
  let representationMode: 'dice' | 'number' = 'number';

  if (stage.displayMode === 'dice') {
    // Pure dice mode (levels 1-3)
    representationMode = 'dice';
  } else if (stage.displayMode === 'dice_with_numbers') {
    // Dice with numbers (levels 4-5)
    representationMode = 'dice';
  } else if (
    stage.displayMode === 'small_dice_or_number' &&
    leftValue <= (stage.smallDiceMaxValue ?? stage.maxDiceValue) &&
    rightValue <= (stage.smallDiceMaxValue ?? stage.maxDiceValue)
  ) {
    // At levels 6-9, use dice for smaller numbers (more visual challenge)
    representationMode = rng() > 1 - (stage.diceModeProbability ?? 0) ? 'dice' : 'number';
  }
  const showNumbers = stage.showNumbers || representationMode === 'number';

  // Create visual representations
  const leftVisual =
    representationMode === 'dice' ? '🎲'.repeat(Math.min(leftValue, stage.maxDiceValue)) : '';
  const rightVisual =
    representationMode === 'dice' ? '🎲'.repeat(Math.min(rightValue, stage.maxDiceValue)) : '';

  // Create display strings
  const leftDisplay =
    showNumbers || representationMode === 'number' ? String(leftValue) : leftVisual;
  const rightDisplay =
    showNumbers || representationMode === 'number' ? String(rightValue) : rightVisual;

  // ALWAYS provide symbol options (>, <, =) based on level
  const options: Array<'left' | 'right' | 'equal'> = [...stage.symbolOptions];

  return {
    type: 'compare_sizes',
    leftItem: {
      value: leftValue,
      display: leftDisplay,
      visual: leftVisual,
    },
    rightItem: {
      value: rightValue,
      display: rightDisplay,
      visual: rightVisual,
    },
    answer,
    options,
    showNumbers,
    showSymbols,
    uid: uid(rng),
  };
}
