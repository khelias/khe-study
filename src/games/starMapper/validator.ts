import type { Problem } from '../../types/game';
import type { AnswerValidator } from '../registry';

/**
 * Validator for star mapper games.
 */
export const validateStarMapper: AnswerValidator = (
  problem: Problem,
  userAnswer: unknown,
): boolean => {
  if (problem.type !== 'star_mapper') return false;

  if (problem.mode === 'identify') {
    // For identify mode, answer is constellation ID
    return userAnswer === problem.correctAnswer;
  }

  // For trace/build/expert modes, answer is the lines drawn
  if (!Array.isArray(userAnswer)) return false;

  const playerLines = userAnswer as Array<{ from: string; to: string }>;
  const requiredLines = problem.constellation.lines;

  // Check if all required connections are made (order-independent, bidirectional)
  return requiredLines.every((required) =>
    playerLines.some(
      (player) =>
        (player.from === required.from && player.to === required.to) ||
        (player.from === required.to && player.to === required.from),
    ),
  );
};
