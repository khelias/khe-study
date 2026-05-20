import type { Problem } from '../../types/game';
import type { AnswerValidator } from '../registry';

export const validateBalanceScale: AnswerValidator = (
  problem: Problem,
  userAnswer: unknown,
): boolean => {
  if (problem.type !== 'balance_scale') return false;
  return userAnswer === problem.answer;
};
