import type { Problem } from '../../types/game';
import type { AnswerValidator } from '../registry';

/**
 * Validator for robo path games.
 * Note: Robo path doesn't have simple answer validation - it's handled in the
 * component. This is a placeholder.
 */
export const validateRoboPath: AnswerValidator = (
  _problem: Problem,
  _userAnswer: unknown,
): boolean => {
  return false;
};
