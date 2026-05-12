/**
 * Game Registrations
 *
 * This file registers all games with the game registry.
 * To add a new game:
 * 1. Create the game view component
 * 2. Create the generator function
 * 3. Create the validator function
 * 4. Add registration here
 *
 * Games are automatically registered when this module is imported.
 */

import { gameRegistry } from './registry';
import { GAME_CONFIG } from './data';
import { Generators } from './generators';
// Side-effect import: registers skills + content packs before any mechanic binding
// below references them by id.
import '../curriculum';
import { ASTRONOMY_VISIBLE_CONSTELLATIONS_SKILL } from '../curriculum/skills/astronomy';
import { ASTRONOMY_VISIBLE_FROM_ESTONIA_PACK } from '../curriculum/packs/astronomy/visibleFromEstonia';
import {
  LANGUAGE_LONG_VOCABULARY_SKILL,
  LANGUAGE_SPATIAL_SENTENCES_SKILL,
  LANGUAGE_SYLLABIFICATION_SKILL,
  LANGUAGE_VOCABULARY_SKILL,
} from '../curriculum/skills/language';
import { LANGUAGE_SPATIAL_SENTENCES_PACK } from '../curriculum/packs/language/spatialSentences';
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
} from '../curriculum/skills/math';
import { MATH_ADDITION_WITHIN_20_PACK } from '../curriculum/packs/math/addition_within_20';
import { MATH_ADDITION_WITHIN_100_PACK } from '../curriculum/packs/math/addition_within_100';
import { MATH_SUBTRACTION_WITHIN_20_PACK } from '../curriculum/packs/math/subtraction_within_20';
import { MATH_SUBTRACTION_WITHIN_100_PACK } from '../curriculum/packs/math/subtraction_within_100';
import { MATH_MULTIPLICATION_1_5_PACK } from '../curriculum/packs/math/multiplication_1_5';
import { MATH_MULTIPLICATION_1_10_PACK } from '../curriculum/packs/math/multiplication_1_10';
import { MATH_GEOMETRY_SHAPES_PACK } from '../curriculum/packs/math/geometry_shapes';
import { MATH_PATTERN_SEQUENCES_PACK } from '../curriculum/packs/math/pattern_sequences';
import { MATH_UNIT_CONVERSIONS_PACK } from '../curriculum/packs/math/unit_conversions';
import { MATH_COMPARE_NUMBERS_PACK } from '../curriculum/packs/math/compare_numbers';
import { MATH_TIME_READING_PACK } from '../curriculum/packs/math/time_reading';
import { MATH_BALANCE_EQUATIONS_PACK } from '../curriculum/packs/math/balance_equations';
import { MATH_ADDITION_MEMORY_PACK } from '../curriculum/packs/math/addition_memory';
import { MATH_GRID_NAVIGATION_PACK } from '../curriculum/packs/math/grid_navigation';
import { MATH_BATTLELEARN_PACK } from '../curriculum/packs/math/battlelearn';
import { SHAPE_SHIFT_PUZZLES_PACK } from '../curriculum/packs/geometry/shapeShiftPuzzles';
import {
  BalanceScaleView,
  StandardGameView,
  WordGameView,
  WordCascadeView,
  PatternTrainView,
  MemoryGameView,
  PicturePairsView,
  RoboPathView,
  SyllableGameView,
  TimeGameView,
  UnitConversionView,
  StarMapperView,
  ShapeShiftView,
  ShapeDashView,
  BattleLearnView,
  FactDrillView,
} from '../components/gameViews';
import { MathSnakeView } from '../components/MathSnakeView';
import { CompareSizesView } from '../components/CompareSizesView';
import {
  validateWordBuilder,
  validateWordCascade,
  validateSyllableBuilder,
  validateLetterMatch,
  validateSentenceLogic,
  validatePattern,
  validateTimeMatch,
  validateBalanceScale,
  validateUnitConversion,
  validateCompareSizes,
  validateMathSnake,
  validateMemoryMath,
  validatePicturePairs,
  validateRoboPath,
  validateStarMapper,
  validateShapeShift,
  validateShapeDash,
  validateBattleLearn,
  validateFactDrill,
} from './validators';

/**
 * Register all games with the registry
 *
 * This function is called automatically when the module is imported.
 */
function registerAllGames(): void {
  // Word Builder
  const wordBuilderConfig = GAME_CONFIG.word_builder;
  const wordBuilderGenerator = Generators.word_builder;
  if (!wordBuilderConfig || !wordBuilderGenerator) {
    console.error('Missing word_builder config or generator');
    return;
  }
  gameRegistry.register({
    id: 'word_builder',
    component: WordGameView,
    generator: wordBuilderGenerator,
    config: wordBuilderConfig,
    validator: validateWordBuilder,
    allowedProfiles: wordBuilderConfig.allowedProfiles,
    skillIds: [LANGUAGE_VOCABULARY_SKILL.id],
  });

  // Word Cascade
  const wordCascadeConfig = GAME_CONFIG.word_cascade;
  const wordCascadeGenerator = Generators.word_cascade;
  if (wordCascadeConfig && wordCascadeGenerator) {
    gameRegistry.register({
      id: 'word_cascade',
      component: WordCascadeView,
      generator: wordCascadeGenerator,
      config: wordCascadeConfig,
      validator: validateWordCascade,
      allowedProfiles: wordCascadeConfig.allowedProfiles,
      skillIds: [LANGUAGE_VOCABULARY_SKILL.id],
    });
  }

  // Word Cascade: long-word pack binding (same mechanic/view as Sõnakosk).
  const wordCascadeLongConfig = GAME_CONFIG.word_cascade_long;
  const wordCascadeLongGenerator = Generators.word_cascade_long;
  if (wordCascadeLongConfig && wordCascadeLongGenerator) {
    gameRegistry.register({
      id: 'word_cascade_long',
      component: WordCascadeView,
      generator: wordCascadeLongGenerator,
      config: wordCascadeLongConfig,
      validator: validateWordCascade,
      allowedProfiles: wordCascadeLongConfig.allowedProfiles,
      skillIds: [LANGUAGE_LONG_VOCABULARY_SKILL.id],
    });
  }

  // Syllable Builder — curriculum-backed binding.
  // Mechanic: order scrambled syllables into the correct word.
  // Content: LANGUAGE_SYLLABIFICATION_SKILL has one pack per locale (et, en);
  // the generator resolves the right one at runtime via getPackItemsForLocale.
  const syllableBuilderConfig = GAME_CONFIG.syllable_builder;
  const syllableBuilderGenerator = Generators.syllable_builder;
  if (syllableBuilderConfig && syllableBuilderGenerator) {
    gameRegistry.register({
      id: 'syllable_builder',
      component: SyllableGameView,
      generator: syllableBuilderGenerator,
      config: syllableBuilderConfig,
      validator: validateSyllableBuilder,
      allowedProfiles: syllableBuilderConfig.allowedProfiles,
      skillIds: [LANGUAGE_SYLLABIFICATION_SKILL.id],
    });
  }

  // Pattern Train
  const patternConfig = GAME_CONFIG.pattern;
  const patternGenerator = Generators.pattern;
  if (patternConfig && patternGenerator) {
    gameRegistry.register({
      id: 'pattern',
      component: PatternTrainView,
      generator: patternGenerator,
      config: patternConfig,
      validator: validatePattern,
      allowedProfiles: patternConfig.allowedProfiles,
      skillIds: [MATH_PATTERN_SEQUENCES_SKILL.id],
      contentPackId: MATH_PATTERN_SEQUENCES_PACK.id,
    });
  }

  // Sentence Logic
  const sentenceLogicConfig = GAME_CONFIG.sentence_logic;
  const sentenceLogicGenerator = Generators.sentence_logic;
  if (sentenceLogicConfig && sentenceLogicGenerator) {
    gameRegistry.register({
      id: 'sentence_logic',
      component: StandardGameView,
      generator: sentenceLogicGenerator,
      config: sentenceLogicConfig,
      validator: validateSentenceLogic,
      allowedProfiles: sentenceLogicConfig.allowedProfiles,
      skillIds: [LANGUAGE_SPATIAL_SENTENCES_SKILL.id],
      contentPackId: LANGUAGE_SPATIAL_SENTENCES_PACK.id,
    });
  }

  // Memory Math
  const memoryMathConfig = GAME_CONFIG.memory_math;
  const memoryMathGenerator = Generators.memory_math;
  if (memoryMathConfig && memoryMathGenerator) {
    gameRegistry.register({
      id: 'memory_math',
      component: MemoryGameView,
      generator: memoryMathGenerator,
      config: memoryMathConfig,
      validator: validateMemoryMath,
      allowedProfiles: memoryMathConfig.allowedProfiles,
      skillIds: [MATH_ADDITION_MEMORY_SKILL.id],
      contentPackId: MATH_ADDITION_MEMORY_PACK.id,
    });
  }

  // Picture Pairs (emoji–word memory)
  const picturePairsConfig = GAME_CONFIG.picture_pairs;
  const picturePairsGenerator = Generators.picture_pairs;
  if (picturePairsConfig && picturePairsGenerator) {
    gameRegistry.register({
      id: 'picture_pairs',
      component: PicturePairsView,
      generator: picturePairsGenerator,
      config: picturePairsConfig,
      validator: validatePicturePairs,
      allowedProfiles: picturePairsConfig.allowedProfiles,
      skillIds: [LANGUAGE_VOCABULARY_SKILL.id],
    });
  }

  // Robo Path
  const roboPathConfig = GAME_CONFIG.robo_path;
  const roboPathGenerator = Generators.robo_path;
  if (roboPathConfig && roboPathGenerator) {
    gameRegistry.register({
      id: 'robo_path',
      component: RoboPathView,
      generator: roboPathGenerator,
      config: roboPathConfig,
      validator: validateRoboPath,
      allowedProfiles: roboPathConfig.allowedProfiles,
      skillIds: [MATH_GRID_NAVIGATION_SKILL.id],
      contentPackId: MATH_GRID_NAVIGATION_PACK.id,
    });
  }

  // -------------------------------------------------------------------------
  // Snake family — one mechanic (MathSnakeView + mathSnake engine), many skills.
  // Each binding is a distinct menu card bound to a focused ArithmeticSpec pack.
  // Add a new operation / range by writing one pack + one binding; no engine code.
  // -------------------------------------------------------------------------

  // Addition kuni 20
  const additionSnakeConfig = GAME_CONFIG.addition_snake;
  const additionSnakeGenerator = Generators.addition_snake;
  if (additionSnakeConfig && additionSnakeGenerator) {
    gameRegistry.register({
      id: 'addition_snake',
      component: MathSnakeView,
      generator: additionSnakeGenerator,
      config: additionSnakeConfig,
      validator: validateMathSnake,
      allowedProfiles: additionSnakeConfig.allowedProfiles,
      skillIds: [MATH_ADDITION_WITHIN_20_SKILL.id],
      contentPackId: MATH_ADDITION_WITHIN_20_PACK.id,
    });
  }

  // Addition kuni 100
  const additionBigSnakeConfig = GAME_CONFIG.addition_big_snake;
  const additionBigSnakeGenerator = Generators.addition_big_snake;
  if (additionBigSnakeConfig && additionBigSnakeGenerator) {
    gameRegistry.register({
      id: 'addition_big_snake',
      component: MathSnakeView,
      generator: additionBigSnakeGenerator,
      config: additionBigSnakeConfig,
      validator: validateMathSnake,
      allowedProfiles: additionBigSnakeConfig.allowedProfiles,
      skillIds: [MATH_ADDITION_WITHIN_100_SKILL.id],
      contentPackId: MATH_ADDITION_WITHIN_100_PACK.id,
    });
  }

  // Subtraction kuni 20
  const subtractionSnakeConfig = GAME_CONFIG.subtraction_snake;
  const subtractionSnakeGenerator = Generators.subtraction_snake;
  if (subtractionSnakeConfig && subtractionSnakeGenerator) {
    gameRegistry.register({
      id: 'subtraction_snake',
      component: MathSnakeView,
      generator: subtractionSnakeGenerator,
      config: subtractionSnakeConfig,
      validator: validateMathSnake,
      allowedProfiles: subtractionSnakeConfig.allowedProfiles,
      skillIds: [MATH_SUBTRACTION_WITHIN_20_SKILL.id],
      contentPackId: MATH_SUBTRACTION_WITHIN_20_PACK.id,
    });
  }

  // Subtraction kuni 100
  const subtractionBigSnakeConfig = GAME_CONFIG.subtraction_big_snake;
  const subtractionBigSnakeGenerator = Generators.subtraction_big_snake;
  if (subtractionBigSnakeConfig && subtractionBigSnakeGenerator) {
    gameRegistry.register({
      id: 'subtraction_big_snake',
      component: MathSnakeView,
      generator: subtractionBigSnakeGenerator,
      config: subtractionBigSnakeConfig,
      validator: validateMathSnake,
      allowedProfiles: subtractionBigSnakeConfig.allowedProfiles,
      skillIds: [MATH_SUBTRACTION_WITHIN_100_SKILL.id],
      contentPackId: MATH_SUBTRACTION_WITHIN_100_PACK.id,
    });
  }

  // Multiplication 1–5 — cosmic theme, 2. klass
  const multiplicationSnakeConfig = GAME_CONFIG.multiplication_snake;
  const multiplicationSnakeGenerator = Generators.multiplication_snake;
  if (multiplicationSnakeConfig && multiplicationSnakeGenerator) {
    gameRegistry.register({
      id: 'multiplication_snake',
      component: MathSnakeView,
      generator: multiplicationSnakeGenerator,
      config: multiplicationSnakeConfig,
      validator: validateMathSnake,
      allowedProfiles: multiplicationSnakeConfig.allowedProfiles,
      skillIds: [MATH_MULTIPLICATION_1_TO_5_SKILL.id],
      contentPackId: MATH_MULTIPLICATION_1_5_PACK.id,
    });
  }

  // Multiplication 1–10 — cosmic theme, 3. klass
  const multiplicationBigSnakeConfig = GAME_CONFIG.multiplication_big_snake;
  const multiplicationBigSnakeGenerator = Generators.multiplication_big_snake;
  if (multiplicationBigSnakeConfig && multiplicationBigSnakeGenerator) {
    gameRegistry.register({
      id: 'multiplication_big_snake',
      component: MathSnakeView,
      generator: multiplicationBigSnakeGenerator,
      config: multiplicationBigSnakeConfig,
      validator: validateMathSnake,
      allowedProfiles: multiplicationBigSnakeConfig.allowedProfiles,
      skillIds: [MATH_MULTIPLICATION_1_TO_10_SKILL.id],
      contentPackId: MATH_MULTIPLICATION_1_10_PACK.id,
    });
  }

  // -------------------------------------------------------------------------
  // Fact Drill family — one mechanic (FactDrillView + factDrill engine), many
  // skills. Each binding reuses the same engine + view; the only per-binding
  // data is the factor range + skill + pack. Future addition / subtraction
  // fact sidumised land as data-only changes (one generator + one binding).
  // -------------------------------------------------------------------------

  const multiplicationFactDrill1To5Config = GAME_CONFIG.multiplication_fact_drill_1_5;
  const multiplicationFactDrill1To5Generator = Generators.multiplication_fact_drill_1_5;
  if (multiplicationFactDrill1To5Config && multiplicationFactDrill1To5Generator) {
    gameRegistry.register({
      id: 'multiplication_fact_drill_1_5',
      component: FactDrillView,
      generator: multiplicationFactDrill1To5Generator,
      config: multiplicationFactDrill1To5Config,
      validator: validateFactDrill,
      allowedProfiles: multiplicationFactDrill1To5Config.allowedProfiles,
      skillIds: [MATH_MULTIPLICATION_1_TO_5_SKILL.id],
      contentPackId: MATH_MULTIPLICATION_1_5_PACK.id,
    });
  }

  const multiplicationFactDrill1To10Config = GAME_CONFIG.multiplication_fact_drill_1_10;
  const multiplicationFactDrill1To10Generator = Generators.multiplication_fact_drill_1_10;
  if (multiplicationFactDrill1To10Config && multiplicationFactDrill1To10Generator) {
    gameRegistry.register({
      id: 'multiplication_fact_drill_1_10',
      component: FactDrillView,
      generator: multiplicationFactDrill1To10Generator,
      config: multiplicationFactDrill1To10Config,
      validator: validateFactDrill,
      allowedProfiles: multiplicationFactDrill1To10Config.allowedProfiles,
      skillIds: [MATH_MULTIPLICATION_1_TO_10_SKILL.id],
      contentPackId: MATH_MULTIPLICATION_1_10_PACK.id,
    });
  }

  // Letter Match
  const letterMatchConfig = GAME_CONFIG.letter_match;
  const letterMatchGenerator = Generators.letter_match;
  if (letterMatchConfig && letterMatchGenerator) {
    gameRegistry.register({
      id: 'letter_match',
      component: StandardGameView,
      generator: letterMatchGenerator,
      config: letterMatchConfig,
      validator: validateLetterMatch,
      allowedProfiles: letterMatchConfig.allowedProfiles,
      skillIds: [LANGUAGE_VOCABULARY_SKILL.id],
    });
  }

  // Unit Conversion
  const unitConversionConfig = GAME_CONFIG.unit_conversion;
  const unitConversionGenerator = Generators.unit_conversion;
  if (unitConversionConfig && unitConversionGenerator) {
    gameRegistry.register({
      id: 'unit_conversion',
      component: UnitConversionView,
      generator: unitConversionGenerator,
      config: unitConversionConfig,
      validator: validateUnitConversion,
      allowedProfiles: unitConversionConfig.allowedProfiles,
      skillIds: [MATH_UNIT_CONVERSIONS_SKILL.id],
      contentPackId: MATH_UNIT_CONVERSIONS_PACK.id,
    });
  }

  // Compare Sizes
  const compareSizesConfig = GAME_CONFIG.compare_sizes;
  const compareSizesGenerator = Generators.compare_sizes;
  if (compareSizesConfig && compareSizesGenerator) {
    gameRegistry.register({
      id: 'compare_sizes',
      component: CompareSizesView,
      generator: compareSizesGenerator,
      config: compareSizesConfig,
      validator: validateCompareSizes,
      allowedProfiles: compareSizesConfig.allowedProfiles,
      skillIds: [MATH_COMPARE_NUMBERS_SKILL.id],
      contentPackId: MATH_COMPARE_NUMBERS_PACK.id,
    });
  }

  // Balance Scale (Advanced)
  const balanceScaleConfig = GAME_CONFIG.balance_scale;
  const balanceScaleGenerator = Generators.balance_scale;
  if (balanceScaleConfig && balanceScaleGenerator) {
    gameRegistry.register({
      id: 'balance_scale',
      component: BalanceScaleView,
      generator: balanceScaleGenerator,
      config: balanceScaleConfig,
      validator: validateBalanceScale,
      allowedProfiles: balanceScaleConfig.allowedProfiles,
      skillIds: [MATH_BALANCE_EQUATIONS_SKILL.id],
      contentPackId: MATH_BALANCE_EQUATIONS_PACK.id,
    });
  }

  // Time Match (Advanced)
  const timeMatchConfig = GAME_CONFIG.time_match;
  const timeMatchGenerator = Generators.time_match;
  if (timeMatchConfig && timeMatchGenerator) {
    gameRegistry.register({
      id: 'time_match',
      component: TimeGameView,
      generator: timeMatchGenerator,
      config: timeMatchConfig,
      validator: validateTimeMatch,
      allowedProfiles: timeMatchConfig.allowedProfiles,
      skillIds: [MATH_TIME_READING_SKILL.id],
      contentPackId: MATH_TIME_READING_PACK.id,
    });
  }

  // Star Mapper — curriculum-backed binding.
  // Mechanic: trace / build / identify constellation shapes.
  // Content: ASTRONOMY_VISIBLE_FROM_ESTONIA_PACK (constellations visible from 59°N).
  const starMapperConfig = GAME_CONFIG.star_mapper;
  const starMapperGenerator = Generators.star_mapper;
  if (starMapperConfig && starMapperGenerator) {
    gameRegistry.register({
      id: 'star_mapper',
      component: StarMapperView,
      generator: starMapperGenerator,
      config: starMapperConfig,
      validator: validateStarMapper,
      allowedProfiles: starMapperConfig.allowedProfiles,
      skillIds: [ASTRONOMY_VISIBLE_CONSTELLATIONS_SKILL.id],
      contentPackId: ASTRONOMY_VISIBLE_FROM_ESTONIA_PACK.id,
    });
  }

  // Shape Shift
  const shapeShiftConfig = GAME_CONFIG.shape_shift;
  const shapeShiftGenerator = Generators.shape_shift;
  if (shapeShiftConfig && shapeShiftGenerator) {
    gameRegistry.register({
      id: 'shape_shift',
      component: ShapeShiftView,
      generator: shapeShiftGenerator,
      config: shapeShiftConfig,
      validator: validateShapeShift,
      allowedProfiles: shapeShiftConfig.allowedProfiles,
      skillIds: [MATH_GEOMETRY_SHAPES_SKILL.id],
      contentPackId: SHAPE_SHIFT_PUZZLES_PACK.id,
    });
  }

  // Shape Dash (Geometry Dash–inspired runner with geometry checkpoints)
  const shapeDashConfig = GAME_CONFIG.shape_dash;
  const shapeDashGenerator = Generators.shape_dash;
  if (shapeDashConfig && shapeDashGenerator) {
    gameRegistry.register({
      id: 'shape_dash',
      component: ShapeDashView,
      generator: shapeDashGenerator,
      config: shapeDashConfig,
      validator: validateShapeDash,
      allowedProfiles: shapeDashConfig.allowedProfiles,
      skillIds: [MATH_GEOMETRY_SHAPES_SKILL.id],
      contentPackId: MATH_GEOMETRY_SHAPES_PACK.id,
    });
  }

  // BattleLearn (profile-based difficulty in generator)
  const battlelearnConfig = GAME_CONFIG.battlelearn;
  const battlelearnGenerator = Generators.battlelearn;
  if (battlelearnConfig && battlelearnGenerator) {
    gameRegistry.register({
      id: 'battlelearn',
      component: BattleLearnView,
      generator: battlelearnGenerator,
      config: battlelearnConfig,
      validator: validateBattleLearn,
      allowedProfiles: battlelearnConfig.allowedProfiles,
      skillIds: [MATH_MIXED_PROBLEM_SOLVING_SKILL.id],
      contentPackId: MATH_BATTLELEARN_PACK.id,
    });
  }
}

// Auto-register games when module is imported
registerAllGames();
