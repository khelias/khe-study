import type { Problem } from '../../types/game';
import type { AnswerValidator } from '../registry';

export const validatePattern: AnswerValidator = (
  problem: Problem,
  userAnswer: unknown,
): boolean => {
  if (problem.type !== 'pattern') return false;
  return userAnswer === problem.answer;
};
