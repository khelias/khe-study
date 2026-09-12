import type { Problem } from '../../types/game';
import type { AnswerValidator } from '../registry';

/**
 * Validator for sentence logic games.
 */
export const validateSentenceLogic: AnswerValidator = (
  problem: Problem,
  userAnswer: unknown,
): boolean => {
  if (problem.type !== 'sentence_logic') return false;
  return userAnswer === problem.answer;
};
