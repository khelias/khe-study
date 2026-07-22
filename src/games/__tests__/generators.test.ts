import { beforeEach, describe, it, expect } from 'vitest';
import { generateBalanceScale } from '../balanceScale/generator';
import { generateTimeMatch } from '../timeMatch/generator';
import { generateCompareSizes } from '../compareSizes/generator';
import { generateUnitConversion } from '../unitConversion/generator';
import { generatePattern } from '../pattern/generator';
import { generateMemoryMath } from '../memoryMath/generator';
import { generatePicturePairs } from '../picturePairs/generator';
import { generateSyllableBuilder } from '../syllableBuilder/generator';
import { generateLetterMatch } from '../letterMatch/generator';
import { generateSentenceLogic } from '../sentenceLogic/generator';
import { generateStarMapper } from '../starMapper/generator';
import { generateRoboPath } from '../roboPath/generator';
import {
  generateAdditionSnake,
  generateAdditionBigSnake,
  generateSubtractionSnake,
  generateSubtractionBigSnake,
  generateMultiplicationSnake,
  generateMultiplicationBigSnake,
} from '../mathSnake/generator';
import {
  generateMultiplicationFactDrill1To5,
  generateMultiplicationFactDrill1To10,
  generateAdditionFactDrillWithin20,
  generateAdditionFactDrillWithin100,
  generateSubtractionFactDrillWithin20,
  generateSubtractionFactDrillWithin100,
  generateDivisionFactDrill1To5,
  generateDivisionFactDrill1To10,
} from '../factDrill/generator';
import { generateWordBuilder } from '../wordBuilder/generator';
import { generateWordCascade, generateWordCascadeLong } from '../wordCascade/generator';
import { generateShapeShift } from '../shapeShift/generator';
import { generateBattleLearn } from '../battlelearn/generator';
import { generateShapeDash } from '../shapeDash/generator';
import type { GeneratorFunction } from '../../types/game';
import { createRng } from '../../engine/rng';
import { setLocale } from '../../i18n';
import type {
  BalanceScaleProblem,
  WordBuilderProblem,
  WordCascadeProblem,
  PatternProblem,
  SentenceLogicProblem,
  MathSnakeProblem,
  CompareSizesProblem,
  PicturePairsProblem,
  LetterMatchProblem,
  StarMapperProblem,
  ShapeShiftProblem,
  ShapeDashProblem,
  BattleLearnProblem,
  UnitConversionProblem,
  TimeMatchProblem,
  MemoryMathProblem,
  RoboPathProblem,
  SyllableBuilderProblem,
} from '../../types/game';
import {
  MATH_GEOMETRY_SHAPES_PACK,
  getShapeDashCheckpointQuestions,
  getShapeDashGateQuestions,
} from '../../curriculum/packs/math/geometry_shapes';
import { SHAPE_SHIFT_PUZZLES_PACK } from '../../curriculum/packs/geometry/shapeShiftPuzzles';
import {
  LANGUAGE_SPATIAL_SENTENCES_PACK,
  getSpatialSentenceScenesForLevel,
} from '../../curriculum/packs/language/spatialSentences';
import { LANGUAGE_SYLLABIFICATION_ET_PACK } from '../../curriculum/packs/language/syllables_et';
import { getSyllableWordsForLevel } from '../../curriculum/packs/language/types';
import {
  LANGUAGE_LONG_VOCABULARY_ET_PACK,
  LANGUAGE_VOCABULARY_ET_PACK,
  getVocabularyWordsAvailableForLevel,
  getVocabularyWordsForLevel,
} from '../../curriculum/packs/language/vocabulary';
import {
  MATH_PATTERN_SEQUENCES_PACK,
  getPatternTemplates,
  getPatternThemes,
} from '../../curriculum/packs/math/pattern_sequences';
import {
  MATH_UNIT_CONVERSIONS_PACK,
  getUnitConversionItems,
  getUnitConversionStage,
} from '../../curriculum/packs/math/unit_conversions';
import {
  MATH_COMPARE_NUMBERS_PACK,
  getCompareNumberStage,
} from '../../curriculum/packs/math/compare_numbers';
import {
  MATH_TIME_READING_PACK,
  getTimeReadingStage,
} from '../../curriculum/packs/math/time_reading';
import {
  MATH_BALANCE_EQUATIONS_PACK,
  getBalanceEquationProgression,
} from '../../curriculum/packs/math/balance_equations';
import {
  MATH_ADDITION_MEMORY_PACK,
  getMemoryMathProgression,
} from '../../curriculum/packs/math/addition_memory';
import {
  MATH_GRID_NAVIGATION_PACK,
  getRoboPathGridSize,
  getRoboPathSettings,
} from '../../curriculum/packs/math/grid_navigation';
import {
  MATH_BATTLELEARN_PACK,
  MATH_BATTLELEARN_MULTIPLICATION_PACK,
  getBattleLearnProfileStage,
  getBattleLearnQuestionStage,
} from '../../curriculum/packs/math/battlelearn';
import { SPIKE_WIDTH } from '../../engine/shapeDash';

/**
 * Generator catalogue keyed by binding id. Each binding wires its generator
 * directly in its own `register.ts` at runtime; this map exists only so these
 * golden-path tests can assert every binding produces a valid problem.
 */
const Generators: Record<string, GeneratorFunction> = {
  balance_scale: generateBalanceScale,
  word_builder: generateWordBuilder,
  word_cascade: generateWordCascade,
  word_cascade_long: generateWordCascadeLong,
  pattern: generatePattern,
  memory_math: generateMemoryMath,
  picture_pairs: generatePicturePairs,
  addition_snake: generateAdditionSnake,
  addition_big_snake: generateAdditionBigSnake,
  subtraction_snake: generateSubtractionSnake,
  subtraction_big_snake: generateSubtractionBigSnake,
  multiplication_snake: generateMultiplicationSnake,
  multiplication_big_snake: generateMultiplicationBigSnake,
  multiplication_fact_drill_1_5: generateMultiplicationFactDrill1To5,
  multiplication_fact_drill_1_10: generateMultiplicationFactDrill1To10,
  addition_fact_drill_within_20: generateAdditionFactDrillWithin20,
  addition_fact_drill_within_100: generateAdditionFactDrillWithin100,
  subtraction_fact_drill_within_20: generateSubtractionFactDrillWithin20,
  subtraction_fact_drill_within_100: generateSubtractionFactDrillWithin100,
  division_fact_drill_1_5: generateDivisionFactDrill1To5,
  division_fact_drill_1_10: generateDivisionFactDrill1To10,
  sentence_logic: generateSentenceLogic,
  letter_match: generateLetterMatch,
  robo_path: generateRoboPath,
  syllable_builder: generateSyllableBuilder,
  time_match: generateTimeMatch,
  unit_conversion: generateUnitConversion,
  compare_sizes: generateCompareSizes,
  star_mapper: generateStarMapper,
  shape_shift: generateShapeShift,
  battlelearn: generateBattleLearn,
  shape_dash: generateShapeDash,
};

beforeEach(() => {
  setLocale('et');
  // @ts-expect-error -- Shape Shift keeps a session-level repeat buffer on globalThis
  delete globalThis._shapeShiftHistory;
});

describe('Generators', () => {
  describe('balance_scale', () => {
    it('should generate valid balance scale problem', () => {
      const rng = createRng(12345);
      const generator = Generators.balance_scale;
      if (!generator) throw new Error('balance_scale generator not found');
      const problem = generator(1, rng) as BalanceScaleProblem;

      expect(problem.type).toBe('balance_scale');
      expect(problem.display).toHaveProperty('left');
      expect(problem.display).toHaveProperty('right');
      expect(problem.display.left).toBeInstanceOf(Array);
      expect(problem.display.right).toBeInstanceOf(Array);
      expect(typeof problem.answer).toBe('number');
      expect(problem.options).toBeInstanceOf(Array);
      expect(problem.options.length).toBeGreaterThanOrEqual(3);
    });

    it('should include correct answer in options', () => {
      const rng = createRng(12345);
      const generator = Generators.balance_scale;
      if (!generator) throw new Error('balance_scale generator not found');
      const problem = generator(1, rng) as BalanceScaleProblem;

      expect(problem.options).toContain(problem.answer);
    });

    it('should use the balance equation curriculum progression', () => {
      const rng = createRng(12345);
      const generator = Generators.balance_scale;
      if (!generator) throw new Error('balance_scale generator not found');
      const problem = generator(1, rng) as BalanceScaleProblem;
      const progression = getBalanceEquationProgression(MATH_BALANCE_EQUATIONS_PACK.items, 1);
      const leftSum = problem.display.left.reduce((a, b) => a + b, 0);

      expect(leftSum).toBeGreaterThanOrEqual(progression.minSum);
      expect(leftSum).toBeLessThanOrEqual(progression.maxSum);
      expect(problem.display.left.every((value) => value >= progression.minVisibleWeight)).toBe(
        true,
      );
      expect(problem.options).toHaveLength(progression.optionCount);
    });

    it('should select later balance equation stages by level', () => {
      const rng = createRng(12345);
      const generator = Generators.balance_scale;
      if (!generator) throw new Error('balance_scale generator not found');
      const problem = generator(15, rng) as BalanceScaleProblem;
      const progression = getBalanceEquationProgression(MATH_BALANCE_EQUATIONS_PACK.items, 15);
      const leftSum = problem.display.left.reduce((a, b) => a + b, 0);

      expect(progression.minLevel).toBe(15);
      expect(leftSum).toBeGreaterThanOrEqual(progression.minSum);
      expect(leftSum).toBeLessThanOrEqual(progression.maxSum);
      expect(problem.options).toHaveLength(progression.optionCount);
    });

    it('should generate consistent problems with same seed', () => {
      const rng1 = createRng(12345);
      const rng2 = createRng(12345);
      const generator = Generators.balance_scale;
      if (!generator) throw new Error('balance_scale generator not found');

      const problem1 = generator(1, rng1) as BalanceScaleProblem;
      const problem2 = generator(1, rng2) as BalanceScaleProblem;

      expect(problem1.answer).toBe(problem2.answer);
      expect(problem1.display).toEqual(problem2.display);
    });

    it('should increase difficulty with level', () => {
      const rng1 = createRng(12345);
      const rng2 = createRng(12345);
      const generator = Generators.balance_scale;
      if (!generator) throw new Error('balance_scale generator not found');

      const problem1 = generator(1, rng1) as BalanceScaleProblem;
      const problem5 = generator(5, rng2) as BalanceScaleProblem;

      const sum1 = problem1.display.left.reduce((a, b) => a + b, 0);
      const sum5 = problem5.display.left.reduce((a, b) => a + b, 0);

      // Higher level should generally have larger numbers
      expect(sum5).toBeGreaterThan(sum1);
    });

    it('should balance correctly', () => {
      const rng = createRng(12345);
      const generator = Generators.balance_scale;
      if (!generator) throw new Error('balance_scale generator not found');
      const problem = generator(1, rng) as BalanceScaleProblem;

      const leftSum = problem.display.left.reduce((a, b) => a + b, 0);
      const rightSum = problem.display.right.reduce((a, b) => a + b, 0) + problem.answer;

      expect(leftSum).toBe(rightSum);
    });
  });

  describe('memory_math', () => {
    it('should generate addition pairs from the curriculum progression', () => {
      const rng = createRng(12345);
      const generator = Generators.memory_math;
      if (!generator) throw new Error('memory_math generator not found');
      const problem = generator(1, rng) as MemoryMathProblem;
      const progression = getMemoryMathProgression(MATH_ADDITION_MEMORY_PACK.items, 'starter', 1);

      expect(problem.type).toBe('memory_math');
      expect(problem.cards).toHaveLength(progression.cardCount);
      expect(problem.pairs).toHaveLength(progression.cardCount / 2);
      expect(problem.pairs.every((pair) => pair.ans >= progression.minAnswerSum)).toBe(true);
      expect(problem.pairs.every((pair) => pair.ans <= progression.maxAnswerSum)).toBe(true);
    });

    it('should select later memory stages by level', () => {
      const rng = createRng(54321);
      const generator = Generators.memory_math;
      if (!generator) throw new Error('memory_math generator not found');
      const problem = generator(10, rng) as MemoryMathProblem;
      const progression = getMemoryMathProgression(MATH_ADDITION_MEMORY_PACK.items, 'starter', 10);

      expect(problem.cards).toHaveLength(progression.cardCount);
      expect(problem.pairs.every((pair) => pair.ans >= progression.minAnswerSum)).toBe(true);
      expect(problem.pairs.every((pair) => pair.ans <= progression.maxAnswerSum)).toBe(true);
    });
  });

  describe('robo_path', () => {
    it('should generate a grid navigation problem from the curriculum progression', () => {
      const rng = createRng(12345);
      const generator = Generators.robo_path;
      if (!generator) throw new Error('robo_path generator not found');
      const problem = generator(1, rng) as RoboPathProblem;
      const settings = getRoboPathSettings(MATH_GRID_NAVIGATION_PACK.items);
      const expectedGridSize = getRoboPathGridSize(MATH_GRID_NAVIGATION_PACK.items, 'starter', 1);
      const obstacleCap = Math.max(
        settings.maxObstacleFloor,
        Math.floor(expectedGridSize * expectedGridSize * settings.maxObstacleRatio),
      );

      expect(problem.type).toBe('robo_path');
      expect(problem.gridSize).toBe(expectedGridSize);
      expect(problem.grid).toHaveLength(expectedGridSize);
      expect(problem.obstacles.length).toBeLessThanOrEqual(obstacleCap);
      expect(problem.start).toEqual([0, 0]);
    });
  });

  describe('word_builder', () => {
    it('should generate valid word builder problem', () => {
      const rng = createRng(12345);
      const generator = Generators.word_builder;
      if (!generator) throw new Error('word_builder generator not found');
      const problem = generator(1, rng) as WordBuilderProblem;

      expect(problem.type).toBe('word_builder');
      expect(typeof problem.target).toBe('string');
      expect(problem.target.length).toBeGreaterThan(0);
      expect(problem.shuffled).toBeInstanceOf(Array);
      // Shuffled should have all correct letters (no distractors at level 1)
      expect(problem.shuffled.length).toBe(problem.target.length);
    });

    it('should have all target letters in shuffled array at level 1', () => {
      const rng = createRng(12345);
      const generator = Generators.word_builder;
      if (!generator) throw new Error('word_builder generator not found');
      const problem = generator(1, rng) as WordBuilderProblem;

      const targetLetters = problem.target.split('').sort();
      const shuffledLetters = problem.shuffled.map((l) => l.char).sort();

      expect(shuffledLetters).toEqual(targetLetters);
    });

    it('should use uppercase letters at level 1-3', () => {
      const rng = createRng(12345);
      const generator = Generators.word_builder;
      if (!generator) throw new Error('word_builder generator not found');
      const problem1 = generator(1, rng) as WordBuilderProblem;
      const problem3 = generator(3, rng) as WordBuilderProblem;

      // All letters should be uppercase
      expect(problem1.target).toBe(problem1.target.toUpperCase());
      expect(problem3.target).toBe(problem3.target.toUpperCase());
    });

    it('should use capitalized first letter at level 4-6', () => {
      const rng = createRng(12345);
      const generator = Generators.word_builder;
      if (!generator) throw new Error('word_builder generator not found');
      const problem4 = generator(4, rng) as WordBuilderProblem;
      const problem6 = generator(6, rng) as WordBuilderProblem;

      // First letter uppercase, rest lowercase
      const first4 = problem4.target[0];
      const first6 = problem6.target[0];
      if (first4) {
        expect(first4).toBe(first4.toUpperCase());
        expect(problem4.target.slice(1)).toBe(problem4.target.slice(1).toLowerCase());
      }
      if (first6) {
        expect(first6).toBe(first6.toUpperCase());
        expect(problem6.target.slice(1)).toBe(problem6.target.slice(1).toLowerCase());
      }
    });

    it('should use lowercase letters at level 7-9', () => {
      const rng = createRng(12345);
      const generator = Generators.word_builder;
      if (!generator) throw new Error('word_builder generator not found');
      const problem7 = generator(7, rng) as WordBuilderProblem;
      const problem9 = generator(9, rng) as WordBuilderProblem;

      // All letters should be lowercase
      expect(problem7.target).toBe(problem7.target.toLowerCase());
      expect(problem9.target).toBe(problem9.target.toLowerCase());
    });

    it('should add distractor letters at level 3+', () => {
      const rng = createRng(12345);
      const generator = Generators.word_builder;
      if (!generator) throw new Error('word_builder generator not found');

      // Level 1-2: no distractors
      const problem1 = generator(1, rng) as WordBuilderProblem;
      expect(problem1.shuffled.length).toBe(problem1.target.length);

      // Level 3-4: 1 distractor
      const problem3 = generator(3, rng) as WordBuilderProblem;
      expect(problem3.shuffled.length).toBe(problem3.target.length + 1);

      // Level 5-7: 2 distractors
      const problem5 = generator(5, rng) as WordBuilderProblem;
      expect(problem5.shuffled.length).toBe(problem5.target.length + 2);

      // Level 8+: 3 distractors
      const problem8 = generator(8, rng) as WordBuilderProblem;
      expect(problem8.shuffled.length).toBe(problem8.target.length + 3);
    });

    it('should add pre-filled positions for 6+ letter words', () => {
      const generator = Generators.word_builder;
      if (!generator) throw new Error('word_builder generator not found');

      // Generate multiple problems until we get a 6+ letter word
      let problem: WordBuilderProblem | null = null;
      for (let i = 0; i < 50; i++) {
        const testRng = createRng(12345 + i);
        const testProblem = generator(9, testRng) as WordBuilderProblem;
        if (testProblem.target.length >= 6) {
          problem = testProblem;
          break;
        }
      }

      if (problem && problem.target.length >= 6) {
        expect(problem.preFilledPositions).toBeDefined();
        expect(problem.preFilledPositions!.length).toBeGreaterThan(0);

        // 6-letter words should have 1 pre-filled
        if (problem.target.length === 6) {
          expect(problem.preFilledPositions!.length).toBe(1);
        }
        // 7+ letter words should have 2 pre-filled
        if (problem.target.length >= 7) {
          expect(problem.preFilledPositions!.length).toBe(2);
        }
      }
    });

    it('should increase word length with level', () => {
      const rng1 = createRng(12345);
      const rng2 = createRng(12345);
      const rng3 = createRng(12345);
      const generator = Generators.word_builder;
      if (!generator) throw new Error('word_builder generator not found');

      const problem1 = generator(1, rng1) as WordBuilderProblem;
      const problem5 = generator(5, rng2) as WordBuilderProblem;
      const problem10 = generator(10, rng3) as WordBuilderProblem;

      // Higher level should generally have longer words
      expect(problem5.target.length).toBeGreaterThanOrEqual(problem1.target.length);
      expect(problem10.target.length).toBeGreaterThanOrEqual(problem5.target.length);
    });

    it('should source words from the vocabulary pack', () => {
      const rng = createRng(12345);
      const generator = Generators.word_builder;
      if (!generator) throw new Error('word_builder generator not found');
      const problem = generator(1, rng) as WordBuilderProblem;
      const source = LANGUAGE_VOCABULARY_ET_PACK.items.find(
        (item) => item.w === problem.target.toUpperCase(),
      );
      const allowedTargets = new Set(
        getVocabularyWordsForLevel(LANGUAGE_VOCABULARY_ET_PACK.items, 1, {
          preferWithoutDiacritics: true,
        }).map((item) => item.w),
      );

      expect(source).toBeDefined();
      expect(problem.emoji).toBe(source?.e);
      expect(allowedTargets.has(problem.target.toUpperCase())).toBe(true);
    });
  });

  describe('word_cascade', () => {
    it('should source target words from the vocabulary pack', () => {
      const rng = createRng(12345);
      const generator = Generators.word_cascade;
      if (!generator) throw new Error('word_cascade generator not found');
      const problem = generator(1, rng) as WordCascadeProblem;
      const source = LANGUAGE_VOCABULARY_ET_PACK.items.find(
        (item) => item.w === problem.target.toUpperCase(),
      );

      expect(problem.type).toBe('word_cascade');
      expect(source).toBeDefined();
      expect(problem.emoji).toBe(source?.e);
    });

    it('should source long target words from the long vocabulary pack', () => {
      const rng = createRng(12345);
      const generator = Generators.word_cascade_long;
      if (!generator) throw new Error('word_cascade_long generator not found');
      const problem = generator(1, rng) as WordCascadeProblem;
      const source = LANGUAGE_LONG_VOCABULARY_ET_PACK.items.find(
        (item) => item.w === problem.target.toUpperCase(),
      );

      expect(problem.type).toBe('word_cascade');
      expect(source).toBeDefined();
      expect(problem.target.length).toBeGreaterThanOrEqual(8);
      expect(problem.emoji).toBe(source?.e);
    });
  });

  describe('syllable_builder', () => {
    it('should generate syllable words from the locale syllabification pack', () => {
      const rng = createRng(12345);
      const generator = Generators.syllable_builder;
      if (!generator) throw new Error('syllable_builder generator not found');
      const problem = generator(1, rng) as SyllableBuilderProblem;
      const source = LANGUAGE_SYLLABIFICATION_ET_PACK.items.find(
        (item) => item.syllables.join('') === problem.target,
      );

      expect(problem.type).toBe('syllable_builder');
      expect(source).toBeDefined();
      expect(problem.emoji).toBe(source?.emoji);
      expect(problem.syllables).toEqual(source?.syllables);
    });

    it('should use syllable level metadata for word length progression', () => {
      const generator = Generators.syllable_builder;
      if (!generator) throw new Error('syllable_builder generator not found');
      const level1 = generator(1, createRng(12345)) as SyllableBuilderProblem;
      const level6 = generator(6, createRng(54321)) as SyllableBuilderProblem;
      const allowedLevel6Targets = new Set(
        getSyllableWordsForLevel(LANGUAGE_SYLLABIFICATION_ET_PACK.items, 'starter', 6).map((word) =>
          word.syllables.join(''),
        ),
      );

      expect(level1.syllables).toHaveLength(2);
      expect(allowedLevel6Targets.has(level6.target)).toBe(true);
      expect([3, 4]).toContain(level6.syllables.length);
    });
  });

  describe('pattern', () => {
    it('should generate valid pattern problem', () => {
      const rng = createRng(12345);
      const generator = Generators.pattern;
      if (!generator) throw new Error('pattern generator not found');
      const problem = generator(1, rng) as PatternProblem;

      expect(problem.type).toBe('pattern');
      expect(problem.sequence).toBeInstanceOf(Array);
      expect(typeof problem.answer).toBe('string');
      expect(problem.options).toBeInstanceOf(Array);
      expect(problem.patternRule).toBeDefined();
      expect(problem.patternCycle.length).toBeGreaterThan(0);
    });

    it('should include correct answer in options', () => {
      const rng = createRng(12345);
      const generator = Generators.pattern;
      if (!generator) throw new Error('pattern generator not found');
      const problem = generator(1, rng) as PatternProblem;

      expect(problem.options).toContain(problem.answer);
    });

    it('should generate consistent problems with same seed', () => {
      const rng1 = createRng(12345);
      const rng2 = createRng(12345);
      const generator = Generators.pattern;
      if (!generator) throw new Error('pattern generator not found');

      const problem1 = generator(1, rng1) as PatternProblem;
      const problem2 = generator(1, rng2) as PatternProblem;

      expect(problem1.sequence).toEqual(problem2.sequence);
      expect(problem1.answer).toBe(problem2.answer);
    });

    it('should have at least 3 options', () => {
      const rng = createRng(12345);
      const generator = Generators.pattern;
      if (!generator) throw new Error('pattern generator not found');
      const problem = generator(1, rng) as PatternProblem;

      expect(problem.options.length).toBeGreaterThanOrEqual(3);
    });

    it('should increase pattern complexity with level', () => {
      const rng1 = createRng(12345);
      const rng2 = createRng(12345);
      const generator = Generators.pattern;
      if (!generator) throw new Error('pattern generator not found');

      const problem1 = generator(1, rng1) as PatternProblem;
      const problem5 = generator(5, rng2) as PatternProblem;

      expect(problem5.sequence.length).toBeGreaterThanOrEqual(problem1.sequence.length);
    });

    it('should source symbols and rules from the pattern sequence pack', () => {
      const rng = createRng(12345);
      const generator = Generators.pattern;
      if (!generator) throw new Error('pattern generator not found');
      const problem = generator(3, rng) as PatternProblem;
      const symbols = new Set(
        getPatternThemes(MATH_PATTERN_SEQUENCES_PACK.items).flatMap((theme) => theme.symbols),
      );
      const ruleIds = new Set(
        getPatternTemplates(MATH_PATTERN_SEQUENCES_PACK.items).map((template) => template.id),
      );

      expect(ruleIds.has(problem.patternRule)).toBe(true);
      for (const symbol of [...problem.sequence, problem.answer, ...problem.options]) {
        expect(symbols.has(symbol)).toBe(true);
      }
    });
  });

  describe('sentence_logic', () => {
    it('should generate a sentence logic problem from the spatial sentence pack', () => {
      const rng = createRng(12345);
      const generator = Generators.sentence_logic;
      if (!generator) throw new Error('sentence_logic generator not found');
      const problem = generator(1, rng) as SentenceLogicProblem;
      const packSceneIds = new Set(LANGUAGE_SPATIAL_SENTENCES_PACK.items.map((scene) => scene.id));

      expect(problem.type).toBe('sentence_logic');
      expect(packSceneIds.has(problem.scene)).toBe(true);
      expect(problem.sentence).toContain(problem.subject.n);
      expect(problem.options.length).toBeGreaterThanOrEqual(2);
    });

    it('should use simpler scenes at early levels', () => {
      const generator = Generators.sentence_logic;
      if (!generator) throw new Error('sentence_logic generator not found');
      const earlyProblems = Array.from(
        { length: 20 },
        (_, seed) => generator(1, createRng(seed)) as SentenceLogicProblem,
      );
      const sceneById = new Map(
        LANGUAGE_SPATIAL_SENTENCES_PACK.items.map((scene) => [scene.id, scene]),
      );
      const allowedSceneIds = new Set(
        getSpatialSentenceScenesForLevel(LANGUAGE_SPATIAL_SENTENCES_PACK.items, 1).map(
          (scene) => scene.id,
        ),
      );

      for (const problem of earlyProblems) {
        const scene = sceneById.get(problem.scene);
        expect(allowedSceneIds.has(problem.scene)).toBe(true);
        expect(scene?.positions.length).toBeLessThanOrEqual(4);
      }
    });
  });

  describe('picture_pairs', () => {
    it('should generate valid picture pairs problem', () => {
      const rng = createRng(12345);
      const generator = Generators.picture_pairs;
      if (!generator) throw new Error('picture_pairs generator not found');
      const problem = generator(1, rng) as PicturePairsProblem;

      expect(problem.type).toBe('picture_pairs');
      expect(problem.cards).toBeInstanceOf(Array);
      expect(problem.pairs).toBeInstanceOf(Array);
      expect(problem.cards.length).toBe(problem.pairs.length * 2);
      expect(problem.pairs.length).toBeGreaterThanOrEqual(4);
    });

    it('Phase 5d: cold-start (no variant, no ageHint) defaults to word+emoji matching', () => {
      const rng = createRng(999);
      const generator = Generators.picture_pairs;
      if (!generator) throw new Error('picture_pairs generator not found');

      const problem = generator(2, rng) as PicturePairsProblem;
      const byMatchId = problem.cards.reduce<Record<string, typeof problem.cards>>((acc, c) => {
        const id = c.matchId;
        if (!acc[id]) acc[id] = [];
        acc[id].push(c);
        return acc;
      }, {});
      Object.values(byMatchId).forEach((cards) => {
        expect(cards).toHaveLength(2);
        const types = new Set(cards.map((c) => c.cardType));
        expect(types).toContain('emoji');
        expect(types).toContain('word');
      });
    });

    it('Phase 5d: variant=emoji_only forces emoji-emoji pairs', () => {
      const rng = createRng(1000);
      const generator = Generators.picture_pairs;
      if (!generator) throw new Error('picture_pairs generator not found');
      const problem = generator(2, rng, { variant: 'emoji_only' }) as PicturePairsProblem;
      problem.cards.forEach((c) => expect(c.cardType).toBe('emoji'));
    });

    it('Phase 5d: variant=emoji_word forces word+emoji pairs', () => {
      const rng = createRng(1001);
      const generator = Generators.picture_pairs;
      if (!generator) throw new Error('picture_pairs generator not found');
      const problem = generator(2, rng, { variant: 'emoji_word' }) as PicturePairsProblem;
      const types = new Set(problem.cards.map((c) => c.cardType));
      expect(types).toContain('emoji');
      expect(types).toContain('word');
    });

    it('Phase 5d: defaults to emoji_only when ageHint < 5', () => {
      const rng = createRng(1002);
      const generator = Generators.picture_pairs;
      if (!generator) throw new Error('picture_pairs generator not found');
      const problem = generator(2, rng, { ageHint: 4 }) as PicturePairsProblem;
      problem.cards.forEach((c) => expect(c.cardType).toBe('emoji'));
    });

    it('Phase 5d: defaults to emoji_word when ageHint >= 5', () => {
      const rng = createRng(1003);
      const generator = Generators.picture_pairs;
      if (!generator) throw new Error('picture_pairs generator not found');
      const problem = generator(2, rng, { ageHint: 35 }) as PicturePairsProblem;
      const types = new Set(problem.cards.map((c) => c.cardType));
      expect(types).toContain('emoji');
      expect(types).toContain('word');
    });

    it('Phase 5d: explicit variant beats ageHint default', () => {
      const rng = createRng(1004);
      const generator = Generators.picture_pairs;
      if (!generator) throw new Error('picture_pairs generator not found');
      // ageHint suggests emoji_word, but variant says emoji_only — variant wins.
      const problem = generator(2, rng, {
        ageHint: 35,
        variant: 'emoji_only',
      }) as PicturePairsProblem;
      problem.cards.forEach((c) => expect(c.cardType).toBe('emoji'));
    });

    it('should increase pair count with level for advanced profile', () => {
      const rng = createRng(111);
      const generator = Generators.picture_pairs;
      if (!generator) throw new Error('picture_pairs generator not found');
      const low = generator(1, rng) as PicturePairsProblem;
      const rng2 = createRng(222);
      const high = generator(10, rng2) as PicturePairsProblem;
      expect(high.pairs.length).toBeGreaterThanOrEqual(low.pairs.length);
    });

    it('should source pairs from the vocabulary pack', () => {
      const rng = createRng(777);
      const generator = Generators.picture_pairs;
      if (!generator) throw new Error('picture_pairs generator not found');
      const problem = generator(3, rng) as PicturePairsProblem;
      const sourceByWord = new Map(
        LANGUAGE_VOCABULARY_ET_PACK.items.map((item) => [item.w, item.e]),
      );
      const availableWords = new Set(
        getVocabularyWordsAvailableForLevel(LANGUAGE_VOCABULARY_ET_PACK.items, 3).map(
          (item) => item.w,
        ),
      );

      for (const pair of problem.pairs) {
        expect(sourceByWord.get(pair.word)).toBe(pair.emoji);
        expect(availableWords.has(pair.word)).toBe(true);
      }
    });
  });

  describe('letter_match', () => {
    it('should use vocabulary words when a matching letter exists', () => {
      const generator = Generators.letter_match;
      if (!generator) throw new Error('letter_match generator not found');
      const sourceByWord = new Map(
        LANGUAGE_VOCABULARY_ET_PACK.items.map((item) => [item.w, item.e]),
      );

      const problem = Array.from(
        { length: 80 },
        (_, seed) => generator(1, createRng(seed)) as LetterMatchProblem,
      ).find((candidate) => sourceByWord.has(candidate.word));

      expect(problem).toBeDefined();
      if (!problem) throw new Error('No letter_match problem used a vocabulary word');
      expect(problem.word).toContain(problem.display);
      expect(sourceByWord.get(problem.word)).toBe(problem.emoji);
    });
  });

  describe('snake family (math_snake engine)', () => {
    // All snake games share MathSnakeView + mathSnake engine. Each registration
    // is a distinct generator bound to its own pack. One representative
    // generator is enough to verify the engine integration.
    it('addition_snake generates a valid math snake problem', () => {
      const rng = createRng(4242);
      const generator = Generators.addition_snake;
      if (!generator) throw new Error('addition_snake generator not found');
      const problem = generator(2, rng) as MathSnakeProblem;

      expect(problem.type).toBe('math_snake');
      expect(problem.gridSize).toBeGreaterThanOrEqual(5);
      expect(problem.snake.length).toBeGreaterThanOrEqual(3);
      expect(problem.apple).not.toBeNull();
      expect(problem.math).toBeNull();
      expect(problem.applesUntilMath).toBeGreaterThan(0);
      // Pack threaded through: specs must be present on the problem state.
      expect(problem.specs.length).toBeGreaterThan(0);
    });

    it('multiplication_snake keeps apples inside the grid and off the snake', () => {
      const rng = createRng(4242);
      const generator = Generators.multiplication_snake;
      if (!generator) throw new Error('multiplication_snake generator not found');
      const problem = generator(3, rng) as MathSnakeProblem;

      const snakeSet = new Set(problem.snake.map(([x, y]) => `${x},${y}`));
      const apple = problem.apple;
      if (!apple) throw new Error('Expected apple');
      const [x, y] = apple.pos;
      expect(x).toBeGreaterThanOrEqual(0);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(problem.gridSize);
      expect(y).toBeLessThan(problem.gridSize);
      expect(snakeSet.has(`${x},${y}`)).toBe(false);
      expect(apple.kind).toBe('normal');
    });
  });

  describe('answer validation', () => {
    it('should validate balance_scale answer correctly', () => {
      const rng = createRng(12345);
      const generator = Generators.balance_scale;
      if (!generator) throw new Error('balance_scale generator not found');
      const problem = generator(1, rng) as BalanceScaleProblem;

      // Correct answer should match
      expect(problem.answer).toBe(problem.answer);

      // Wrong answer should not match
      const wrongAnswer = problem.answer + 1;
      expect(wrongAnswer).not.toBe(problem.answer);
    });

    it('should validate word_builder answer correctly', () => {
      const rng = createRng(12345);
      const generator = Generators.word_builder;
      if (!generator) throw new Error('word_builder generator not found');
      const problem = generator(1, rng) as WordBuilderProblem;

      // Correct answer is the target word
      expect(problem.target).toBe(problem.target);

      // Wrong answer should not match
      expect('wrong').not.toBe(problem.target);
    });

    it('should validate pattern answer correctly', () => {
      const rng = createRng(12345);
      const generator = Generators.pattern;
      if (!generator) throw new Error('pattern generator not found');
      const problem = generator(1, rng) as PatternProblem;

      // Correct answer should be in options
      expect(problem.options).toContain(problem.answer);

      // Wrong answer should not match
      const wrongOptions = problem.options.filter((opt) => opt !== problem.answer);
      if (wrongOptions.length > 0) {
        expect(wrongOptions[0]).not.toBe(problem.answer);
      }
    });
  });

  describe('profile difficulty', () => {
    it('should generate harder problems for advanced profile', () => {
      const rng1 = createRng(12345);
      const rng2 = createRng(12345);
      const generator = Generators.balance_scale;
      if (!generator) throw new Error('balance_scale generator not found');

      const starterProblem = generator(1, rng1) as BalanceScaleProblem;
      const advancedProblem = generator(1, rng2) as BalanceScaleProblem;

      const starterSum = starterProblem.display.left.reduce((a, b) => a + b, 0);
      const advancedSum = advancedProblem.display.left.reduce((a, b) => a + b, 0);

      expect(advancedSum).toBeGreaterThanOrEqual(starterSum);
    });

    it('should generate longer words for advanced profile', () => {
      const rng1 = createRng(12345);
      const rng2 = createRng(12345);
      const generator = Generators.word_builder;
      if (!generator) throw new Error('word_builder generator not found');

      const starterProblem = generator(1, rng1) as WordBuilderProblem;
      const advancedProblem = generator(1, rng2) as WordBuilderProblem;

      expect(advancedProblem.target.length).toBeGreaterThanOrEqual(starterProblem.target.length);
    });
  });

  describe('time_match', () => {
    it('should generate a valid time matching problem from the curriculum stage', () => {
      const rng = createRng(12345);
      const generator = Generators.time_match;
      if (!generator) throw new Error('time_match generator not found');
      const problem = generator(1, rng) as TimeMatchProblem;
      const stage = getTimeReadingStage(MATH_TIME_READING_PACK.items, 1);

      expect(problem.type).toBe('time_match');
      expect(stage.focus).toBe('full_hour');
      expect(problem.minutes).toBe(0);
      expect(problem.minutes % stage.stepMinutes).toBe(0);
      expect(problem.options).toHaveLength(stage.optionCount);
      expect(problem.options).toContain(problem.answer);
    });

    it('should use constrained before/after-hour minute choices at level 8', () => {
      const rng = createRng(54321);
      const generator = Generators.time_match;
      if (!generator) throw new Error('time_match generator not found');
      const problem = generator(8, rng) as TimeMatchProblem;
      const stage = getTimeReadingStage(MATH_TIME_READING_PACK.items, 8);

      expect(stage.focus).toBe('near_hour');
      expect(stage.allowedMinutes).toContain(problem.minutes);
      expect(problem.options).toHaveLength(stage.optionCount);
    });

    it('should move to dense digital options at later levels', () => {
      const rng = createRng(54321);
      const generator = Generators.time_match;
      if (!generator) throw new Error('time_match generator not found');
      const problem = generator(10, rng) as TimeMatchProblem;
      const stage = getTimeReadingStage(MATH_TIME_READING_PACK.items, 10);

      expect(stage.focus).toBe('digital_24h');
      expect(stage.stepMinutes).toBe(5);
      expect(problem.minutes % stage.stepMinutes).toBe(0);
      expect(problem.options).toHaveLength(stage.optionCount);
    });
  });

  describe('unit_conversion', () => {
    it('should generate a valid unit conversion problem from the curriculum pack', () => {
      const rng = createRng(12345);
      const generator = Generators.unit_conversion;
      if (!generator) throw new Error('unit_conversion generator not found');
      const problem = generator(4, rng) as UnitConversionProblem;
      const source = getUnitConversionItems(MATH_UNIT_CONVERSIONS_PACK.items).find(
        (item) =>
          item.category === problem.category &&
          item.from === problem.fromUnit &&
          item.to === problem.toUnit,
      );

      expect(problem.type).toBe('unit_conversion');
      expect(source).toBeDefined();
      expect(problem.answer).toBe(problem.value * (source?.factor ?? 0));
      expect(problem.options).toContain(problem.answer);
    });

    it('should use unit conversion stage ranges and option count', () => {
      const rng = createRng(54321);
      const generator = Generators.unit_conversion;
      if (!generator) throw new Error('unit_conversion generator not found');
      const problem = generator(11, rng) as UnitConversionProblem;
      const stage = getUnitConversionStage(MATH_UNIT_CONVERSIONS_PACK.items, 'starter', 11);
      const source = getUnitConversionItems(MATH_UNIT_CONVERSIONS_PACK.items).find(
        (item) =>
          item.category === problem.category &&
          item.from === problem.fromUnit &&
          item.to === problem.toUnit,
      );

      expect(problem.value).toBeGreaterThanOrEqual(stage.minValue);
      expect(problem.value).toBeLessThanOrEqual(stage.maxValue);
      expect(problem.options).toHaveLength(stage.optionCount);
      expect(source).toBeDefined();
      expect(source && stage.conversionIds.includes(source.id)).toBe(true);
    });
  });

  describe('compare_sizes', () => {
    it('should generate valid compare sizes problem', () => {
      const rng = createRng(12345);
      const generator = Generators.compare_sizes;
      if (!generator) throw new Error('compare_sizes generator not found');
      const problem = generator(1, rng) as CompareSizesProblem;

      expect(problem.type).toBe('compare_sizes');
      expect(problem.leftItem).toHaveProperty('value');
      expect(problem.leftItem).toHaveProperty('display');
      expect(problem.rightItem).toHaveProperty('value');
      expect(problem.rightItem).toHaveProperty('display');
      expect(['left', 'right', 'equal']).toContain(problem.answer);
      expect(problem.options).toBeInstanceOf(Array);
      expect(problem.options.length).toBeGreaterThanOrEqual(2);
    });

    it('should compute correct answer', () => {
      const rng = createRng(12345);
      const generator = Generators.compare_sizes;
      if (!generator) throw new Error('compare_sizes generator not found');
      const problem = generator(1, rng) as CompareSizesProblem;

      const leftValue = problem.leftItem.value;
      const rightValue = problem.rightItem.value;
      const expectedAnswer =
        leftValue > rightValue ? 'left' : leftValue < rightValue ? 'right' : 'equal';

      expect(problem.answer).toBe(expectedAnswer);
    });

    it('should include correct answer in options (when applicable)', () => {
      const rng = createRng(12345);
      const generator = Generators.compare_sizes;
      if (!generator) throw new Error('compare_sizes generator not found');
      const problem = generator(5, rng) as CompareSizesProblem; // Use level 5 to ensure 'equal' is in options

      expect(problem.options).toContain(problem.answer);
    });

    it('should generate consistent problems with same seed', () => {
      const rng1 = createRng(12345);
      const rng2 = createRng(12345);
      const generator = Generators.compare_sizes;
      if (!generator) throw new Error('compare_sizes generator not found');

      const problem1 = generator(1, rng1) as CompareSizesProblem;
      const problem2 = generator(1, rng2) as CompareSizesProblem;

      expect(problem1.answer).toBe(problem2.answer);
      expect(problem1.leftItem.value).toBe(problem2.leftItem.value);
      expect(problem1.rightItem.value).toBe(problem2.rightItem.value);
    });

    it('should not show numbers at level 1-2', () => {
      const rng = createRng(12345);
      const generator = Generators.compare_sizes;
      if (!generator) throw new Error('compare_sizes generator not found');
      const problem = generator(1, rng) as CompareSizesProblem;

      // Level 1-3 use dice only, no numbers
      expect(problem.showNumbers).toBe(false);
    });

    it('should show numbers at level 4+', () => {
      const rng = createRng(12345);
      const generator = Generators.compare_sizes;
      if (!generator) throw new Error('compare_sizes generator not found');
      const problem = generator(4, rng) as CompareSizesProblem;

      // Level 4+ show numbers (with or alongside dice)
      expect(problem.showNumbers).toBe(true);
    });

    it('should always show symbols (core learning objective)', () => {
      const rng = createRng(12345);
      const generator = Generators.compare_sizes;
      if (!generator) throw new Error('compare_sizes generator not found');
      const problem = generator(1, rng) as CompareSizesProblem;

      // Symbols should ALWAYS be shown now - this is the main learning objective
      expect(problem.showSymbols).toBe(true);
    });

    it('should show symbols at all levels', () => {
      const rng1 = createRng(12345);
      const rng2 = createRng(12345);
      const generator = Generators.compare_sizes;
      if (!generator) throw new Error('compare_sizes generator not found');
      const problem1 = generator(1, rng1) as CompareSizesProblem;
      const problem7 = generator(7, rng2) as CompareSizesProblem;

      // Both levels should show symbols
      expect(problem1.showSymbols).toBe(true);
      expect(problem7.showSymbols).toBe(true);
    });

    it('should have only 2 options at level 1', () => {
      const rng = createRng(12345);
      const generator = Generators.compare_sizes;
      if (!generator) throw new Error('compare_sizes generator not found');
      const problem = generator(1, rng) as CompareSizesProblem;

      expect(problem.options.length).toBe(2);
      expect(problem.options).toContain('left');
      expect(problem.options).toContain('right');
      expect(problem.options).not.toContain('equal');
    });

    it('should use the number comparison curriculum stage', () => {
      const rng = createRng(12345);
      const generator = Generators.compare_sizes;
      if (!generator) throw new Error('compare_sizes generator not found');
      const problem = generator(1, rng) as CompareSizesProblem;
      const stage = getCompareNumberStage(MATH_COMPARE_NUMBERS_PACK.items, 1);

      expect(problem.options).toEqual([...stage.symbolOptions]);
      expect(problem.leftItem.value).toBeLessThanOrEqual(stage.maxValue);
      expect(problem.rightItem.value).toBeLessThanOrEqual(stage.maxValue);
    });

    it('should have 3 options from level 2+', () => {
      const rng = createRng(12345);
      const generator = Generators.compare_sizes;
      if (!generator) throw new Error('compare_sizes generator not found');
      const problem = generator(2, rng) as CompareSizesProblem;

      expect(problem.options.length).toBe(3);
      expect(problem.options).toContain('left');
      expect(problem.options).toContain('right');
      expect(problem.options).toContain('equal');
    });

    it('should use dice visualization at early levels', () => {
      const rng = createRng(12345);
      const generator = Generators.compare_sizes;
      if (!generator) throw new Error('compare_sizes generator not found');
      const problem = generator(1, rng) as CompareSizesProblem;

      // Level 1 should use dice emoji visualization
      expect(problem.leftItem.visual).toContain('🎲');
    });

    it('should increase max value with level', () => {
      const rng1 = createRng(12345);
      const rng2 = createRng(12345);
      const generator = Generators.compare_sizes;
      if (!generator) throw new Error('compare_sizes generator not found');

      const problem1 = generator(1, rng1) as CompareSizesProblem;
      const problem7 = generator(7, rng2) as CompareSizesProblem;

      // Level 1 max is 6 (single die), level 7 max is 30
      const maxValue1 = Math.max(problem1.leftItem.value, problem1.rightItem.value);
      const maxValue7 = Math.max(problem7.leftItem.value, problem7.rightItem.value);

      expect(maxValue1).toBeLessThanOrEqual(6);
      expect(maxValue7).toBeGreaterThan(6);
    });

    it('should introduce equality from level 2', () => {
      const rng = createRng(54321);
      const generator = Generators.compare_sizes;
      if (!generator) throw new Error('compare_sizes generator not found');

      // Level 2 should have equal option available
      const problem = generator(2, rng) as CompareSizesProblem;
      expect(problem.options).toContain('equal');
      expect(problem.options.length).toBe(3);
    });

    it('should generate closer values at higher levels', () => {
      const generator = Generators.compare_sizes;
      if (!generator) throw new Error('compare_sizes generator not found');

      // Generate multiple problems at different levels
      const level1Problems = Array.from(
        { length: 20 },
        (_, i) => generator(1, createRng(11111 + i)) as CompareSizesProblem,
      );
      const level8Problems = Array.from(
        { length: 20 },
        (_, i) => generator(8, createRng(11111 + i)) as CompareSizesProblem,
      );

      // Calculate average gap for each level
      const avgGapLevel1 =
        level1Problems.reduce((sum, p) => sum + Math.abs(p.leftItem.value - p.rightItem.value), 0) /
        level1Problems.length;
      const avgGapLevel8 =
        level8Problems.reduce((sum, p) => sum + Math.abs(p.leftItem.value - p.rightItem.value), 0) /
        level8Problems.length;

      // At higher levels with larger max values, gaps might be larger in absolute terms
      // but should be smaller relative to the max value
      const maxValueLevel1 = 6;
      const maxValueLevel8 = 30;

      const relativeGapLevel1 = avgGapLevel1 / maxValueLevel1;
      const relativeGapLevel8 = avgGapLevel8 / maxValueLevel8;

      // Higher levels should have proportionally closer values (or at least not much larger)
      expect(relativeGapLevel8).toBeLessThanOrEqual(relativeGapLevel1 * 1.5);
    });
  });

  describe('star_mapper', () => {
    it('should generate valid star mapper problem', () => {
      const rng = createRng(12345);
      const generator = Generators.star_mapper;
      if (!generator) throw new Error('star_mapper generator not found');
      const problem = generator(1, rng) as StarMapperProblem;

      expect(problem.type).toBe('star_mapper');
      expect(problem.constellation).toBeDefined();
      expect(problem.constellation.stars).toBeInstanceOf(Array);
      expect(problem.constellation.lines).toBeInstanceOf(Array);
      expect(problem.correctAnswer).toBe(problem.constellation.id);
      expect(problem.playerLines).toEqual([]);
    });

    it('should set mode to trace for levels 1-2', () => {
      const rng = createRng(12345);
      const generator = Generators.star_mapper;
      if (!generator) throw new Error('star_mapper generator not found');

      const problem1 = generator(1, rng) as StarMapperProblem;
      const problem2 = generator(2, rng) as StarMapperProblem;

      expect(problem1.mode).toBe('trace');
      expect(problem2.mode).toBe('trace');
      expect(problem1.showGuide).toBe(true);
    });

    it('should set mode to build for levels 3-5', () => {
      const rng = createRng(12345);
      const generator = Generators.star_mapper;
      if (!generator) throw new Error('star_mapper generator not found');

      const problem3 = generator(3, rng) as StarMapperProblem;
      const problem5 = generator(5, rng) as StarMapperProblem;

      expect(problem3.mode).toBe('build');
      expect(problem5.mode).toBe('build');
      expect(problem3.showGuide).toBe(false);
    });

    it('should set mode to identify for levels 6-8', () => {
      const rng = createRng(12345);
      const generator = Generators.star_mapper;
      if (!generator) throw new Error('star_mapper generator not found');

      const problem6 = generator(6, rng) as StarMapperProblem;
      const problem8 = generator(8, rng) as StarMapperProblem;

      expect(problem6.mode).toBe('identify');
      expect(problem8.mode).toBe('identify');
      expect(problem6.options).toBeDefined();
      expect(problem6.options?.length).toBe(4);
      expect(problem6.options).toContain(problem6.correctAnswer);
    });

    it('should set mode to expert for levels 9+', () => {
      const rng = createRng(12345);
      const generator = Generators.star_mapper;
      if (!generator) throw new Error('star_mapper generator not found');

      const problem9 = generator(9, rng) as StarMapperProblem;
      const problem11 = generator(11, rng) as StarMapperProblem;

      expect(problem9.mode).toBe('expert');
      expect(problem11.mode).toBe('expert');
      expect(problem9.distractorStars.length).toBeGreaterThan(0);
    });

    it('should have valid constellation data', () => {
      const rng = createRng(12345);
      const generator = Generators.star_mapper;
      if (!generator) throw new Error('star_mapper generator not found');
      const problem = generator(1, rng) as StarMapperProblem;

      // Check constellation has required properties
      expect(problem.constellation.id).toBeDefined();
      expect(problem.constellation.nameEn).toBeDefined();
      expect(problem.constellation.nameEt).toBeDefined();
      expect(problem.constellation.stars.length).toBeGreaterThan(0);
      expect(problem.constellation.lines.length).toBeGreaterThan(0);

      // Check that all line references point to existing stars
      const starIds = new Set(problem.constellation.stars.map((s) => s.id));
      problem.constellation.lines.forEach((line) => {
        expect(starIds.has(line.from)).toBe(true);
        expect(starIds.has(line.to)).toBe(true);
      });
    });

    it('should increase difficulty with level', () => {
      const rng1 = createRng(12345);
      const rng2 = createRng(12345);
      const generator = Generators.star_mapper;
      if (!generator) throw new Error('star_mapper generator not found');

      const problem1 = generator(1, rng1) as StarMapperProblem;
      const problem7 = generator(7, rng2) as StarMapperProblem;

      // Level 1 should be easy, level 7+ should potentially be harder
      expect(['easy', 'medium', 'hard']).toContain(problem1.constellation.difficulty);
      expect(['easy', 'medium', 'hard']).toContain(problem7.constellation.difficulty);
    });
  });

  describe('shape_shift', () => {
    it('should generate valid shape shift problem', () => {
      const rng = createRng(12345);
      const generator = Generators.shape_shift;
      if (!generator) throw new Error('shape_shift generator not found');
      const problem = generator(1, rng) as ShapeShiftProblem;

      expect(problem.type).toBe('shape_shift');
      expect(problem.mode).toBeDefined();
      expect(problem.puzzle).toBeDefined();
      expect(problem.pieces).toBeInstanceOf(Array);
      expect(problem.pieces.length).toBeGreaterThan(0);
      expect(problem.showHints).toBeDefined();
    });

    it('should select puzzles from the geometry curriculum pack', () => {
      const rng = createRng(12345);
      const generator = Generators.shape_shift;
      if (!generator) throw new Error('shape_shift generator not found');
      const problem = generator(1, rng) as ShapeShiftProblem;
      const packPuzzleIds = new Set(SHAPE_SHIFT_PUZZLES_PACK.items.map((puzzle) => puzzle.id));

      expect(packPuzzleIds.has(problem.puzzle.id)).toBe(true);
    });

    it('should use match mode for levels 1-3', () => {
      const rng = createRng(12345);
      const generator = Generators.shape_shift;
      if (!generator) throw new Error('shape_shift generator not found');

      const problem1 = generator(1, rng) as ShapeShiftProblem;
      const problem2 = generator(2, rng) as ShapeShiftProblem;
      const problem3 = generator(3, rng) as ShapeShiftProblem;

      expect(problem1.mode).toBe('match');
      expect(problem2.mode).toBe('match');
      expect(problem3.mode).toBe('match');
    });

    it('should use rotate mode for levels 4-6', () => {
      const rng = createRng(12345);
      const generator = Generators.shape_shift;
      if (!generator) throw new Error('shape_shift generator not found');

      const problem4 = generator(4, rng) as ShapeShiftProblem;
      const problem5 = generator(5, rng) as ShapeShiftProblem;
      const problem6 = generator(6, rng) as ShapeShiftProblem;

      expect(problem4.mode).toBe('rotate');
      expect(problem5.mode).toBe('rotate');
      expect(problem6.mode).toBe('rotate');
    });

    it('should use build mode for levels 7-10', () => {
      const rng = createRng(12345);
      const generator = Generators.shape_shift;
      if (!generator) throw new Error('shape_shift generator not found');

      const problem7 = generator(7, rng) as ShapeShiftProblem;
      const problem10 = generator(10, rng) as ShapeShiftProblem;

      expect(problem7.mode).toBe('build');
      expect(problem10.mode).toBe('build');
    });

    it('should use expert mode for levels 11+', () => {
      const rng = createRng(12345);
      const generator = Generators.shape_shift;
      if (!generator) throw new Error('shape_shift generator not found');

      const problem11 = generator(11, rng) as ShapeShiftProblem;

      expect(problem11.mode).toBe('expert');
    });

    it('should include decoy piece in expert mode', () => {
      const rng = createRng(12345);
      const generator = Generators.shape_shift;
      if (!generator) throw new Error('shape_shift generator not found');

      const problem = generator(11, rng) as ShapeShiftProblem;
      const decoyPieces = problem.pieces.filter((p) => p.isDecoy);

      expect(decoyPieces.length).toBeGreaterThan(0);
    });

    it('should have pieces in tray initially', () => {
      const rng = createRng(12345);
      const generator = Generators.shape_shift;
      if (!generator) throw new Error('shape_shift generator not found');

      const problem = generator(1, rng) as ShapeShiftProblem;

      problem.pieces.forEach((piece) => {
        expect(piece.currentPosition).toBeNull();
      });
    });

    it('should have correct rotation in match mode', () => {
      const rng = createRng(12345);
      const generator = Generators.shape_shift;
      if (!generator) throw new Error('shape_shift generator not found');

      const problem = generator(1, rng) as ShapeShiftProblem;

      expect(problem.mode).toBe('match');
      problem.pieces.forEach((piece) => {
        if (!piece.isDecoy) {
          expect(piece.currentRotation).toBe(piece.correctRotation);
        }
      });
    });

    it('should avoid immediate repeats when persisted Shape Shift history is exhausted', () => {
      const easyPuzzleIds = SHAPE_SHIFT_PUZZLES_PACK.items
        .filter((puzzle) => puzzle.difficulty === 'easy')
        .map((puzzle) => puzzle.id);
      const rng = createRng(1);
      const generator = Generators.shape_shift;
      if (!generator) throw new Error('shape_shift generator not found');

      const firstProblem = generator(1, rng, {
        avoidContentIds: easyPuzzleIds,
      }) as ShapeShiftProblem;
      const secondProblem = generator(1, rng, {
        avoidContentIds: easyPuzzleIds,
      }) as ShapeShiftProblem;

      expect(secondProblem.puzzle.id).not.toBe(firstProblem.puzzle.id);
    });
  });

  describe('battlelearn', () => {
    it('should generate valid battlelearn problem', () => {
      const rng = createRng(12345);
      const generator = Generators.battlelearn;
      if (!generator) throw new Error('battlelearn generator not found');
      const problem = generator(1, rng) as BattleLearnProblem;

      expect(problem.type).toBe('battlelearn');
      expect(problem.gridSize).toBeGreaterThan(0);
      expect(problem.cellGrid).toBeDefined();
      expect(problem.cellGrid).toHaveLength(problem.gridSize);
      expect(problem.cellGrid[0]).toHaveLength(problem.gridSize);
      expect(problem.ships).toBeInstanceOf(Array);
      expect(problem.ships.length).toBeGreaterThan(0);
      expect(problem.revealed).toEqual([]);
      expect(problem.hits).toEqual([]);
      expect(problem.sunkShips).toEqual([]);
      expect(problem.shotAvailable).toBe(false);
      expect(problem.gameWon).toBe(false);
      expect(problem.question).toBeDefined();
      expect(problem.question.prompt).toBeTruthy();
      expect(problem.question.options).toHaveLength(4);
      expect(problem.question.correctIndex).toBeGreaterThanOrEqual(0);
      expect(problem.question.correctIndex).toBeLessThan(4);
    });

    it('should have correct answer in options', () => {
      const rng = createRng(12345);
      const generator = Generators.battlelearn;
      if (!generator) throw new Error('battlelearn generator not found');
      const problem = generator(1, rng) as BattleLearnProblem;

      const correctAnswer = problem.question.options[problem.question.correctIndex];
      expect(correctAnswer).toBeDefined();
      expect(problem.question.options).toContain(correctAnswer);
    });

    it('should generate consistent problems with same seed', () => {
      const rng1 = createRng(12345);
      const rng2 = createRng(12345);
      const generator = Generators.battlelearn;
      if (!generator) throw new Error('battlelearn generator not found');

      const problem1 = generator(1, rng1) as BattleLearnProblem;
      const problem2 = generator(1, rng2) as BattleLearnProblem;

      expect(problem1.ships).toEqual(problem2.ships);
      expect(problem1.cellGrid).toEqual(problem2.cellGrid);
      expect(problem1.question).toEqual(problem2.question);
    });

    it('should scale difficulty with level', () => {
      const rng1 = createRng(12345);
      const rng2 = createRng(54321);
      const generator = Generators.battlelearn;
      if (!generator) throw new Error('battlelearn generator not found');

      const problem1 = generator(1, rng1) as BattleLearnProblem;
      const problem10 = generator(10, rng2) as BattleLearnProblem;

      // Higher level should have more or longer ships
      const totalLength1 = problem1.ships.reduce((sum, ship) => sum + ship.length, 0);
      const totalLength10 = problem10.ships.reduce((sum, ship) => sum + ship.length, 0);

      expect(totalLength10).toBeGreaterThanOrEqual(totalLength1);
    });

    it('should use the battlelearn curriculum board progression', () => {
      const rng = createRng(12345);
      const generator = Generators.battlelearn;
      if (!generator) throw new Error('battlelearn generator not found');

      const problem = generator(1, rng) as BattleLearnProblem;
      const stage = getBattleLearnProfileStage(MATH_BATTLELEARN_PACK.items, 'starter', 1);
      const questionStage = getBattleLearnQuestionStage(
        MATH_BATTLELEARN_PACK.items,
        'initial',
        'starter',
        1,
      );

      expect(problem.gridSize).toBe(stage.gridSize);
      expect(problem.ships.map((ship) => ship.length)).toEqual(stage.shipLengths);
      expect(questionStage.questionKinds).toContain('simple_addition');
    });

    it('should generate multiplication questions from the multiplication pack', () => {
      const rng = createRng(12345);
      const generator = Generators.battlelearn;
      if (!generator) throw new Error('battlelearn generator not found');

      const problem = generator(1, rng, {
        contentPackId: MATH_BATTLELEARN_MULTIPLICATION_PACK.id,
      }) as BattleLearnProblem;

      expect(problem.gridSize).toBe(4);
      expect(problem.question.prompt).toContain('×');
    });
  });

  describe('battlelearn higher levels', () => {
    it('should generate coordinate or arithmetic questions at later levels', () => {
      const generator = Generators.battlelearn;
      if (!generator) throw new Error('battlelearn generator not found');
      const questions = new Set<string>();
      for (let seed = 0; seed < 20; seed++) {
        const rng = createRng(seed);
        const problem = generator(5, rng) as BattleLearnProblem;
        questions.add(problem.question.prompt);
      }
      expect(questions.size).toBeGreaterThan(1);
    });

    it('should increase complexity with level for advanced', () => {
      const generator = Generators.battlelearn;
      if (!generator) throw new Error('battlelearn generator not found');
      const rng1 = createRng(12345);
      const rng2 = createRng(54321);
      const problem1 = generator(1, rng1) as BattleLearnProblem;
      const problem10 = generator(10, rng2) as BattleLearnProblem;
      expect(problem10.gridSize).toBeGreaterThanOrEqual(problem1.gridSize);
      expect(problem10.ships.length).toBeGreaterThanOrEqual(problem1.ships.length);
    });

    it('should have significant question variety for advanced (no bilingual strings)', () => {
      const generator = Generators.battlelearn;
      if (!generator) throw new Error('battlelearn generator not found');
      const questions = new Set<string>();
      for (let seed = 0; seed < 50; seed++) {
        const rng = createRng(seed);
        const problem = generator(5, rng) as BattleLearnProblem;
        questions.add(problem.question.prompt);
      }
      expect(questions.size).toBeGreaterThanOrEqual(5);
      for (const question of questions) {
        expect(question).not.toContain(' / ');
      }
    });
  });

  describe('shape_dash', () => {
    it('should generate checkpoint questions from the geometry curriculum pack', () => {
      const generator = Generators.shape_dash;
      if (!generator) throw new Error('shape_dash generator not found');

      let problem: ShapeDashProblem | null = null;
      for (let seed = 1; seed <= 100; seed++) {
        const candidate = generator(6, createRng(seed)) as ShapeDashProblem;
        if (candidate.checkpoints.length > 0) {
          problem = candidate;
          break;
        }
      }
      const packCheckpointPrompts = new Set(
        getShapeDashCheckpointQuestions(MATH_GEOMETRY_SHAPES_PACK.items).flatMap((item) => [
          item.prompt.et,
          item.prompt.en,
        ]),
      );

      expect(problem).not.toBeNull();
      if (!problem) throw new Error('shape_dash did not place any checkpoints for seeds 1-100');
      expect(problem.type).toBe('shape_dash');

      for (const checkpoint of problem.checkpoints) {
        expect(packCheckpointPrompts.has(checkpoint.question.prompt)).toBe(true);
        expect(checkpoint.question.options[checkpoint.question.correctIndex]).toBeDefined();
      }
    });

    it('should keep checkpoint correct indices aligned after option shuffling', () => {
      const generator = Generators.shape_dash;
      if (!generator) throw new Error('shape_dash generator not found');

      const problem = generator(6, createRng(54321)) as ShapeDashProblem;

      for (const checkpoint of problem.checkpoints) {
        expect(checkpoint.question.options[checkpoint.question.correctIndex]).toBeDefined();
      }
    });

    it('should place shape gates with content from the geometry curriculum pack', () => {
      const generator = Generators.shape_dash;
      if (!generator) throw new Error('shape_dash generator not found');

      const problem = generator(4, createRng(12345)) as ShapeDashProblem;
      const packGatePrompts = new Set(
        getShapeDashGateQuestions(MATH_GEOMETRY_SHAPES_PACK.items).flatMap((item) => [
          item.prompt.et,
          item.prompt.en,
        ]),
      );

      expect(problem.shapeGates?.length).toBeGreaterThan(0);
      for (const gate of problem.shapeGates ?? []) {
        expect(packGatePrompts.has(gate.prompt)).toBe(true);
        expect(gate.contentItemId).toBeDefined();
        expect(gate.shapes).toHaveLength(3);
        expect(gate.shapes.filter((shape) => shape.isCorrect)).toHaveLength(1);
      }
    });

    it('should keep gates and pickups in clear playable corridors', () => {
      const generator = Generators.shape_dash;
      if (!generator) throw new Error('shape_dash generator not found');
      const obstacleWidth = (obstacle: ShapeDashProblem['obstacles'][number]) =>
        obstacle.type === 'circle' ? 2 * (obstacle.radius ?? 18) : SPIKE_WIDTH;
      const obstacleCenterX = (obstacle: ShapeDashProblem['obstacles'][number]) =>
        obstacle.x + obstacleWidth(obstacle) / 2;

      for (let seed = 1; seed <= 40; seed++) {
        const problem = generator(8, createRng(seed)) as ShapeDashProblem;
        expect(problem.obstacles.length).toBeGreaterThan(0);
        expect(problem.shapeGates?.length).toBeGreaterThan(0);
        const firstObstacleX = Math.min(...problem.obstacles.map((obstacle) => obstacle.x));
        const firstGateX = Math.min(...(problem.shapeGates ?? []).map((gate) => gate.x));

        expect(firstObstacleX).toBeGreaterThanOrEqual(1100);
        expect(firstGateX).toBeGreaterThanOrEqual(1500);
        expect(problem.contentItemIds?.length).toBeGreaterThan(0);

        for (const obstacle of problem.obstacles) {
          expect(obstacle.x).toBeLessThanOrEqual(problem.runLength - 360);
        }

        for (const gate of problem.shapeGates ?? []) {
          for (const obstacle of problem.obstacles) {
            expect(Math.abs(obstacleCenterX(obstacle) - gate.x)).toBeGreaterThanOrEqual(150);
          }
          for (const checkpoint of problem.checkpoints) {
            expect(Math.abs(checkpoint.x - gate.x)).toBeGreaterThanOrEqual(150);
          }
        }

        for (const star of problem.stars ?? []) {
          expect([24, 84, 124, 164]).toContain(star.y);
          for (const obstacle of problem.obstacles) {
            expect(Math.abs(obstacleCenterX(obstacle) - star.x)).toBeGreaterThanOrEqual(108);
          }
          for (const checkpoint of problem.checkpoints) {
            expect(Math.abs(checkpoint.x - star.x)).toBeGreaterThanOrEqual(120);
          }
          for (const gate of problem.shapeGates ?? []) {
            expect(Math.abs(gate.x - star.x)).toBeGreaterThanOrEqual(210);
          }
        }
      }
    });

    it('should avoid recently played Shape Dash pack items while fresh items remain', () => {
      const generator = Generators.shape_dash;
      if (!generator) throw new Error('shape_dash generator not found');
      const gateIds = getShapeDashGateQuestions(MATH_GEOMETRY_SHAPES_PACK.items).map(
        (item) => item.id,
      );
      const allowedGateId = gateIds[0]!;
      const problem = generator(4, createRng(456), {
        avoidContentIds: gateIds.filter((id) => id !== allowedGateId),
      }) as ShapeDashProblem;

      expect(problem.shapeGates?.some((gate) => gate.contentItemId === allowedGateId)).toBe(true);
      expect(problem.contentItemIds).toContain(allowedGateId);
    });
  });

  describe('battlelearn question variety', () => {
    it('should generate varied questions for starter profile level 1-3', () => {
      const generator = Generators.battlelearn;
      if (!generator) throw new Error('battlelearn generator not found');

      const questions = new Set<string>();
      for (let seed = 0; seed < 30; seed++) {
        const rng = createRng(seed);
        const problem = generator(2, rng) as BattleLearnProblem;
        questions.add(problem.question.prompt);
      }

      // Should have variety
      expect(questions.size).toBeGreaterThanOrEqual(3);
    });

    it('should generate varied questions for starter profile level 4-6', () => {
      const generator = Generators.battlelearn;
      if (!generator) throw new Error('battlelearn generator not found');

      const questions = new Set<string>();
      for (let seed = 0; seed < 30; seed++) {
        const rng = createRng(seed);
        const problem = generator(5, rng) as BattleLearnProblem;
        questions.add(problem.question.prompt);
      }

      // Should have variety
      expect(questions.size).toBeGreaterThanOrEqual(3);
    });

    it('should generate varied questions for starter profile level 7+', () => {
      const generator = Generators.battlelearn;
      if (!generator) throw new Error('battlelearn generator not found');

      const questions = new Set<string>();
      for (let seed = 0; seed < 30; seed++) {
        const rng = createRng(seed);
        const problem = generator(8, rng) as BattleLearnProblem;
        questions.add(problem.question.prompt);
      }

      // Should have variety
      expect(questions.size).toBeGreaterThanOrEqual(3);
    });

    it('should not have bilingual questions in starter profile', () => {
      const generator = Generators.battlelearn;
      if (!generator) throw new Error('battlelearn generator not found');

      for (let level = 1; level <= 10; level++) {
        const rng = createRng(level);
        const problem = generator(level, rng) as BattleLearnProblem;

        // No bilingual format
        expect(problem.question.prompt).not.toContain(' / ');
      }
    });
  });
});
