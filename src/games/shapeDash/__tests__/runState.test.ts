/**
 * A crash costs a round life (the handler's part) and the run starts again
 * from the start line (the view's part, `restartRun`): Phase 1.7's failure
 * table, khe-meta plan study-game-feel-and-progression, Run 3.
 */

import { describe, expect, it } from 'vitest';
import { restartRun, type GameState } from '../runState';

const crashedRun = (): GameState => ({
  scroll: 820,
  playerY: 120,
  playerVelY: -4,
  playerRotation: 1.2,
  isOnGround: false,
  canDoubleJump: false,
  gravityFlipped: false,
  speedMultiplier: 1,
  playerScale: 1,
  squashStretch: 0.7,
  screenShake: 6,
  attemptCount: 2,
  score: 40,
  unrecordedPoints: 0,
  coinsCollected: 0,
  pulsePhase: 0,
  particles: [
    { x: 0, y: 0, vx: 0, vy: 0, life: 1, maxLife: 1, size: 2, color: '#000', type: 'explosion' },
  ],
  trailPoints: [{ x: 1, y: 1 }],
  combo: 3,
  comboCount: 5,
  starsCollected: 2,
  correctAnswerStreak: 4,
  hasShield: true,
  questionTimer: -1,
  collectedStarIds: new Set(['s1', 's2']),
  bestScore: 60,
  totalStars: 3,
  passedGateIds: new Set(['g1']),
  passedObstacleIndices: new Set([0, 1]),
  consecutiveWrongGates: 1,
  revealedGateId: 'g2',
  slowTimeUntil: 999,
  feedbackMessage: 'x',
  feedbackType: 'wrong',
  feedbackUntil: 999,
});

describe('restartRun', () => {
  it('puts a crashed run back on the start line with its score, combo, stars and gates reset', () => {
    const state = crashedRun();

    restartRun(state, 300, 3);

    expect(state).toMatchObject({
      scroll: 0,
      playerY: 300,
      playerVelY: 0,
      isOnGround: true,
      canDoubleJump: true,
      score: 0,
      combo: 1,
      comboCount: 0,
      starsCollected: 0,
      totalStars: 3,
      consecutiveWrongGates: 0,
      revealedGateId: null,
      feedbackMessage: null,
      attemptCount: 3,
    });
    expect(state.particles).toEqual([]);
    expect(state.collectedStarIds.size).toBe(0);
    expect(state.passedGateIds.size).toBe(0);
    expect(state.passedObstacleIndices.size).toBe(0);
  });

  it('keeps the streak, the shield and the best score', () => {
    const state = crashedRun();

    restartRun(state, 300, 3);

    expect(state).toMatchObject({ correctAnswerStreak: 4, hasShield: true, bestScore: 60 });
  });
});
