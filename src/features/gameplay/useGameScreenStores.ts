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
  const stars = useGameStore((state) => state.activeLearnerProfile.meta.stars);
  const stats = useGameStore((state) => state.activeLearnerProfile.meta.stats);
  const soundEnabled = useGameStore((state) => state.soundEnabled);
  const toggleSound = useGameStore((state) => state.toggleSound);
  const setLevel = useGameStore((state) => state.setLevel);
  const spendStars = useGameStore((state) => state.spendStars);

  // Session store
  const gameType = usePlaySessionStore((state) => state.gameType);
  const problem = usePlaySessionStore((state) => state.problem);
  const score = usePlaySessionStore((state) => state.score);
  const round = usePlaySessionStore((state) => state.round);
  const adaptiveDifficulty = usePlaySessionStore((state) => state.adaptiveDifficulty);
  const notifications = usePlaySessionStore((state) => state.notifications);
  const addNotification = usePlaySessionStore((state) => state.addNotification);
  const removeNotification = usePlaySessionStore((state) => state.removeNotification);
  const startNextRound = usePlaySessionStore((state) => state.startNextRound);

  return {
    getLevelForGame,
    stars,
    stats,
    soundEnabled,
    toggleSound,
    setLevel,
    spendStars,
    gameType,
    problem,
    score,
    round,
    adaptiveDifficulty,
    notifications,
    addNotification,
    removeNotification,
    startNextRound,
  };
}
