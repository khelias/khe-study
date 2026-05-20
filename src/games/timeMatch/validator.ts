import type { Problem } from '../../types/game';
import type { AnswerValidator } from '../registry';

export const validateTimeMatch: AnswerValidator = (
  problem: Problem,
  userAnswer: unknown,
): boolean => {
  if (problem.type !== 'time_match') return false;
  return userAnswer === problem.answer;
};
