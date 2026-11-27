import { useGameStore } from '../../stores/gameStore';
import { usePlaySessionStore } from '../../stores/playSessionStore';

export const STAR_POINTS = 100;
export const GATE_POINTS = 200;

/**
 * Adds the points a star or a right gate earns to the session score as they
 * happen. The session store is not persisted, so this is cheap inside a frame.
 */
export function awardShapeDashPoints(points: number): void {
  usePlaySessionStore.getState().addScore(points);
}

/**
 * Writes a run's score to the game's high score, once when the run ends
 * rather than on every pickup.
 */
export function recordShapeDashRun(points: number): void {
  if (points <= 0) return;
  const { gameType, score } = usePlaySessionStore.getState();
  if (gameType) useGameStore.getState().updateHighScore(gameType, score);
}
