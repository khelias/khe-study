import { describe, expect, it, vi } from 'vitest';
import { JUMP_VELOCITY } from '../../../engine/shapeDash';
import type { ShapeDashProblem } from '../../../types/game';
import { GROUND_Y, PLAYER_SIZE, type ShapeDashFeedbackCopy } from '../layout';
import { GATE_POINTS } from '../runPoints';
import { createInitialRunState } from '../runState';
import {
  calculateStarRating,
  hasObstacleCollision,
  stepRunFrame,
  type StepCallbacks,
} from '../simulation';

const FEEDBACK_COPY: ShapeDashFeedbackCopy = {
  gateCorrect: 'Correct!',
  gateWrong: 'Wrong!',
  shieldLost: 'Shield lost!',
};

function makeProblem(overrides: Partial<ShapeDashProblem> = {}): ShapeDashProblem {
  return {
    type: 'shape_dash',
    uid: 'sd-test-1',
    obstacles: [],
    checkpoints: [],
    scrollSpeed: 200,
    runLength: 2000,
    stars: [],
    jumpPads: [],
    boostZones: [],
    shapeGates: [],
    ...overrides,
  };
}

function makeCallbacks(): {
  callbacks: StepCallbacks;
  sounds: string[];
  awarded: number[];
} {
  const sounds: string[] = [];
  const awarded: number[] = [];
  let sessionScore = 0;
  return {
    sounds,
    awarded,
    callbacks: {
      onSound: (sound) => sounds.push(sound),
      onAwardPoints: (points) => {
        awarded.push(points);
        sessionScore += points;
      },
      getSessionScore: () => sessionScore,
    },
  };
}

describe('calculateStarRating', () => {
  it('awards 3 stars on first attempt and 2 on retries when a run has no stars', () => {
    expect(calculateStarRating(0, 0, 1)).toBe(3);
    expect(calculateStarRating(0, 0, 2)).toBe(2);
  });

  it('scales rating by collected star share and first-attempt perfection', () => {
    expect(calculateStarRating(0, 4, 1)).toBe(1);
    expect(calculateStarRating(1, 4, 1)).toBe(1);
    expect(calculateStarRating(2, 4, 1)).toBe(2);
    expect(calculateStarRating(4, 4, 2)).toBe(2);
    expect(calculateStarRating(4, 4, 1)).toBe(3);
  });
});

describe('hasObstacleCollision', () => {
  it('detects direct spike hits and respects the 6 px forgiveness margin', () => {
    const playerX = 140;
    const playerY = GROUND_Y - PLAYER_SIZE;

    expect(
      hasObstacleCollision(
        [{ id: 'o1', x: 150, type: 'spike' }],
        0,
        playerX,
        playerY,
        GROUND_Y,
        896,
      ),
    ).toBe(true);

    // Just barely brushing the right edge inside the 6 px forgiveness margin
    expect(
      hasObstacleCollision(
        [{ id: 'o1', x: playerX + PLAYER_SIZE - 12, type: 'spike' }],
        0,
        playerX,
        playerY,
        GROUND_Y,
        896,
      ),
    ).toBe(false);
  });

  it('detects circle obstacle hits and skips off-screen obstacles', () => {
    const playerX = 140;
    const playerY = GROUND_Y - PLAYER_SIZE;

    expect(
      hasObstacleCollision(
        [{ id: 'c1', x: 145, type: 'circle', radius: 18 }],
        0,
        playerX,
        playerY,
        GROUND_Y,
        896,
      ),
    ).toBe(true);

    expect(
      hasObstacleCollision(
        [{ id: 'c2', x: 2000, type: 'circle', radius: 18 }],
        0,
        playerX,
        playerY,
        GROUND_Y,
        896,
      ),
    ).toBe(false);
  });
});

describe('stepRunFrame', () => {
  it('supports ground jump, mid-air double jump, and landing particles', () => {
    const state = createInitialRunState(GROUND_Y - PLAYER_SIZE, 0);
    const problem = makeProblem();
    const { callbacks, sounds } = makeCallbacks();

    const jumpStep = stepRunFrame({
      state,
      problem,
      dt: 0.016,
      time: 1000,
      canvasWidth: 896,
      canvasHeight: 400,
      groundY: GROUND_Y,
      gateScale: 1,
      playerX: 140,
      jumpRequested: true,
      wasGrounded: true,
      feedbackCopy: FEEDBACK_COPY,
      callbacks,
    });
    expect(jumpStep.outcome).toBe('playing');
    expect(jumpStep.isGrounded).toBe(false);
    expect(state.canDoubleJump).toBe(true);
    expect(state.playerVelY).toBeCloseTo(JUMP_VELOCITY + 2000 * 0.016);
    expect(sounds).toEqual(['tap']);

    // Double jump consumes canDoubleJump
    const doubleJumpStep = stepRunFrame({
      state,
      problem,
      dt: 0.016,
      time: 1016,
      canvasWidth: 896,
      canvasHeight: 400,
      groundY: GROUND_Y,
      gateScale: 1,
      playerX: 140,
      jumpRequested: true,
      wasGrounded: false,
      feedbackCopy: FEEDBACK_COPY,
      callbacks,
    });
    expect(doubleJumpStep.isGrounded).toBe(false);
    expect(state.canDoubleJump).toBe(false);

    // Falling back to ground emits landing particles and resets double jump
    state.playerY = GROUND_Y - PLAYER_SIZE - 1;
    state.playerVelY = 400;
    const landStep = stepRunFrame({
      state,
      problem,
      dt: 0.016,
      time: 1032,
      canvasWidth: 896,
      canvasHeight: 400,
      groundY: GROUND_Y,
      gateScale: 1,
      playerX: 140,
      jumpRequested: false,
      wasGrounded: false,
      feedbackCopy: FEEDBACK_COPY,
      callbacks,
    });
    expect(landStep.isGrounded).toBe(true);
    expect(state.canDoubleJump).toBe(true);
    expect(state.particles.some((p) => p.type === 'landing')).toBe(true);
  });

  it('absorbs an obstacle hit with a shield and crashes without one', () => {
    const problem = makeProblem({
      obstacles: [{ id: 's1', x: 155, type: 'spike' }],
    });
    const { callbacks, sounds } = makeCallbacks();

    const shieldedState = createInitialRunState(GROUND_Y - PLAYER_SIZE, 0);
    shieldedState.hasShield = true;
    shieldedState.combo = 3;
    const shieldResult = stepRunFrame({
      state: shieldedState,
      problem,
      dt: 0.016,
      time: 1000,
      canvasWidth: 896,
      canvasHeight: 400,
      groundY: GROUND_Y,
      gateScale: 1,
      playerX: 140,
      jumpRequested: false,
      wasGrounded: true,
      feedbackCopy: FEEDBACK_COPY,
      callbacks,
    });
    expect(shieldResult.outcome).toBe('playing');
    expect(shieldedState.hasShield).toBe(false);
    expect(shieldedState.combo).toBe(1);
    expect(sounds).toEqual(['tap']);

    const unshieldedState = createInitialRunState(GROUND_Y - PLAYER_SIZE, 0);
    const crashResult = stepRunFrame({
      state: unshieldedState,
      problem,
      dt: 0.016,
      time: 1000,
      canvasWidth: 896,
      canvasHeight: 400,
      groundY: GROUND_Y,
      gateScale: 1,
      playerX: 140,
      jumpRequested: false,
      wasGrounded: true,
      feedbackCopy: FEEDBACK_COPY,
      callbacks,
    });
    expect(crashResult.outcome).toBe('crashed');
    expect(unshieldedState.screenShake).toBeGreaterThan(0);
    expect(sounds).toEqual(['tap', 'wrong']);
  });

  it('awards points for a correct gate and crashes on the second consecutive wrong gate', () => {
    const gateAtPlayer = (id: string, bottomCorrect: boolean) => ({
      id,
      x: 155,
      prompt: 'Triangle?',
      shapes: [
        { type: 'square' as const, label: 'Square', isCorrect: false },
        { type: 'circle' as const, label: 'Circle', isCorrect: false },
        { type: 'triangle' as const, label: 'Triangle', isCorrect: bottomCorrect },
      ],
    });

    const state = createInitialRunState(GROUND_Y - PLAYER_SIZE, 0);
    state.combo = 2;
    const { callbacks, awarded } = makeCallbacks();

    // Passing bottom lane of a correct gate awards combo-multiplied gate points
    const correctResult = stepRunFrame({
      state,
      problem: makeProblem({ shapeGates: [gateAtPlayer('g1', true)] }),
      dt: 0.016,
      time: 1000,
      canvasWidth: 896,
      canvasHeight: 400,
      groundY: GROUND_Y,
      gateScale: 1,
      playerX: 140,
      jumpRequested: false,
      wasGrounded: true,
      feedbackCopy: FEEDBACK_COPY,
      callbacks,
    });
    expect(correctResult.outcome).toBe('playing');
    expect(awarded).toEqual([GATE_POINTS * 2]);
    expect(state.consecutiveWrongGates).toBe(0);
    expect(state.feedbackType).toBe('correct');

    // First wrong gate resets combo and increments consecutiveWrongGates without crashing
    state.scroll = 0;
    const firstWrong = stepRunFrame({
      state,
      problem: makeProblem({ shapeGates: [gateAtPlayer('g2', false)] }),
      dt: 0.016,
      time: 2000,
      canvasWidth: 896,
      canvasHeight: 400,
      groundY: GROUND_Y,
      gateScale: 1,
      playerX: 140,
      jumpRequested: false,
      wasGrounded: true,
      feedbackCopy: FEEDBACK_COPY,
      callbacks,
    });
    expect(firstWrong.outcome).toBe('playing');
    expect(state.combo).toBe(1);
    expect(state.consecutiveWrongGates).toBe(1);

    // Second consecutive wrong gate crashes the run
    state.scroll = 0;
    const secondWrong = stepRunFrame({
      state,
      problem: makeProblem({ shapeGates: [gateAtPlayer('g3', false)] }),
      dt: 0.016,
      time: 3000,
      canvasWidth: 896,
      canvasHeight: 400,
      groundY: GROUND_Y,
      gateScale: 1,
      playerX: 140,
      jumpRequested: false,
      wasGrounded: true,
      feedbackCopy: FEEDBACK_COPY,
      callbacks,
    });
    expect(secondWrong.outcome).toBe('crashed');
    expect(state.consecutiveWrongGates).toBe(2);
  });

  it('returns won with star rating and fireworks when scroll reaches finish', () => {
    const state = createInitialRunState(GROUND_Y - PLAYER_SIZE, 2);
    state.scroll = 1998;
    state.starsCollected = 2;
    const onSound = vi.fn();

    const result = stepRunFrame({
      state,
      problem: makeProblem({ runLength: 2000 }),
      dt: 0.02,
      time: 5000,
      canvasWidth: 896,
      canvasHeight: 400,
      groundY: GROUND_Y,
      gateScale: 1,
      playerX: 140,
      jumpRequested: false,
      wasGrounded: true,
      feedbackCopy: FEEDBACK_COPY,
      callbacks: {
        onSound,
        onAwardPoints: vi.fn(),
        getSessionScore: () => 150,
      },
    });

    expect(result.outcome).toBe('won');
    expect(result.rating).toBe(3);
    expect(onSound).toHaveBeenCalledWith('win');
    expect(state.particles.some((p) => p.type === 'firework')).toBe(true);
  });
});
