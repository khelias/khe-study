import type { Problem } from '../../types/game';
import type { AnswerValidator } from '../registry';

/**
 * Validator for word cascade games (shared by the core and long-word bindings).
 * Case-insensitive comparison to handle mixed case letters.
 */
export const validateWordCascade: AnswerValidator = (
  problem: Problem,
  userAnswer: unknown,
): boolean => {
  if (problem.type !== 'word_cascade') return false;
  if (typeof userAnswer !== 'string' || typeof problem.target !== 'string') return false;
  return userAnswer.toLowerCase() === problem.target.toLowerCase();
};
