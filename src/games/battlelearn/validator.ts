import type { Problem } from '../../types/game';
import type { AnswerValidator } from '../registry';

/**
 * Validator for BattleLearn games. Validates the answer to the educational
 * question (the index of the selected option).
 */
export const validateBattleLearn: AnswerValidator = (
  problem: Problem,
  userAnswer: unknown,
): boolean => {
  if (problem.type !== 'battlelearn') return false;
  if (typeof userAnswer !== 'number') return false;
  return userAnswer === problem.question.correctIndex;
};
