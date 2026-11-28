/**
 * Growth of the raft's math quizzes (growth table, Phase 1.7 Run 7): each pack
 * is one level ladder where level N+1 is never easier than N and every
 * authored stage is reached, and each generator plays its level's stage.
 */
import { describe, expect, it } from 'vitest';
import { createRng } from '../../engine/rng';
import { generateBalanceScale, panSums } from '../balanceScale/generator';
import { generateCompareSizes } from '../compareSizes/generator';
import { generateTimeMatch } from '../timeMatch/generator';
import { generateUnitConversion } from '../unitConversion/generator';
import {
  MATH_BALANCE_EQUATIONS_PACK,
  getBalanceEquationProgression,
} from '../../curriculum/packs/math/balance_equations';
import {
  MATH_COMPARE_NUMBERS_PACK,
  getCompareNumberStage,
} from '../../curriculum/packs/math/compare_numbers';
import {
  MATH_TIME_READING_PACK,
  getTimeReadingStage,
} from '../../curriculum/packs/math/time_reading';
import {
  MATH_UNIT_CONVERSIONS_PACK,
  getUnitConversionItems,
  getUnitConversionStage,
  type UnitConversionStageItem,
} from '../../curriculum/packs/math/unit_conversions';

const LEVELS = Array.from({ length: 30 }, (_, i) => i + 1);
const SEEDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

/** Every measure of difficulty at level N+1 is at least the one at N (lower is easier). */
function expectNeverEasier(measures: (level: number) => readonly number[]): void {
  for (const level of LEVELS.slice(1)) {
    const before = measures(level - 1);
    const now = measures(level);
    now.forEach((value, i) => {
      expect(value, `level ${level}, measure ${i}`).toBeGreaterThanOrEqual(before[i] ?? 0);
    });
  }
}

function expectEveryStageReached<T>(stages: readonly T[], stageAt: (level: number) => T): void {
  const reached = new Set(LEVELS.map(stageAt));
  expect(stages.filter((stage) => !reached.has(stage))).toEqual([]);
}

describe('balance_scale growth', () => {
  const stageAt = (level: number) =>
    getBalanceEquationProgression(MATH_BALANCE_EQUATIONS_PACK.items, level);

  it('is never easier a level up, and every stage is reached', () => {
    expectNeverEasier((level) => {
      const s = stageAt(level);
      return [
        s.minSum,
        s.maxSum,
        s.optionCount,
        s.minVisibleWeight,
        s.hiddenSide === 'either' ? 1 : 0,
        s.fullPanWeights,
        s.hiddenWeights,
      ];
    });
    expectEveryStageReached(MATH_BALANCE_EQUATIONS_PACK.items, stageAt);
  });

  it('plays each level by its rule, and every scale balances at the answer', () => {
    for (const level of LEVELS) {
      const stage = stageAt(level);
      const sides = new Set<string>();
      for (const seed of SEEDS) {
        const problem = generateBalanceScale(level, createRng(seed));
        const { hidden } = problem.display;
        const full = hidden.side === 'left' ? problem.display.right : problem.display.left;
        const sums = panSums(problem, problem.answer);
        sides.add(hidden.side);

        expect(sums.left).toBe(sums.right);
        expect(sums.left).toBeGreaterThanOrEqual(stage.minSum);
        expect(sums.left).toBeLessThanOrEqual(stage.maxSum);
        expect(full).toHaveLength(stage.fullPanWeights);
        expect(full.every((weight) => weight >= stage.minVisibleWeight)).toBe(true);
        expect(hidden.count).toBe(stage.hiddenWeights);
        expect(problem.options).toHaveLength(stage.optionCount);
        expect(problem.options).toContain(problem.answer);
        expect(problem.answer).toBeGreaterThan(0);
      }
      expect([...sides].sort()).toEqual(
        stage.hiddenSide === 'either' ? ['left', 'right'] : ['right'],
      );
    }
  });
});

describe('compare_sizes growth', () => {
  const stageAt = (level: number) => getCompareNumberStage(MATH_COMPARE_NUMBERS_PACK.items, level);
  const DISPLAY_ORDER = ['dice', 'dice_with_numbers', 'small_dice_or_number', 'number'];

  it('is never easier a level up, and every stage is reached', () => {
    expectNeverEasier((level) => {
      const s = stageAt(level);
      return [
        s.maxValue,
        s.symbolOptions.length,
        s.equalChance,
        -s.minDifference,
        DISPLAY_ORDER.indexOf(s.displayMode),
      ];
    });
    expectEveryStageReached(MATH_COMPARE_NUMBERS_PACK.items, stageAt);
  });

  it('plays each level within its stage', () => {
    for (const level of LEVELS) {
      const stage = stageAt(level);
      for (const seed of SEEDS) {
        const problem = generateCompareSizes(level, createRng(seed));
        expect(problem.leftItem.value).toBeLessThanOrEqual(stage.maxValue);
        expect(problem.rightItem.value).toBeLessThanOrEqual(stage.maxValue);
        expect(stage.symbolOptions).toContain(problem.answer);
      }
    }
  });
});

describe('unit_conversion growth', () => {
  const stages = MATH_UNIT_CONVERSIONS_PACK.items.filter(
    (item): item is UnitConversionStageItem => item.kind === 'stage',
  );
  const stageAt = (level: number) =>
    getUnitConversionStage(MATH_UNIT_CONVERSIONS_PACK.items, level);
  const conversions = getUnitConversionItems(MATH_UNIT_CONVERSIONS_PACK.items);

  it('is never easier a level up, and every stage is reached', () => {
    expectNeverEasier((level) => {
      const s = stageAt(level);
      return [s.minValue, s.maxValue, s.conversionIds.length, s.optionCount];
    });
    for (const level of LEVELS.slice(1)) {
      // A level up never drops a conversion the level below asked for.
      expect(stageAt(level).conversionIds).toEqual(
        expect.arrayContaining([...stageAt(level - 1).conversionIds]),
      );
    }
    expectEveryStageReached(stages, stageAt);
  });

  it('keeps litres to decilitres from level 6 on', () => {
    for (const level of LEVELS.filter((l) => l >= 6)) {
      expect(stageAt(level).conversionIds).toContain('volume_l_dl');
    }
  });

  it('plays each level within its stage', () => {
    for (const level of LEVELS) {
      const stage = stageAt(level);
      for (const seed of SEEDS) {
        const problem = generateUnitConversion(level, createRng(seed));
        const source = conversions.find(
          (c) => c.from === problem.fromUnit && c.to === problem.toUnit,
        );
        expect(source && stage.conversionIds.includes(source.id)).toBe(true);
        expect(problem.value).toBeGreaterThanOrEqual(stage.minValue);
        expect(problem.value).toBeLessThanOrEqual(stage.maxValue);
        expect(problem.options).toHaveLength(stage.optionCount);
      }
    }
  });
});

describe('time_match growth', () => {
  const stageAt = (level: number) => getTimeReadingStage(MATH_TIME_READING_PACK.items, level);

  it('is never easier a level up, and every stage is reached', () => {
    expectNeverEasier((level) => {
      const s = stageAt(level);
      return [-s.stepMinutes, s.optionCount, s.labelStyle === 'digital' ? 1 : 0];
    });
    expectEveryStageReached(MATH_TIME_READING_PACK.items, stageAt);
  });

  it('plays each level within its stage', () => {
    for (const level of LEVELS) {
      const stage = stageAt(level);
      for (const seed of SEEDS) {
        const problem = generateTimeMatch(level, createRng(seed));
        expect(problem.options).toHaveLength(stage.optionCount);
        expect(problem.minutes % stage.stepMinutes).toBe(0);
        expect(problem.labelStyle).toBe(stage.labelStyle);
      }
    }
  });
});
