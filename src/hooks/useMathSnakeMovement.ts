import { useGameStore } from '../stores/gameStore';
import { usePlaySessionStore } from '../stores/playSessionStore';
import { useGameEngine } from './useGameEngine';
import { moveMathSnake } from '../engine/mathSnake';
import { LEGACY_GAME_SKILL_IDS } from '../learner';
import { isClosedSetSkill } from '../learner/skillClassification';
import type { Direction } from '../types/game';

/**
 * Handles math-snake directional input: moves the snake, updates stats on apple
 * pickups, and ends the game on collision. Returns undefined for non-snake games
 * so the caller can pass the result straight into GameRenderer's `onMove` prop.
 */
export const useMathSnakeMovement = (): ((direction: Direction) => void) | undefined => {
  const { getRng } = useGameEngine();
  const getLevelForGame = useGameStore((state) => state.getLevelForGame);
  const updateStats = useGameStore((state) => state.updateStats);
  const updateHighScore = useGameStore((state) => state.updateHighScore);
  const addGlobalScore = useGameStore((state) => state.addScore);
  const spendHeart = useGameStore((state) => state.spendHeart);

  const gameType = usePlaySessionStore((state) => state.gameType);
  const problem = usePlaySessionStore((state) => state.problem);
  const score = usePlaySessionStore((state) => state.score);
  const highScoreEligible = usePlaySessionStore((state) => state.highScoreEligible);
  const gameStartTime = usePlaySessionStore((state) => state.gameStartTime);
  const setProblem = usePlaySessionStore((state) => state.setProblem);
  const addScore = usePlaySessionStore((state) => state.addScore);
  const endGame = usePlaySessionStore((state) => state.endGame);
  const trackSnakeLength = usePlaySessionStore((state) => state.trackSnakeLength);

  if (!gameType) return undefined;
  const baseType = gameType.replace('_adv', '');
  // All snake-family games (addition_snake, multiplication_snake, …) share
  // MathSnakeView + mathSnake engine. Treat any *_snake id as a snake game.
  if (!baseType.endsWith('_snake')) return undefined;

  return (direction: Direction): void => {
    if (!problem || problem.type !== 'math_snake') return;
    if (problem.math) return;

    const currentLevel = getLevelForGame(gameType);
    const rng = getRng();
    const wasEatingNormalApple = problem.apple?.kind === 'normal';

    // Phase 5e: closed-set skills (multiplication 1-5, division 1-5, …) feed
    // factsKnown into the snake engine so it can pick weak facts via spaced
    // repetition. Open-set skills (addition within 100, …) leave it undefined.
    const skillId = LEGACY_GAME_SKILL_IDS[baseType]?.[0];
    const skillMastery = skillId
      ? useGameStore.getState().activeLearnerProfile.skillMastery[skillId]
      : undefined;
    const factsKnown = skillId && isClosedSetSkill(skillId) ? skillMastery?.factsKnown : undefined;

    const result = moveMathSnake(problem, direction, currentLevel, rng, factsKnown);

    if (result.collision) {
      const finalSnakeLength = problem.snake.length;
      trackSnakeLength(finalSnakeLength);
      updateStats((s) => ({
        ...s,
        maxSnakeLength: Math.max(s.maxSnakeLength || 0, finalSnakeLength),
      }));
      spendHeart();
      endGame();
      if (gameStartTime) {
        const playTime = Math.floor((Date.now() - gameStartTime) / 1000);
        updateStats((s) => ({
          ...s,
          totalTimePlayed: s.totalTimePlayed + playTime,
        }));
      }
      return;
    }

    const currentSnakeLength = result.problem.snake.length;
    trackSnakeLength(currentSnakeLength);
    updateStats((s) => ({
      ...s,
      maxSnakeLength: Math.max(s.maxSnakeLength || 0, currentSnakeLength),
    }));

    if (wasEatingNormalApple && !result.problem.math) {
      const applePoints = 5;
      addScore(applePoints);
      addGlobalScore(applePoints);
      if (highScoreEligible) {
        updateHighScore(gameType, score + applePoints);
      }
    }

    setProblem(result.problem);
  };
};
