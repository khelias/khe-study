import type { Problem } from '../../types/game';
import type { AnswerValidator } from '../registry';

/**
 * Validator for letter match games.
 */
export const validateLetterMatch: AnswerValidator = (
  problem: Problem,
  userAnswer: unknown,
): boolean => {
  if (problem.type !== 'letter_match') return false;
  return userAnswer === (problem.answer ?? problem.targetLetter);
};
