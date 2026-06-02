/**
 * Game Answer Validators
 *
 * Validator functions for each game type.
 * These are pure functions that validate user answers against problems.
 */

import type { Problem } from '../types/game';
import type { AnswerValidator } from './registry';

// validateWordBuilder lives in src/games/wordBuilder/validator.ts.

// validateWordCascade lives in src/games/wordCascade/validator.ts.

// validateSyllableBuilder lives in src/games/syllableBuilder/validator.ts.

// validateLetterMatch lives in src/games/letterMatch/validator.ts.

// validateSentenceLogic lives in src/games/sentenceLogic/validator.ts.

// validatePattern lives in src/games/pattern/validator.ts.

// validateTimeMatch lives in src/games/timeMatch/validator.ts.

// validateBalanceScale lives in src/games/balanceScale/validator.ts.
// No central re-export — consumers import directly from the mechanic folder.

// validateUnitConversion lives in src/games/unitConversion/validator.ts.

// validateCompareSizes lives in src/games/compareSizes/validator.ts.

// validateMathSnake lives in src/games/mathSnake/validator.ts.

// validateMemoryMath lives in src/games/memoryMath/validator.ts.

// validatePicturePairs lives in src/games/picturePairs/validator.ts.

// validateRoboPath lives in src/games/roboPath/validator.ts.

// validateStarMapper lives in src/games/starMapper/validator.ts.

// validateShapeShift lives in src/games/shapeShift/validator.ts.

/**
 * Validator for BattleLearn games
 * Validates the answer to the educational question
 */
export const validateBattleLearn: AnswerValidator = (
  problem: Problem,
  userAnswer: unknown,
): boolean => {
  if (problem.type !== 'battlelearn') return false;

  // userAnswer should be the index of the selected option
  if (typeof userAnswer !== 'number') return false;

  return userAnswer === problem.question.correctIndex;
};

/**
 * Validator for Shape Dash games.
 * View calls onAnswer(true) when run is completed; onAnswer(false) on crash or wrong checkpoint.
 */
export const validateShapeDash: AnswerValidator = (
  problem: Problem,
  userAnswer: unknown,
): boolean => {
  if (problem.type !== 'shape_dash') return false;
  return userAnswer === true;
};

// validateFactDrill lives in src/games/factDrill/validator.ts.
