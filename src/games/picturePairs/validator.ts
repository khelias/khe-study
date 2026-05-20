import type { Problem } from '../../types/game';
import type { AnswerValidator } from '../registry';

/**
 * Validator for picture pairs (emoji–word memory game).
 * Component calls onAnswer(true) when all pairs are matched.
 */
export const validatePicturePairs: AnswerValidator = (
  _problem: Problem,
  userAnswer: unknown,
): boolean => {
  return userAnswer === true;
};
