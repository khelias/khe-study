import type { Problem } from '../../types/game';
import type { AnswerValidator } from '../registry';

/**
 * Validator for fact_drill games. The view submits the typed numeric answer;
 * the validator compares it against the problem's computed product.
 */
export const validateFactDrill: AnswerValidator = (
  problem: Problem,
  userAnswer: unknown,
): boolean => {
  if (problem.type !== 'fact_drill') return false;
  return typeof userAnswer === 'number' && userAnswer === problem.answer;
};
