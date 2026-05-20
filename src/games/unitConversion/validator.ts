import type { Problem } from '../../types/game';
import type { AnswerValidator } from '../registry';

export const validateUnitConversion: AnswerValidator = (
  problem: Problem,
  userAnswer: unknown,
): boolean => {
  if (problem.type !== 'unit_conversion') return false;
  return userAnswer === problem.answer;
};
