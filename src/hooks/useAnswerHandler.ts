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
import { useGameAudio } from './useGameAudio';
import { useProfileText } from './useProfileText';
import { processAnswer } from '../engine/answerHandler';
import { expandSnakeGrid, isSnakeGameType, SNAKE_STREAK_MILESTONE } from '../engine/mathSnake';
import { getRandomEncouragement } from '../components/FeedbackSystem';
import { GAME_CONFIG } from '../games/data';
import { useTranslation } from '../i18n/useTranslation';
import { checkLevelUp, calculateStarReward } from '../engine/progression';
import { generateBattleLearnQuestion } from '../games/generators';
import { gameRegistry } from '../games/registry';
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
  /** When true, do not decrement a heart for this wrong answer. */
  skipHeartDeduction?: boolean;
}

export interface UseAnswerHandlerResult {
  handleAnswer: (
    isCorrect: boolean,
    shouldShowAchievement?: () => boolean,
    options?: AnswerOptions,
  ) => void;
}

export function useAnswerHandler(): UseAnswerHandlerResult {
  const t = useTranslation();
  const { formatText } = useProfileText();
  const { getRng, generateUniqueProblemForGame } = useGameEngine();
  const { playWin } = useGameAudio(useGameStore((state) => state.soundEnabled));

  // Global state
  const getLevelForGame = useGameStore((state) => state.getLevelForGame);
  const recordAnswer = useGameStore((state) => state.recordAnswer);
  const earnStars = useGameStore((state) => state.earnStars);
  const addGlobalScore = useGameStore((state) => state.addScore);
  const updateStats = useGameStore((state) => state.updateStats);
  const spendHeart = useGameStore((state) => state.spendHeart);
  const recordLevelUp = useGameStore((state) => state.recordLevelUp);
  const recordSkillAttempt = useGameStore((state) => state.recordSkillAttempt);
  const updateHighScore = useGameStore((state) => state.updateHighScore);

  // Session state
  const gameType = usePlaySessionStore((state) => state.gameType);
  const problem = usePlaySessionStore((state) => state.problem);
  const problemStartedAt = usePlaySessionStore((state) => state.problemStartedAt);
  const levelProgress = usePlaySessionStore((state) => state.levelProgress);
  const recordLevelAnswer = usePlaySessionStore((state) => state.recordLevelAnswer);
  const resetLevelProgress = usePlaySessionStore((state) => state.resetLevelProgress);
  const currentStreak = usePlaySessionStore((state) => state.currentStreak);
  const adaptiveDifficulty = usePlaySessionStore((state) => state.adaptiveDifficulty);
  const gameStartTime = usePlaySessionStore((state) => state.gameStartTime);
  const highScoreEligible = usePlaySessionStore((state) => state.highScoreEligible);

  // Session actions
  const setProblem = usePlaySessionStore((state) => state.setProblem);
  const setBgClass = usePlaySessionStore((state) => state.setBgClass);
  const setConfetti = usePlaySessionStore((state) => state.setConfetti);
  const setEnhancedConfetti = usePlaySessionStore((state) => state.setEnhancedConfetti);
  const setParticleActive = usePlaySessionStore((state) => state.setParticleActive);
  const setShowHint = usePlaySessionStore((state) => state.setShowHint);
  const addScore = usePlaySessionStore((state) => state.addScore);
  const endGame = usePlaySessionStore((state) => state.endGame);
  const updateAdaptiveDifficulty = usePlaySessionStore((state) => state.updateAdaptiveDifficulty);
  const submitAnswer = usePlaySessionStore((state) => state.submitAnswer);
  const addNotification = usePlaySessionStore((state) => state.addNotification);
  const score = usePlaySessionStore((state) => state.score);
  const recordSnakeFact = usePlaySessionStore((state) => state.recordSnakeFact);
  const trackSnakeLength = usePlaySessionStore((state) => state.trackSnakeLength);
  const trackSnakeStreak = usePlaySessionStore((state) => state.trackSnakeStreak);

  const handleAnswer = useCallback(
    (
      isCorrect: boolean,
      shouldShowAchievement: () => boolean = () => true,
      options?: AnswerOptions,
    ) => {
      if (!gameType || !problem) return;

      const answerStartTime = Date.now();
      const points = isCorrect ? 10 : 0;
      const baseGameType = gameType.replace('_adv', '');

      // Update adaptive difficulty
      const responseTime = Date.now() - answerStartTime;
      updateAdaptiveDifficulty(isCorrect, responseTime);

      // Per-skill rolling stats + per-fact mastery for closed-set skills.
      // Response time from `problemStartedAt` (set when the current problem
      // was placed in session-state); 0 if missing. The store sanitizes the
      // upper bound (idle tabs etc.).
      const skillResponseMs = problemStartedAt ? answerStartTime - problemStartedAt : 0;
      const factKey = resolveFactKey(problem);
      recordSkillAttempt(baseGameType, isCorrect, skillResponseMs, factKey);

      // Update streak
      submitAnswer(isCorrect);
      const newStreak = isCorrect ? currentStreak + 1 : 0;

      // Snake-family session tracking: per-fact history + session streak.
      // Equation is captured BEFORE processAnswer clears problem.math.
      if (isSnakeGameType(gameType) && problem.type === 'math_snake' && problem.math) {
        recordSnakeFact(problem.math.equation, isCorrect);
        trackSnakeStreak(newStreak);
      }

      // Collect achievements
      const { newAchievements: answerAchievements } = recordAnswer(isCorrect, points);

      // Track level progress (for automatic level-up)
      recordLevelAnswer(isCorrect);

      // Process answer using engine logic
      const rng = getRng();
      const result = processAnswer({
        isCorrect,
        problem,
        gameType,
        currentStreak: newStreak,
        // currentStars removed - stars are persistent currency, not used for level-up
        // currentHearts removed - hearts are persistent global resource in gameStore
        rng,
      });

      // Handle achievements - collect all achievements
      let allNewAchievements = [...answerAchievements];

      // Check for level completion and level-up (Phase 3) - after tracking the answer
      const currentLevel = getLevelForGame(gameType);
      // Get updated progress (after recordLevelAnswer)
      const updatedProgress = levelProgress
        ? {
            correctAnswers: levelProgress.correctAnswers + (isCorrect ? 1 : 0),
            totalAnswers: levelProgress.totalAnswers + 1,
            levelStartedAt: levelProgress.levelStartedAt,
          }
        : {
            correctAnswers: isCorrect ? 1 : 0,
            totalAnswers: 1,
            levelStartedAt: Date.now(),
          };

      // Check if should level up (after this answer)
      // Games can have different level-up strategies:
      // - 'standard': Level up after X correct answers (default)
      // - 'onGameWin': Level up only when game is won (BattleLearn, etc.)
      const gameConfig = GAME_CONFIG[baseGameType];
      const levelUpStrategy = gameConfig?.levelUpStrategy ?? 'standard';
      const sessionMode = gameConfig?.sessionMode ?? 'single';

      let shouldLevelUp = false;
      if (sessionMode === 'continuous') {
        // Continuous-session games (timed sprints) own their own session loop
        // and never level up mid-session — the view ends the session itself
        // and the learner returns to the menu before re-entering at a higher
        // skill level.
        shouldLevelUp = false;
      } else if (levelUpStrategy === 'onGameWin') {
        // Level up only when game is won
        const gameWon = problem.type === 'battlelearn' ? problem.gameWon : false;
        shouldLevelUp = gameWon && isCorrect;
      } else {
        // Standard: Level up after X correct answers
        shouldLevelUp = checkLevelUp(
          currentLevel,
          updatedProgress.correctAnswers,
          updatedProgress.totalAnswers,
        );
      }

      // Handle level completion and level-up (Phase 3)
      if (shouldLevelUp && isCorrect) {
        // Calculate star reward
        const perfect = updatedProgress.totalAnswers === updatedProgress.correctAnswers; // Perfect level (no wrong answers)
        const starsEarned = calculateStarReward(gameType, currentLevel, perfect);

        // Award stars
        const { newAchievements: starAchievements } = earnStars(
          starsEarned,
          `level_completion_${gameType}_${currentLevel}`,
        );
        const answerIds = new Set(answerAchievements.map((a) => a.id));
        const uniqueStarAchievements = starAchievements.filter((a) => !answerIds.has(a.id));
        allNewAchievements = [...answerAchievements, ...uniqueStarAchievements];

        // Level up automatically
        const newLevel = currentLevel + 1;
        const { newAchievements: levelUpAchievements } = recordLevelUp(gameType, newLevel);
        const levelUpIds = new Set(allNewAchievements.map((a) => a.id));
        const uniqueLevelUpAchievements = levelUpAchievements.filter((a) => !levelUpIds.has(a.id));
        allNewAchievements = [...allNewAchievements, ...uniqueLevelUpAchievements];

        // Reset level progress for new level
        resetLevelProgress();

        playWin();
        setEnhancedConfetti(true);

        if (levelUpStrategy === 'onGameWin') {
          // Victory screen already shown by the game; no second (level-up) popup. Go straight to next game.
          setBgClass('bg-slate-50');
          if (!isSnakeGameType(gameType)) {
            const newProblem = generateUniqueProblemForGame(
              baseGameType,
              newLevel,
              adaptiveDifficulty,
            );
            if (newProblem) setProblem(newProblem);
          }
          setTimeout(() => {
            setConfetti(true);
            setEnhancedConfetti(false);
          }, 300);
          setTimeout(() => {
            addNotification({
              type: 'info',
              message: `⭐ Earned ${starsEarned} ${starsEarned === 1 ? 'star' : 'stars'}!`,
            });
          }, 600);
        } else {
          // Standard: show level-up modal; generate next problem when user dismisses
          setTimeout(() => {
            setConfetti(true);
            const gameConfig = GAME_CONFIG[gameType] ?? GAME_CONFIG['word_builder']!;
            addNotification({
              type: 'levelUp',
              title: `${t.levelUp.level} ${newLevel}`,
              emoji: gameConfig.icon,
              message: formatText(t.levelUp.greatWork),
              levelUpOnDismiss: () => {
                setBgClass('bg-slate-50');
                if (!isSnakeGameType(gameType)) {
                  const newProblem = generateUniqueProblemForGame(
                    baseGameType,
                    newLevel,
                    adaptiveDifficulty,
                  );
                  if (newProblem) setProblem(newProblem);
                }
              },
            });
            setTimeout(() => {
              addNotification({
                type: 'info',
                message: `⭐ Earned ${starsEarned} ${starsEarned === 1 ? 'star' : 'stars'}!`,
              });
            }, 1000);
            setEnhancedConfetti(false);
          }, 800);
        }
      }

      // Handle correct answer
      if (isCorrect) {
        // Note: Stars are now earned per-level completion (Phase 3), not per-answer
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

        setBgClass('bg-green-50');

        if (result.shouldShowParticles) {
          setParticleActive(true);
          setTimeout(() => setParticleActive(false), result.shouldShowParticles ? 1200 : 1500);
        }

        if (result.shouldIncrementScore) {
          addScore(result.points);
          addGlobalScore(result.points);

          // Update high score after adding points (check new score)
          if (gameType && highScoreEligible) {
            const newScore = score + result.points;
            updateHighScore(gameType, newScore);
          }
        }

        setShowHint(false);

        // Update problem if needed (for math snake). Snake family: every
        // SNAKE_STREAK_MILESTONE correct answers, expand the grid by one cell
        // (up to the cap enforced by expandSnakeGrid). This is the in-session
        // progression dimension the snake mechanic was missing.
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
          setProblem(nextProblem);
        }

        // If we leveled up, use the new level for next problem
        const levelForNextProblem = shouldLevelUp ? currentLevel + 1 : currentLevel;

        // Don't generate new problem immediately if we just leveled up (let level-up animation play)
        // Continuous-session games keep their own current problem and pick the
        // next one in-view, so the handler must not push a fresh one in.
        if (
          !shouldLevelUp &&
          !result.updatedProblem &&
          !isSnakeGameType(gameType) &&
          sessionMode !== 'continuous'
        ) {
          // Generate new problem for standard games (only if not leveling up)
          setTimeout(() => {
            setBgClass('bg-slate-50');
            // For BattleLearn, if game is won, don't generate new question (GameResultScreen handles it)
            // If game continues (wrong answer), generate new question but keep board state
            if (problem.type === 'battlelearn') {
              const battleLearnProb = problem;
              if (!battleLearnProb.gameWon) {
                const rng = getRng();
                const contentPackId = gameRegistry.get(baseGameType)?.contentPackId;
                const newQuestion = generateBattleLearnQuestion(
                  battleLearnProb,
                  levelForNextProblem,
                  rng,
                  contentPackId,
                );
                setProblem(newQuestion);
              }
            } else {
              const newProblem = generateUniqueProblemForGame(
                baseGameType,
                levelForNextProblem,
                adaptiveDifficulty,
              );
              if (newProblem) setProblem(newProblem);
            }
          }, 600);
        } else if (!shouldLevelUp) {
          // Just reset background if not leveling up
          setTimeout(() => setBgClass('bg-slate-50'), 600);
        }
        // If leveling up, new problem will be generated after level-up animation completes (handled above)

        // Track max snake length for any snake-family game. Both the global
        // stats (all-time record) and the session stats (shown in game-over
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

        // Check for collision-based game over (math snake)
        if (result.gameOver && !result.shouldEndGame) {
          setTimeout(() => {
            endGame();
            if (gameStartTime) {
              const playTime = Math.floor((Date.now() - gameStartTime) / 1000);
              updateStats((stats) => ({
                ...stats,
                totalTimePlayed: stats.totalTimePlayed + playTime,
              }));
            }
          }, 400);
          return;
        }
      } else {
        // Handle wrong answer
        const encouragement = getRandomEncouragement('wrong');
        addNotification({
          type: 'wrong',
          message: formatText(encouragement),
        });

        setBgClass('bg-red-50');
        // Continuous-session games (timed sprints) render their own per-question
        // educational feedback; the global hint modal would interrupt the flow.
        setShowHint(!isSnakeGameType(gameType) && sessionMode !== 'continuous');

        const didSpendHeart = result.shouldDecrementHearts && !options?.skipHeartDeduction;
        if (didSpendHeart) {
          spendHeart();
        }

        // Check if game should end (no hearts left) – either we just spent, or the game spent (e.g. BattleLearn 5 strikes)
        const currentHearts = useGameStore.getState().hearts;
        if (currentHearts <= 0 || result.shouldEndGame) {
          if (didSpendHeart && result.updatedProblem) {
            setProblem(result.updatedProblem);
          }
          if (isSnakeGameType(gameType) && problem.type === 'math_snake') {
            const finalSnakeLength = problem.snake.length;
            trackSnakeLength(finalSnakeLength);
            updateStats((stats) => ({
              ...stats,
              maxSnakeLength: Math.max(stats.maxSnakeLength || 0, finalSnakeLength),
            }));
          }
          setTimeout(() => {
            endGame();
            if (gameStartTime) {
              const playTime = Math.floor((Date.now() - gameStartTime) / 1000);
              updateStats((stats) => ({
                ...stats,
                totalTimePlayed: stats.totalTimePlayed + playTime,
              }));
            }
          }, 800);
          return;
        }

        setTimeout(
          () => {
            setBgClass('bg-slate-50');
          },
          isSnakeGameType(gameType) || sessionMode === 'continuous' ? 600 : 1500,
        );
      }

      // Show achievements if we should (for both correct and wrong answers)
      if (allNewAchievements.length > 0 && shouldShowAchievement()) {
        const achievement = allNewAchievements[0];
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
      gameStartTime,
      highScoreEligible,
      recordAnswer,
      earnStars,
      recordLevelUp,
      recordSkillAttempt,
      addGlobalScore,
      updateStats,
      setProblem,
      setBgClass,
      setConfetti,
      setEnhancedConfetti,
      setParticleActive,
      setShowHint,
      spendHeart,
      addScore,
      endGame,
      updateAdaptiveDifficulty,
      submitAnswer,
      addNotification,
      recordLevelAnswer,
      resetLevelProgress,
      getLevelForGame,
      getRng,
      generateUniqueProblemForGame,
      playWin,
      t,
      formatText,
      levelProgress,
      score,
      updateHighScore,
      recordSnakeFact,
      trackSnakeLength,
      trackSnakeStreak,
      // checkLevelUp and calculateStarReward are pure functions from engine, no need in deps
    ],
  );

  return { handleAnswer };
}
