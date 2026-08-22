import type { Problem } from '../../types/game';
import type { AnswerValidator } from '../registry';

/**
 * Validator for Shape Dash games.
 * View calls onAnswer(true) when run is completed; onAnswer(false) on crash or
 * wrong checkpoint.
 */
export const validateShapeDash: AnswerValidator = (
  problem: Problem,
  userAnswer: unknown,
): boolean => {
  if (problem.type !== 'shape_dash') return false;
  return userAnswer === true;
};
