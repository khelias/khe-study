import type { Problem } from '../../types/game';
import type { AnswerValidator } from '../registry';

/**
 * Validator for word builder games.
 * Case-insensitive comparison to handle mixed case letters.
 */
export const validateWordBuilder: AnswerValidator = (
  problem: Problem,
  userAnswer: unknown,
): boolean => {
  if (problem.type !== 'word_builder') return false;
  if (typeof userAnswer !== 'string' || typeof problem.target !== 'string') return false;
  return userAnswer.toLowerCase() === problem.target.toLowerCase();
};
