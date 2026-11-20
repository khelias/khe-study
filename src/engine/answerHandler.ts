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
  updatedProblem: Problem | null;
  /** The snake filled its board and has no room for an apple. */
  gameOver: boolean;
  points: number;
}

export interface AnswerHandlerContext {
  isCorrect: boolean;
  problem: Problem;
  gameType: string;
  currentStreak: number;
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
  if (isCorrect) {
    // Resolve the math snake answer (updates snake, spawns new apple)
    const resolution = resolveMathSnakeAnswer(problem, isCorrect, rng);
    const updatedProblem = resolution.problem;
    const gameOver = resolution.gameOver;

    return {
      shouldShowFeedback: true,
      shouldShowParticles: true,
      shouldIncrementScore: false, // No points for answering math questions
      updatedProblem,
      gameOver,
      points,
    };
  } else {
    return {
      shouldShowFeedback: true,
      shouldShowParticles: false,
      shouldIncrementScore: false,
      updatedProblem: null, // Will be updated by caller if needed
      gameOver: false,
      points: 0,
    };
  }
}

/**
 * Processes an answer for standard game types (non-math-snake)
 *
 */
export function processStandardAnswer(context: AnswerHandlerContext): AnswerResult {
  const { isCorrect } = context;
  const points = isCorrect ? 10 : 0;

  if (isCorrect) {
    return {
      shouldShowFeedback: true,
      shouldShowParticles: true,
      shouldIncrementScore: true,
      updatedProblem: null, // Standard games generate new problem after correct answer
      gameOver: false,
      points,
    };
  } else {
    return {
      shouldShowFeedback: true,
      shouldShowParticles: false,
      shouldIncrementScore: false,
      updatedProblem: null,
      gameOver: false,
      points: 0,
    };
  }
}

/**
 * Processes an answer for fact_drill game type.
 *
 * Sprint sessions reward correct answers with points but never penalize the
 * learner — wrong answers reset the in-session streak and that is the entire
 * cost. A timed round has no lives; it is judged when the view's clock stops.
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
      updatedProblem: null,
      gameOver: false,
      points,
    };
  }

  return {
    shouldShowFeedback: true,
    shouldShowParticles: false,
    shouldIncrementScore: false,
    updatedProblem: null,
    gameOver: false,
    points: 0,
  };
}

/**
 * Processes a Shape Dash run: its score is the stars and gates the run
 * collects, so finishing adds none of its own.
 */
export function processShapeDashAnswer(context: AnswerHandlerContext): AnswerResult {
  return { ...processStandardAnswer(context), shouldIncrementScore: false, points: 0 };
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

  if (problem.type === 'shape_dash') {
    return processShapeDashAnswer(context);
  }

  return processStandardAnswer(context);
}
