/**
 * Game Answer Validators
 *
 * Validator functions for each game type.
 * These are pure functions that validate user answers against problems.
 */

import type { Problem } from '../types/game';
import { shapeShiftPiecesCompatible } from '../engine/shapeShiftGrid';
import type { ShapeShiftSnapPiece } from '../engine/shapeShiftGrid';
import type { AnswerValidator } from './registry';

/**
 * Validator for word builder games
 * Case-insensitive comparison to handle mixed case letters
 */
export const validateWordBuilder: AnswerValidator = (
  problem: Problem,
  userAnswer: unknown,
): boolean => {
  if (problem.type !== 'word_builder') return false;
  if (typeof userAnswer !== 'string' || typeof problem.target !== 'string') return false;
  return userAnswer.toLowerCase() === problem.target.toLowerCase();
};

/**
 * Validator for word cascade games
 * Case-insensitive comparison to handle mixed case letters
 */
export const validateWordCascade: AnswerValidator = (
  problem: Problem,
  userAnswer: unknown,
): boolean => {
  if (problem.type !== 'word_cascade') return false;
  if (typeof userAnswer !== 'string' || typeof problem.target !== 'string') return false;
  return userAnswer.toLowerCase() === problem.target.toLowerCase();
};

// validateSyllableBuilder lives in src/games/syllableBuilder/validator.ts.

/**
 * Validator for letter match games
 */
export const validateLetterMatch: AnswerValidator = (
  problem: Problem,
  userAnswer: unknown,
): boolean => {
  if (problem.type !== 'letter_match') return false;
  return userAnswer === (problem.answer ?? problem.targetLetter);
};

/**
 * Validator for sentence logic games
 */
export const validateSentenceLogic: AnswerValidator = (
  problem: Problem,
  userAnswer: unknown,
): boolean => {
  if (problem.type !== 'sentence_logic') return false;
  return userAnswer === problem.answer;
};

// validatePattern lives in src/games/pattern/validator.ts.

// validateTimeMatch lives in src/games/timeMatch/validator.ts.

// validateBalanceScale lives in src/games/balanceScale/validator.ts.
// No central re-export — consumers import directly from the mechanic folder.

// validateUnitConversion lives in src/games/unitConversion/validator.ts.

// validateCompareSizes lives in src/games/compareSizes/validator.ts.

/**
 * Validator for math snake games
 */
export const validateMathSnake: AnswerValidator = (
  problem: Problem,
  userAnswer: unknown,
): boolean => {
  if (problem.type !== 'math_snake') return false;
  return userAnswer === problem.math?.answer;
};

// validateMemoryMath lives in src/games/memoryMath/validator.ts.

// validatePicturePairs lives in src/games/picturePairs/validator.ts.

/**
 * Validator for robo path games
 * Note: Robo path doesn't have simple answer validation - it's handled in the component
 */
export const validateRoboPath: AnswerValidator = (
  _problem: Problem,
  _userAnswer: unknown,
): boolean => {
  // Robo path validation is complex and handled in the component
  // This is a placeholder
  return false;
};

/**
 * Validator for star mapper games
 */
export const validateStarMapper: AnswerValidator = (
  problem: Problem,
  userAnswer: unknown,
): boolean => {
  if (problem.type !== 'star_mapper') return false;

  if (problem.mode === 'identify') {
    // For identify mode, answer is constellation ID
    return userAnswer === problem.correctAnswer;
  }

  // For trace/build/expert modes, answer is the lines drawn
  if (!Array.isArray(userAnswer)) return false;

  const playerLines = userAnswer as Array<{ from: string; to: string }>;
  const requiredLines = problem.constellation.lines;

  // Check if all required connections are made (order-independent, bidirectional)
  return requiredLines.every((required) =>
    playerLines.some(
      (player) =>
        (player.from === required.from && player.to === required.to) ||
        (player.from === required.to && player.to === required.from),
    ),
  );
};

/**
 * Validator for shape shift games.
 * Allows small position tolerance and checks rotation with symmetry for circle, square, etc.
 * Coordinate model: see src/engine/shapeShiftGrid.ts.
 */
export const validateShapeShift: AnswerValidator = (
  problem: Problem,
  userAnswer: unknown,
): boolean => {
  if (problem.type !== 'shape_shift') return false;

  type PlacedShapeShiftPiece = ShapeShiftSnapPiece & {
    currentPosition: { x: number; y: number } | null;
    currentRotation: number;
  };

  const placedPieces = userAnswer as PlacedShapeShiftPiece[];

  if (!Array.isArray(placedPieces)) return false;

  // Get required (non-decoy) pieces
  const requiredPieces = problem.puzzle.pieces.filter((p) => !p.isDecoy);

  // Count placed non-decoy pieces
  const placedNonDecoy = placedPieces.filter((p) => !p.isDecoy && p.currentPosition !== null);

  if (placedNonDecoy.length !== requiredPieces.length) return false;

  const usedPlacedIndexes = new Set<number>();

  return requiredPieces.every((required) => {
    const matchIndex = placedNonDecoy.findIndex((placed, index) => {
      if (usedPlacedIndexes.has(index) || !placed.currentPosition) return false;
      if (!shapeShiftPiecesCompatible(placed, required)) return false;

      // Check position: allow ±10 units on 100x100 grid for more leeway when placing
      const POSITION_TOLERANCE = 10;
      const positionOk =
        Math.abs(placed.currentPosition.x - required.correctPosition.x) <= POSITION_TOLERANCE &&
        Math.abs(placed.currentPosition.y - required.correctPosition.y) <= POSITION_TOLERANCE;

      // Check rotation (handle symmetric shapes)
      const placedRot = ((placed.currentRotation % 360) + 360) % 360;
      const correctRot = ((required.correctRotation % 360) + 360) % 360;
      const ROTATION_TOLERANCE = 15; // ±15 degrees

      // Helper to check if angles are close (modulo 360)
      const isAngleClose = (a: number, b: number, tolerance: number) => {
        const diff = Math.abs(a - b) % 360;
        return diff <= tolerance || diff >= 360 - tolerance;
      };

      let rotationOk = false;

      if (required.type === 'circle') {
        rotationOk = true; // Rotation irrelevant
      } else if (required.type === 'square' || required.type === 'diamond') {
        // 90° symmetry: (placed - correct) should be multiple of 90
        const diff = Math.abs(placedRot - correctRot) % 90;
        rotationOk = diff <= ROTATION_TOLERANCE || diff >= 90 - ROTATION_TOLERANCE;
      } else if (required.type === 'rectangle' || required.type === 'hexagon') {
        // 180° symmetry
        const diff = Math.abs(placedRot - correctRot) % 180;
        rotationOk = diff <= ROTATION_TOLERANCE || diff >= 180 - ROTATION_TOLERANCE;
      } else {
        // No symmetry (triangles)
        rotationOk = isAngleClose(placedRot, correctRot, ROTATION_TOLERANCE);
      }

      return positionOk && rotationOk;
    });

    if (matchIndex === -1) return false;
    usedPlacedIndexes.add(matchIndex);
    return true;
  });
};

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

/**
 * Validator for fact_drill games. The view submits the typed numeric answer;
 * the validator compares it against the problem's computed product.
 */
export const validateFactDrill: AnswerValidator = (
  problem: Problem,
  userAnswer: unknown,
): boolean => {
  if (problem.type !== 'fact_drill') return false;
  return typeof userAnswer === 'number' && userAnswer === problem.answer;
};
