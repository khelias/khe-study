/**
 * Answer Handler Engine
 *
 * Pure business logic for processing game answers.
 * This module handles the core logic of what happens when a player answers correctly or incorrectly.
 * UI concerns (notifications, animations) are handled by the calling code.
 */

import { isSnakeGameType, resolveMathSnakeAnswer } from './mathSnake';
import type { Problem, RngFunction } from '../types/game';

export interface AnswerResult {
  shouldShowFeedback: boolean;
  shouldShowParticles: boolean;
  shouldIncrementScore: boolean;
  shouldIncrementStars: boolean;
  shouldDecrementHearts: boolean;
  shouldEndGame: boolean;
  shouldLevelUp: boolean;
  updatedProblem: Problem | null;
  gameOver: boolean;
  points: number;
}

export interface AnswerHandlerContext {
  isCorrect: boolean;
  problem: Problem;
  gameType: string;
  currentStreak: number;
  // currentStars removed - stars are now persistent currency, not used for level-up
  // currentHearts removed - hearts are now persistent global resource in gameStore
  rng: RngFunction;
}

/**
 * Processes an answer for math snake game type
 */
export function processMathSnakeAnswer(context: AnswerHandlerContext): AnswerResult {
  const { isCorrect, problem, gameType, rng } = context;

  if (!isSnakeGameType(gameType) || problem.type !== 'math_snake') {
    throw new Error('processMathSnakeAnswer called for non-snake game');
  }

  // Points only come from eating apples, not from answering math questions
  const points = 0;
  let updatedProblem: Problem | null = null;
  let gameOver = false;

  if (isCorrect) {
    // Resolve the math snake answer (updates snake, spawns new apple)
    const resolution = resolveMathSnakeAnswer(problem, isCorrect, rng);
    updatedProblem = resolution.problem;
    gameOver = resolution.gameOver;

    return {
      shouldShowFeedback: true,
      shouldShowParticles: true,
      shouldIncrementScore: false, // No points for answering math questions
      shouldIncrementStars: true,
      shouldDecrementHearts: false,
      shouldEndGame: gameOver,
      shouldLevelUp: false, // Level up is handled separately based on star count
      updatedProblem,
      gameOver,
      points,
    };
  } else {
    // Wrong answer: should decrement hearts (handled by caller via gameStore.spendHeart)
    // Note: Hearts are now in gameStore, so we just indicate that hearts should be decremented
    // Game over will be determined by caller based on current hearts after spending

    return {
      shouldShowFeedback: true,
      shouldShowParticles: false,
      shouldIncrementScore: false,
      shouldIncrementStars: false,
      shouldDecrementHearts: true,
      shouldEndGame: false, // Will be determined by caller based on current hearts
      shouldLevelUp: false,
      updatedProblem: null, // Will be updated by caller if needed
      gameOver: false, // Will be determined by caller
      points: 0,
    };
  }
}

/**
 * Processes an answer for standard game types (non-math-snake)
 *
 * Note: Level-up logic will be updated in Phase 3 (performance-based, not star-based)
 */
export function processStandardAnswer(context: AnswerHandlerContext): AnswerResult {
  const { isCorrect } = context;
  const points = isCorrect ? 10 : 0;

  if (isCorrect) {
    // Note: Level-up will be handled in Phase 3 based on correct answers + accuracy
    // For now, remove star-based level-up logic
    return {
      shouldShowFeedback: true,
      shouldShowParticles: true,
      shouldIncrementScore: true,
      shouldIncrementStars: false, // Stars earned per-level completion (Phase 3)
      shouldDecrementHearts: false,
      shouldEndGame: false,
      shouldLevelUp: false, // Will be handled in Phase 3
      updatedProblem: null, // Standard games generate new problem after correct answer
      gameOver: false,
      points,
    };
  } else {
    // Wrong answer: should decrement hearts (handled by caller via gameStore.spendHeart)
    // Note: Hearts are now in gameStore, so we just indicate that hearts should be decremented
    // Game over will be determined by caller based on current hearts after spending

    return {
      shouldShowFeedback: true,
      shouldShowParticles: false,
      shouldIncrementScore: false,
      shouldIncrementStars: false,
      shouldDecrementHearts: true,
      shouldEndGame: false, // Will be determined by caller based on current hearts
      shouldLevelUp: false,
      updatedProblem: null,
      gameOver: false, // Will be determined by caller
      points: 0,
    };
  }
}

/**
 * Processes an answer for fact_drill game type.
 *
 * Sprint sessions reward correct answers with points but never penalize the
 * learner — wrong answers reset the in-session streak and that is the entire
 * cost. Hearts are not spent. The session itself ends when the view's timer
 * hits zero (`endGame()` from the play-session store), not from this result.
 */
export function processFactDrillAnswer(context: AnswerHandlerContext): AnswerResult {
  const { isCorrect, problem } = context;

  if (problem.type !== 'fact_drill') {
    throw new Error('processFactDrillAnswer called for non-fact-drill problem');
  }

  return {
    shouldShowFeedback: true,
    shouldShowParticles: isCorrect,
    shouldIncrementScore: isCorrect,
    shouldIncrementStars: false,
    shouldDecrementHearts: false,
    shouldEndGame: false,
    shouldLevelUp: false,
    updatedProblem: null,
    gameOver: false,
    points: isCorrect ? 1 : 0,
  };
}

/**
 * Processes an answer for word cascade (arcade) game type
 * Points scale with word length (stronger high-score chase).
 */
export function processWordCascadeAnswer(context: AnswerHandlerContext): AnswerResult {
  const { isCorrect, problem } = context;

  if (problem.type !== 'word_cascade') {
    throw new Error('processWordCascadeAnswer called for non-word-cascade game');
  }

  const len = problem.target.length;
  const points = isCorrect ? Math.max(10, len * 15) : 0;

  if (isCorrect) {
    return {
      shouldShowFeedback: true,
      shouldShowParticles: true,
      shouldIncrementScore: true,
      shouldIncrementStars: false,
      shouldDecrementHearts: false,
      shouldEndGame: false,
      shouldLevelUp: false,
      updatedProblem: null,
      gameOver: false,
      points,
    };
  }

  return {
    shouldShowFeedback: true,
    shouldShowParticles: false,
    shouldIncrementScore: false,
    shouldIncrementStars: false,
    shouldDecrementHearts: true,
    // For word cascade, a wrong answer means the run failed (after internal strikes),
    // so we end the game and spend exactly one heart.
    shouldEndGame: true,
    shouldLevelUp: false,
    updatedProblem: null,
    gameOver: false,
    points: 0,
  };
}

/**
 * Main answer processing function
 * Determines game type and routes to appropriate handler
 */
export function processAnswer(context: AnswerHandlerContext): AnswerResult {
  const { gameType, problem } = context;

  if (isSnakeGameType(gameType) && problem.type === 'math_snake') {
    return processMathSnakeAnswer(context);
  }

  if (problem.type === 'word_cascade') {
    return processWordCascadeAnswer(context);
  }

  if (problem.type === 'fact_drill') {
    return processFactDrillAnswer(context);
  }

  return processStandardAnswer(context);
}
