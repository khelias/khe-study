import type { Problem } from '../../types/game';
import type { AnswerValidator } from '../registry';

/**
 * Validator for syllable builder games.
 * Case-insensitive comparison to handle mixed case letters.
 */
export const validateSyllableBuilder: AnswerValidator = (
  problem: Problem,
  userAnswer: unknown,
): boolean => {
  if (problem.type !== 'syllable_builder') return false;
  if (typeof userAnswer !== 'string' || typeof problem.target !== 'string') return false;
  return userAnswer.toLowerCase() === problem.target.toLowerCase();
};
