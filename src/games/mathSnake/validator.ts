import type { Problem } from '../../types/game';
import type { AnswerValidator } from '../registry';

/**
 * Validator for math snake games (shared by all snake bindings).
 */
export const validateMathSnake: AnswerValidator = (
  problem: Problem,
  userAnswer: unknown,
): boolean => {
  if (problem.type !== 'math_snake') return false;
  return userAnswer === problem.math?.answer;
};
