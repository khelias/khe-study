import type { FigureLine, Problem } from '../../types/game';
import { inFigure } from './drawing';
import type { AnswerValidator } from '../registry';

/**
 * star_mapper validator: a string is the naming step's answer (a
 * constellation id); an array is the lines drawn, as Hipparcos pairs.
 */
export const validateStarMapper: AnswerValidator = (
  problem: Problem,
  userAnswer: unknown,
): boolean => {
  if (problem.type !== 'star_mapper') return false;
  if (typeof userAnswer === 'string') return userAnswer === problem.correctAnswer;
  if (!Array.isArray(userAnswer)) return false;
  const drawn = userAnswer as FigureLine[];
  return problem.constellation.lines.every((line) => inFigure(drawn, line));
};
