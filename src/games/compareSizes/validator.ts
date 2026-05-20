import type { Problem } from '../../types/game';
import type { AnswerValidator } from '../registry';

export const validateCompareSizes: AnswerValidator = (
  problem: Problem,
  userAnswer: unknown,
): boolean => {
  if (problem.type !== 'compare_sizes') return false;
  return userAnswer === problem.answer;
};
