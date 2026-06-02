import { generateBalanceScale } from './balanceScale/generator';
import { generateTimeMatch } from './timeMatch/generator';
import { generateCompareSizes } from './compareSizes/generator';
import { generateUnitConversion } from './unitConversion/generator';
import { generatePattern } from './pattern/generator';
import { generateMemoryMath } from './memoryMath/generator';
import { generatePicturePairs } from './picturePairs/generator';
import { generateSyllableBuilder } from './syllableBuilder/generator';
import { generateLetterMatch } from './letterMatch/generator';
import { generateSentenceLogic } from './sentenceLogic/generator';
import { generateStarMapper } from './starMapper/generator';
import { generateRoboPath } from './roboPath/generator';
import {
  generateAdditionSnake,
  generateAdditionBigSnake,
  generateSubtractionSnake,
  generateSubtractionBigSnake,
  generateMultiplicationSnake,
  generateMultiplicationBigSnake,
} from './mathSnake/generator';
import {
  generateMultiplicationFactDrill1To5,
  generateMultiplicationFactDrill1To10,
  generateAdditionFactDrillWithin20,
  generateAdditionFactDrillWithin100,
  generateSubtractionFactDrillWithin20,
  generateSubtractionFactDrillWithin100,
  generateDivisionFactDrill1To5,
  generateDivisionFactDrill1To10,
} from './factDrill/generator';
import { generateWordBuilder } from './wordBuilder/generator';
import { generateWordCascade, generateWordCascadeLong } from './wordCascade/generator';
import { generateShapeShift } from './shapeShift/generator';
import { generateBattleLearn } from './battlelearn/generator';
import { generateShapeDash } from './shapeDash/generator';
import type { GeneratorFunction } from '../types/game';

export const Generators: Record<string, GeneratorFunction> = {
  balance_scale: generateBalanceScale,

  word_builder: generateWordBuilder,

  word_cascade: generateWordCascade,

  word_cascade_long: generateWordCascadeLong,

  pattern: generatePattern,

  memory_math: generateMemoryMath,

  picture_pairs: generatePicturePairs,

  // Each snake generator resolves its own focused pack. One mechanic, many skills.
  addition_snake: generateAdditionSnake,
  addition_big_snake: generateAdditionBigSnake,
  subtraction_snake: generateSubtractionSnake,
  subtraction_big_snake: generateSubtractionBigSnake,
  multiplication_snake: generateMultiplicationSnake,
  multiplication_big_snake: generateMultiplicationBigSnake,

  // Fact Drill family — timed single-operator sprints (one mechanic, eight
  // skills). Generators live in src/games/factDrill/generator.ts.
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
