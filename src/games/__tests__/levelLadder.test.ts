import { beforeEach, describe, expect, it } from 'vitest';
import '../registrations';
import { getTrackLevel } from '../../curriculum/levelLadder';
import { createRng } from '../../engine/rng';
import { setLocale } from '../../i18n';
import { generateUnitConversion } from '../unitConversion/generator';
import { generateMemoryMath } from '../memoryMath/generator';
import { generateSyllableBuilder } from '../syllableBuilder/generator';
import { generateRoboPath } from '../roboPath/generator';
import { generateBattleLearn } from '../battlelearn/generator';
import { generatePattern } from '../pattern/generator';
import {
  MATH_UNIT_CONVERSIONS_PACK,
  getUnitConversionItems,
  type UnitConversionStageItem,
} from '../../curriculum/packs/math/unit_conversions';
import {
  MATH_ADDITION_MEMORY_PACK,
  type MemoryMathProgressionItem,
} from '../../curriculum/packs/math/addition_memory';
import { LANGUAGE_SYLLABIFICATION_ET_PACK } from '../../curriculum/packs/language/syllables_et';
import { getSyllableWordsForLevel } from '../../curriculum/packs/language/types';
import {
  MATH_GRID_NAVIGATION_PACK,
  getRoboPathProfile,
} from '../../curriculum/packs/math/grid_navigation';
import {
  MATH_BATTLELEARN_PACK,
  type BattleLearnCurriculumItem,
} from '../../curriculum/packs/math/battlelearn';
import { getPatternTemplatesForLevel } from '../../curriculum/packs/math/pattern_sequences';
import { MATH_PATTERN_SEQUENCES_PACK } from '../../curriculum/packs/math/pattern_sequences';

const SEEDS = [1, 2, 3, 4, 5, 6, 7, 8];

interface Staged {
  profile: 'starter' | 'advanced';
  minLevel: number;
}

/** The first stage of a track, or its last (highest minLevel). */
function stageOf<T extends Staged>(
  items: readonly T[],
  profile: Staged['profile'],
  which: 'first' | 'last',
): T {
  const track = items.filter((item) => item.profile === profile);
  const sorted = [...track].sort((a, b) => a.minLevel - b.minLevel);
  const stage = which === 'first' ? sorted[0] : sorted[sorted.length - 1];
  if (!stage) throw new Error(`No ${profile} stage`);
  return stage;
}

describe('one level ladder over starter and advanced tracks', () => {
  beforeEach(() => setLocale('et'));

  it('maps levels 1-5 to the starter track and level 6 up to advanced, shifted by 5', () => {
    expect(getTrackLevel(1)).toEqual({ track: 'starter', stageLevel: 1 });
    expect(getTrackLevel(5)).toEqual({ track: 'starter', stageLevel: 5 });
    expect(getTrackLevel(6)).toEqual({ track: 'advanced', stageLevel: 1 });
    expect(getTrackLevel(20)).toEqual({ track: 'advanced', stageLevel: 15 });
  });

  describe('unit_conversion', () => {
    const stages = MATH_UNIT_CONVERSIONS_PACK.items.filter(
      (item): item is UnitConversionStageItem => item.kind === 'stage',
    );
    const conversions = getUnitConversionItems(MATH_UNIT_CONVERSIONS_PACK.items);

    it.each([
      [1, stageOf(stages, 'starter', 'first')],
      [6, stageOf(stages, 'advanced', 'first')],
      [20, stageOf(stages, 'advanced', 'last')],
    ])('level %i uses the expected stage', (level, stage) => {
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
    });
  });

  describe('memory_math', () => {
    const stages: readonly MemoryMathProgressionItem[] = MATH_ADDITION_MEMORY_PACK.items;

    it.each([
      [1, stageOf(stages, 'starter', 'first')],
      [6, stageOf(stages, 'advanced', 'first')],
      [20, stageOf(stages, 'advanced', 'last')],
    ])('level %i uses the expected stage', (level, stage) => {
      for (const seed of SEEDS) {
        const problem = generateMemoryMath(level, createRng(seed));
        expect(problem.cards).toHaveLength(stage.cardCount);
        for (const pair of problem.pairs) {
          expect(pair.ans).toBeGreaterThanOrEqual(stage.minAnswerSum);
          expect(pair.ans).toBeLessThanOrEqual(stage.maxAnswerSum);
        }
      }
    });
  });

  describe('syllable_builder', () => {
    const words = LANGUAGE_SYLLABIFICATION_ET_PACK.items;

    it.each([
      [1, 'starter', 1],
      [6, 'advanced', 1],
      [20, 'advanced', 15],
    ] as const)('level %i draws from the %s track at its level %i', (level, track, stageLevel) => {
      const allowed = new Set(
        getSyllableWordsForLevel(words, track, stageLevel).map((w) => w.syllables.join('')),
      );
      for (const seed of SEEDS) {
        expect(allowed.has(generateSyllableBuilder(level, createRng(seed)).target)).toBe(true);
      }
    });

    it('reaches four-syllable words at the top of the ladder', () => {
      const lengths = SEEDS.map(
        (seed) => generateSyllableBuilder(20, createRng(seed)).syllables.length,
      );
      expect(lengths.every((n) => n >= 3 && n <= 4)).toBe(true);
    });
  });

  describe('robo_path', () => {
    const items = MATH_GRID_NAVIGATION_PACK.items;

    it('starts on the starter grid and moves to the advanced one at level 6', () => {
      expect(generateRoboPath(1, createRng(1)).gridSize).toBe(
        getRoboPathProfile(items, 'starter').baseGrid,
      );
      expect(generateRoboPath(5, createRng(1)).gridSize).toBe(4);
      expect(generateRoboPath(6, createRng(1)).gridSize).toBe(
        getRoboPathProfile(items, 'advanced').baseGrid,
      );
    });

    it('reaches the advanced maximum grid at the top of the ladder', () => {
      expect(generateRoboPath(20, createRng(1)).gridSize).toBe(7);
      expect(generateRoboPath(21, createRng(1)).gridSize).toBe(
        getRoboPathProfile(items, 'advanced').maxGrid,
      );
    });
  });

  describe('battlelearn', () => {
    const stages = MATH_BATTLELEARN_PACK.items.filter(
      (item): item is Extract<BattleLearnCurriculumItem, { kind: 'profile_stage' }> =>
        item.kind === 'profile_stage',
    );

    it.each([
      [1, stageOf(stages, 'starter', 'first')],
      [6, stageOf(stages, 'advanced', 'first')],
      [20, stageOf(stages, 'advanced', 'last')],
    ])('level %i uses the expected board', (level, stage) => {
      const problem = generateBattleLearn(level, createRng(3));
      expect(problem.gridSize).toBe(stage.gridSize);
      expect(problem.ships.map((s) => s.length).sort()).toEqual([...stage.shipLengths].sort());
    });
  });

  it('serves a stored level past the last authored stage without throwing', () => {
    for (const generate of [
      generateUnitConversion,
      generateMemoryMath,
      generateSyllableBuilder,
      generateRoboPath,
      generateBattleLearn,
      generatePattern,
    ]) {
      expect(() => generate(40, createRng(9))).not.toThrow();
    }
  });

  describe('pattern', () => {
    it('uses the harder templates from level 5', () => {
      const items = MATH_PATTERN_SEQUENCES_PACK.items;
      const easy = new Set(getPatternTemplatesForLevel(items, 4, false).map((t) => t.id));
      const hard = new Set(getPatternTemplatesForLevel(items, 5, true).map((t) => t.id));
      for (const seed of SEEDS) {
        expect(easy.has(generatePattern(4, createRng(seed)).patternRule)).toBe(true);
        expect(hard.has(generatePattern(5, createRng(seed)).patternRule)).toBe(true);
      }
    });
  });
});
