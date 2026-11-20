/**
 * useAnswerHandler Hook
 *
 * Encapsulates answer handling logic for games.
 * Coordinates between engine logic and UI state updates.
 */

import { useCallback } from 'react';
import { useGameStore } from '../stores/gameStore';
import { usePlaySessionStore } from '../stores/playSessionStore';
import { useGameEngine } from './useGameEngine';
import { useProfileText } from './useProfileText';
import { processAnswer } from '../engine/answerHandler';
import {
  expandSnakeGrid,
  isSnakeGameType,
  respawnMathSnake,
  SNAKE_STREAK_MILESTONE,
} from '../engine/mathSnake';
import { getRandomEncouragement } from '../components/FeedbackSystem';
import { GAME_CONFIG } from '../games/data';
import { generateBattleLearnQuestion } from '../games/battlelearn/questions';
import { gameRegistry } from '../games/registry';
import { useRoundFlow } from './useRoundFlow';
import type { Problem } from '../types/game';

/**
 * Canonical per-fact identifier for closed-set skills. Returns undefined for
 * problems that don't map cleanly onto a single fact (e.g. memory_math pair
 * games, open-set vocabulary problems).
 */
function resolveFactKey(problem: Problem): string | undefined {
  if (problem.type === 'math_snake' && problem.math) {
    return problem.math.equation;
  }
  if (problem.type === 'fact_drill') {
    return `${problem.factorA}${problem.opSymbol}${problem.factorB}`;
  }
  return undefined;
}

export interface AnswerOptions {
  /**
   * The call confirms a won game (BattleLearn's sunk fleet) instead of
   * answering a question: it reaches the round's goal, but no attempt, streak
   * or answer stats are recorded.
   */
  confirmsGameWin?: boolean;
}

export interface UseAnswerHandlerResult {
  handleAnswer: (
    isCorrect: boolean,
    shouldShowAchievement?: () => boolean,
    options?: AnswerOptions,
  ) => void;
}

export function useAnswerHandler(): UseAnswerHandlerResult {
  const { formatText } = useProfileText();
  const { getRng, generateUniqueProblemForGame } = useGameEngine();
  const { finishRound, failTask } = useRoundFlow();

  // Global state
  const getLevelForGame = useGameStore((state) => state.getLevelForGame);
  const recordAnswer = useGameStore((state) => state.recordAnswer);
  const addGlobalScore = useGameStore((state) => state.addScore);
  const updateStats = useGameStore((state) => state.updateStats);
  const recordSkillAttempt = useGameStore((state) => state.recordSkillAttempt);
  const updateHighScore = useGameStore((state) => state.updateHighScore);

  // Session state
  const gameType = usePlaySessionStore((state) => state.gameType);
  const problem = usePlaySessionStore((state) => state.problem);
  const problemStartedAt = usePlaySessionStore((state) => state.problemStartedAt);
  const currentStreak = usePlaySessionStore((state) => state.currentStreak);
  const adaptiveDifficulty = usePlaySessionStore((state) => state.adaptiveDifficulty);

  // Session actions
  const setProblem = usePlaySessionStore((state) => state.setProblem);
  const setBgClass = usePlaySessionStore((state) => state.setBgClass);
  const setParticleActive = usePlaySessionStore((state) => state.setParticleActive);
  const addScore = usePlaySessionStore((state) => state.addScore);
  const updateAdaptiveDifficulty = usePlaySessionStore((state) => state.updateAdaptiveDifficulty);
  const submitAnswer = usePlaySessionStore((state) => state.submitAnswer);
  const addNotification = usePlaySessionStore((state) => state.addNotification);
  const score = usePlaySessionStore((state) => state.score);
  const recordSnakeFact = usePlaySessionStore((state) => state.recordSnakeFact);
  const trackSnakeLength = usePlaySessionStore((state) => state.trackSnakeLength);
  const trackSnakeStreak = usePlaySessionStore((state) => state.trackSnakeStreak);
  const recordRoundAnswer = usePlaySessionStore((state) => state.recordRoundAnswer);
  const noteRoundAchievements = usePlaySessionStore((state) => state.noteRoundAchievements);

  const handleAnswer = useCallback(
    (
      isCorrect: boolean,
      shouldShowAchievement: () => boolean = () => true,
      options?: AnswerOptions,
    ) => {
      if (!gameType || !problem) return;
      // A round that has ended takes no more answers while its end screen comes up.
      if (usePlaySessionStore.getState().round?.status !== 'playing') return;

      const answerStartTime = Date.now();
      const points = isCorrect ? 10 : 0;
      const confirmsGameWin = options?.confirmsGameWin ?? false;
      const isAttempt = !confirmsGameWin;

      // Response time from `problemStartedAt` (set when the current problem
      // was placed in session-state); 0 if missing, which the session store
      // treats as no measurement. The learner store caps the upper bound
      // (idle tabs etc.) for skill stats.
      const responseMs = problemStartedAt ? answerStartTime - problemStartedAt : 0;
      if (isAttempt) {
        updateAdaptiveDifficulty(isCorrect, responseMs);

        // Per-skill rolling stats + per-fact mastery for closed-set skills.
        const factKey = resolveFactKey(problem);
        recordSkillAttempt(gameType, isCorrect, responseMs, factKey);

        submitAnswer(isCorrect);
      }
      const newStreak = !isAttempt ? currentStreak : isCorrect ? currentStreak + 1 : 0;

      // Snake-family session tracking: per-fact history + session streak.
      // Equation is captured BEFORE processAnswer clears problem.math.
      if (isSnakeGameType(gameType) && problem.type === 'math_snake' && problem.math) {
        recordSnakeFact(problem.math.equation, isCorrect);
        trackSnakeStreak(newStreak);
      }

      const { newAchievements } = isAttempt
        ? recordAnswer(isCorrect, points)
        : { newAchievements: [] };
      noteRoundAchievements(newAchievements);

      const rng = getRng();
      const result = processAnswer({
        isCorrect,
        problem,
        gameType,
        currentStreak: newStreak,
        rng,
      });

      // A wrong answer costs a life (none in a timed round) through failTask,
      // which also ends the round and restarts the task.
      const round = recordRoundAnswer(isCorrect, { confirmsWin: confirmsGameWin });
      const roundOver = round !== null && round.status !== 'playing';

      const entry = gameRegistry.get(gameType);
      const sessionMode = GAME_CONFIG[gameType]?.sessionMode ?? 'single';
      const currentLevel = getLevelForGame(gameType);

      if (isCorrect) {
        const encouragement = getRandomEncouragement('correct', newStreak);
        if (newStreak >= 2) {
          addNotification({
            type: 'streak',
            message: formatText(encouragement),
            streakCount: newStreak,
          });
        } else {
          addNotification({
            type: 'correct',
            message: formatText(encouragement),
          });
        }

        setBgClass('answer-ok');

        if (result.shouldShowParticles) {
          setParticleActive(true);
          setTimeout(() => setParticleActive(false), 1200);
        }

        if (result.shouldIncrementScore) {
          addScore(result.points);
          addGlobalScore(result.points);
          updateHighScore(gameType, score + result.points);
        }

        // Snake family: every SNAKE_STREAK_MILESTONE correct answers, expand
        // the grid by one cell (up to the cap enforced by expandSnakeGrid).
        if (result.updatedProblem) {
          let nextProblem = result.updatedProblem;
          if (
            isSnakeGameType(gameType) &&
            nextProblem.type === 'math_snake' &&
            newStreak > 0 &&
            newStreak % SNAKE_STREAK_MILESTONE === 0
          ) {
            nextProblem = expandSnakeGrid(nextProblem);
          }
          // A snake that fills its board starts again short; it costs nothing.
          if (result.gameOver && nextProblem.type === 'math_snake') {
            nextProblem = respawnMathSnake(nextProblem, rng);
          }
          setProblem(nextProblem);
        }

        // Continuous-session games keep their own current problem and pick the
        // next one in-view, so the handler must not push a fresh one in.
        if (
          !roundOver &&
          !result.updatedProblem &&
          !isSnakeGameType(gameType) &&
          sessionMode !== 'continuous'
        ) {
          setTimeout(() => {
            setBgClass('');
            // BattleLearn keeps its board: the next question goes on the board as it
            // is now, with the shots fired since this answer.
            if (problem.type === 'battlelearn') {
              const board = usePlaySessionStore.getState().problem;
              if (board?.type === 'battlelearn' && !board.gameWon) {
                const contentPackId = entry?.contentPackId;
                setProblem(
                  generateBattleLearnQuestion(board, currentLevel, getRng(), contentPackId),
                );
              }
            } else {
              const newProblem = generateUniqueProblemForGame(
                gameType,
                currentLevel,
                adaptiveDifficulty,
              );
              if (newProblem) setProblem(newProblem);
            }
          }, 600);
        } else {
          setTimeout(() => setBgClass(''), 600);
        }

        // Track max snake length for any snake-family game. Both the global
        // stats (all-time record) and the session stats (shown in the round's
        // summary) are updated from the same source of truth.
        if (
          isSnakeGameType(gameType) &&
          result.updatedProblem &&
          result.updatedProblem.type === 'math_snake'
        ) {
          const currentSnakeLength = result.updatedProblem.snake.length;
          trackSnakeLength(currentSnakeLength);
          updateStats((stats) => ({
            ...stats,
            maxSnakeLength: Math.max(stats.maxSnakeLength || 0, currentSnakeLength),
          }));
        }
      } else {
        const encouragement = getRandomEncouragement('wrong');
        addNotification({
          type: 'wrong',
          message: formatText(encouragement),
        });

        setBgClass('answer-bad');

        failTask();

        setTimeout(
          () => {
            setBgClass('');
          },
          isSnakeGameType(gameType) || sessionMode === 'continuous' ? 600 : 1500,
        );
      }

      if (isCorrect && round && roundOver) finishRound(round);

      if (newAchievements.length > 0 && shouldShowAchievement()) {
        const achievement = newAchievements[0];
        if (achievement) {
          addNotification({
            type: 'achievement',
            achievement: achievement,
          });
        }
      }
    },
    [
      gameType,
      problem,
      problemStartedAt,
      currentStreak,
      adaptiveDifficulty,
      recordAnswer,
      recordSkillAttempt,
      addGlobalScore,
      updateStats,
      setProblem,
      setBgClass,
      setParticleActive,
      addScore,
      updateAdaptiveDifficulty,
      submitAnswer,
      addNotification,
      recordRoundAnswer,
      noteRoundAchievements,
      finishRound,
      failTask,
      getLevelForGame,
      getRng,
      generateUniqueProblemForGame,
      formatText,
      score,
      updateHighScore,
      recordSnakeFact,
      trackSnakeLength,
      trackSnakeStreak,
    ],
  );

  return { handleAnswer };
}
