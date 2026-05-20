/**
 * Collected selectors from `gameStore` + `playSessionStore` that
 * `GameScreen.tsx` wires up. Pulled out so the screen component stays under
 * the Phase 0 <200 LOC target.
 *
 * No memoization: each Zustand selector is referentially stable and the
 * returned object literal is recreated each render anyway — `GameScreen`
 * destructures it and React's reconciler handles the rest.
 */

import { useGameStore } from '../../stores/gameStore';
import { usePlaySessionStore } from '../../stores/playSessionStore';

export function useGameScreenStores() {
  // Persistent store
  const getLevelForGame = useGameStore((state) => state.getLevelForGame);
  const stars = useGameStore((state) => state.stars);
  const hearts = useGameStore((state) => state.hearts);
  const stats = useGameStore((state) => state.stats);
  const soundEnabled = useGameStore((state) => state.soundEnabled);
  const toggleSound = useGameStore((state) => state.toggleSound);
  const setLevel = useGameStore((state) => state.setLevel);
  const spendStars = useGameStore((state) => state.spendStars);
  const spendHeart = useGameStore((state) => state.spendHeart);

  // Session store
  const gameType = usePlaySessionStore((state) => state.gameType);
  const problem = usePlaySessionStore((state) => state.problem);
  const score = usePlaySessionStore((state) => state.score);
  const levelProgress = usePlaySessionStore((state) => state.levelProgress);
  const bgClass = usePlaySessionStore((state) => state.bgClass);
  const confetti = usePlaySessionStore((state) => state.confetti);
  const enhancedConfetti = usePlaySessionStore((state) => state.enhancedConfetti);
  const particleActive = usePlaySessionStore((state) => state.particleActive);
  const adaptiveDifficulty = usePlaySessionStore((state) => state.adaptiveDifficulty);
  const notifications = usePlaySessionStore((state) => state.notifications);
  const setProblem = usePlaySessionStore((state) => state.setProblem);
  const returnToMenu = usePlaySessionStore((state) => state.returnToMenu);
  const setEnhancedConfetti = usePlaySessionStore((state) => state.setEnhancedConfetti);
  const endGame = usePlaySessionStore((state) => state.endGame);
  const addNotification = usePlaySessionStore((state) => state.addNotification);
  const removeNotification = usePlaySessionStore((state) => state.removeNotification);
  const resetLevelProgress = usePlaySessionStore((state) => state.resetLevelProgress);

  return {
    getLevelForGame,
    stars,
    hearts,
    stats,
    soundEnabled,
    toggleSound,
    setLevel,
    spendStars,
    spendHeart,
    gameType,
    problem,
    score,
    levelProgress,
    bgClass,
    confetti,
    enhancedConfetti,
    particleActive,
    adaptiveDifficulty,
    notifications,
    setProblem,
    returnToMenu,
    setEnhancedConfetti,
    endGame,
    addNotification,
    removeNotification,
    resetLevelProgress,
  };
}
