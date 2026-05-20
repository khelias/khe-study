import type { Problem } from '../../types/game';
import type { AnswerValidator } from '../registry';

/**
 * Validator for memory math games.
 * The view calls onAnswer(true) when all pairs are matched.
 * This is a placeholder; component owns the complex matching state.
 */
export const validateMemoryMath: AnswerValidator = (
  _problem: Problem,
  _userAnswer: unknown,
): boolean => {
  return false;
};
