import {
  BLOCK_DEFAULT_HEIGHT,
  BOOST_ZONE_MULTIPLIER,
  GRAVITY,
  JUMP_PAD_BOOST_VELOCITY,
  JUMP_VELOCITY,
  SPIKE_HEIGHT,
  SPIKE_WIDTH,
  checkBoostZone,
  checkJumpPadContact,
  checkShapeGatePass,
  checkStarCollection,
  hasReachedFinish,
} from '../../engine/shapeDash';
import type { ShapeDashProblem } from '../../types/game';
import {
  JUMP_SQUASH,
  LANDING_STRETCH,
  PLAYER_SIZE,
  ROTATION_SPEED,
  SCREEN_SHAKE_DECAY,
  SCREEN_SHAKE_INTENSITY,
  SQUASH_STRETCH_DECAY,
  type ShapeDashFeedbackCopy,
} from './layout';
import {
  createExplosionParticles,
  createFireworkParticles,
  createLandParticles,
  createScorePopup,
  createSparkleParticles,
  updateParticles,
} from './particles';
import { GATE_POINTS, STAR_POINTS } from './runPoints';
import type { GameState } from './runState';

export interface StepCallbacks {
  onSound: (sound: 'tap' | 'correct' | 'wrong' | 'win') => void;
  onAwardPoints: (points: number) => void;
  getSessionScore: () => number;
}

export interface StepFrameParams {
  state: GameState;
  problem: ShapeDashProblem;
  dt: number;
  time: number;
  canvasWidth: number;
  canvasHeight: number;
  groundY: number;
  gateScale: number;
  playerX: number;
  jumpRequested: boolean;
  wasGrounded: boolean;
  feedbackCopy: ShapeDashFeedbackCopy;
  callbacks: StepCallbacks;
}

export interface StepFrameResult {
  outcome: 'playing' | 'crashed' | 'won';
  isGrounded: boolean;
  rating?: number;
}

/**
 * Computes the 1-3 star rating at the finish line:
 * 1 for completing the run, 2 for at least half the stars (or 2+ attempts without stars),
 * 3 for all stars on the first attempt.
 */
export function calculateStarRating(
  starsCollected: number,
  totalStars: number,
  attemptCount: number,
): number {
  if (totalStars === 0) {
    return attemptCount === 1 ? 3 : 2;
  }
  let rating = 1;
  if (starsCollected / totalStars >= 0.5) rating = 2;
  if (starsCollected === totalStars && attemptCount === 1) rating = 3;
  return rating;
}

/**
 * Checks player-vs-obstacle collision with a 6 px forgiveness inset on each edge.
 */
export function hasObstacleCollision(
  obstacles: ShapeDashProblem['obstacles'],
  scroll: number,
  playerX: number,
  playerY: number,
  groundY: number,
  canvasWidth: number,
): boolean {
  const playerLeft = playerX;
  const playerRight = playerX + PLAYER_SIZE;
  const playerTop = playerY;
  const playerBottom = playerY + PLAYER_SIZE;

  for (const obs of obstacles) {
    const obsScreenX = obs.x - scroll;
    const offsetY = obs.offsetY ?? 0;
    if (obs.type === 'circle') {
      const r = obs.radius ?? 18;
      const cx = obsScreenX + r;
      const cy = groundY - r - offsetY;
      if (obsScreenX + r * 2 < -20 || obsScreenX > canvasWidth + 20) continue;
      const closestX = Math.max(playerLeft + 6, Math.min(cx, playerRight - 6));
      const closestY = Math.max(playerTop + 6, Math.min(cy, playerBottom - 6));
      const distSq = (closestX - cx) ** 2 + (closestY - cy) ** 2;
      if (distSq < (r + 4) ** 2) return true;
    } else {
      const w = SPIKE_WIDTH;
      const h = obs.type === 'spike' ? SPIKE_HEIGHT : (obs.height ?? BLOCK_DEFAULT_HEIGHT);
      const obsLeft = obsScreenX;
      const obsRight = obsScreenX + w;
      const obsTop = groundY - h - offsetY;
      const obsBottom = groundY - offsetY;
      if (obsScreenX + w < -20 || obsScreenX > canvasWidth + 20) continue;
      if (
        playerRight - 6 > obsLeft + 6 &&
        playerLeft + 6 < obsRight - 6 &&
        playerBottom - 6 > obsTop + 6 &&
        playerTop + 6 < obsBottom - 6
      ) {
        return true;
      }
    }
  }
  return false;
}

export function stepRunFrame({
  state,
  problem,
  dt,
  time,
  canvasWidth,
  canvasHeight,
  groundY,
  gateScale,
  playerX,
  jumpRequested,
  wasGrounded,
  feedbackCopy,
  callbacks,
}: StepFrameParams): StepFrameResult {
  const obstacles = problem.obstacles ?? [];
  const shapeGates = problem.shapeGates ?? [];
  const collectibleStars = problem.stars ?? [];
  const jumpPads = problem.jumpPads ?? [];
  const boostZones = problem.boostZones ?? [];

  const timeScale = time < state.slowTimeUntil ? 0.7 : 1.0;
  const inBoostZone = checkBoostZone(playerX, boostZones, state.scroll);
  const speedMultiplier = inBoostZone ? BOOST_ZONE_MULTIPLIER : 1;

  const nextScroll = state.scroll + problem.scrollSpeed * speedMultiplier * timeScale * dt;
  let py = state.playerY;
  let pvy = state.playerVelY;

  const jumpPadId = checkJumpPadContact(
    { x: playerX, y: py, velocityY: pvy, isOnGround: state.isOnGround },
    jumpPads,
    nextScroll,
  );
  if (jumpPadId && state.isOnGround) {
    pvy = JUMP_PAD_BOOST_VELOCITY;
    state.canDoubleJump = true;
    callbacks.onSound('tap');
  }

  if (jumpRequested) {
    const onGround = py + PLAYER_SIZE >= groundY - 4;
    if (onGround) {
      pvy = JUMP_VELOCITY;
      state.canDoubleJump = true;
      state.squashStretch = JUMP_SQUASH;
      callbacks.onSound('tap');
    } else if (state.canDoubleJump) {
      pvy = JUMP_VELOCITY;
      state.canDoubleJump = false;
      callbacks.onSound('tap');
    }
  }

  pvy += GRAVITY * dt;
  py += pvy * dt;

  let isGrounded: boolean;
  if (py + PLAYER_SIZE >= groundY) {
    py = groundY - PLAYER_SIZE;
    pvy = 0;
    state.isOnGround = true;
    state.canDoubleJump = true;
    if (!wasGrounded) {
      state.squashStretch = LANDING_STRETCH;
      state.particles.push(...createLandParticles(playerX, groundY));
    }
    isGrounded = true;
  } else {
    state.isOnGround = false;
    isGrounded = false;
  }

  if (!state.isOnGround) {
    state.playerRotation += ROTATION_SPEED * dt;
  } else {
    state.playerRotation = Math.round(state.playerRotation / (Math.PI / 2)) * (Math.PI / 2);
  }

  state.squashStretch = state.squashStretch + (1 - state.squashStretch) * SQUASH_STRETCH_DECAY;
  if (state.screenShake > 0) {
    state.screenShake = Math.max(0, state.screenShake - dt * SCREEN_SHAKE_DECAY);
  }
  state.pulsePhase += dt;

  const playerEngineState = {
    x: playerX,
    y: py + PLAYER_SIZE,
    velocityY: pvy,
    isOnGround: state.isOnGround,
  };

  const newlyCollectedStarIds = checkStarCollection(
    playerEngineState,
    collectibleStars,
    nextScroll,
    groundY,
  );
  for (const starId of newlyCollectedStarIds) {
    if (state.collectedStarIds.has(starId)) continue;
    state.collectedStarIds.add(starId);
    state.starsCollected += 1;
    const starPoints = STAR_POINTS * state.combo;
    state.unrecordedPoints += starPoints;
    callbacks.onAwardPoints(starPoints);
    const star = collectibleStars.find((s) => s.id === starId);
    if (star) {
      star.collected = true;
      const starScreenX = star.x - nextScroll;
      const starScreenY = groundY - star.y;
      state.particles.push(...createSparkleParticles(starScreenX, starScreenY));
      state.particles.push(...createScorePopup(starScreenX, starScreenY, starPoints, state.combo));
      callbacks.onSound('correct');
    }
  }

  state.score = callbacks.getSessionScore();

  state.trailPoints.push({ x: playerX, y: py });
  if (state.trailPoints.length > 12) state.trailPoints.shift();
  state.particles = updateParticles(state.particles, dt);

  state.playerY = py;
  state.playerVelY = pvy;
  state.scroll = nextScroll;

  if (hasObstacleCollision(obstacles, nextScroll, playerX, py, groundY, canvasWidth)) {
    if (state.hasShield) {
      state.hasShield = false;
      state.particles.push(
        ...createExplosionParticles(playerX + PLAYER_SIZE / 2, py + PLAYER_SIZE / 2, '#00ffcc'),
      );
      callbacks.onSound('tap');
      state.combo = 1;
      state.comboCount = 0;
    } else {
      state.screenShake = SCREEN_SHAKE_INTENSITY;
      state.particles.push(
        ...createExplosionParticles(playerX + PLAYER_SIZE / 2, py + PLAYER_SIZE / 2, '#00ff88'),
      );
      callbacks.onSound('wrong');
      return { outcome: 'crashed', isGrounded };
    }
  }

  for (let i = 0; i < obstacles.length; i++) {
    const obs = obstacles[i];
    if (!obs) continue;
    const obsScreenX = obs.x - nextScroll;
    if (obsScreenX + SPIKE_WIDTH < playerX && !state.passedObstacleIndices.has(i)) {
      state.passedObstacleIndices.add(i);
      state.comboCount += 1;
      if (state.comboCount >= 3 && state.combo < 3) {
        state.combo = Math.min(3, state.combo + 1);
        state.comboCount = 0;
      }
    }
  }

  const gatePass = checkShapeGatePass(
    playerEngineState,
    shapeGates,
    nextScroll,
    state.passedGateIds,
    groundY,
    gateScale,
  );

  if (gatePass) {
    const gate = shapeGates[gatePass.gateIndex];
    if (gate && !state.passedGateIds.has(gate.id)) {
      state.passedGateIds.add(gate.id);
      const chosenShape = gate.shapes[gatePass.gateChoice];
      const isCorrect = chosenShape?.isCorrect ?? false;

      if (isCorrect) {
        const gatePoints = GATE_POINTS * state.combo;
        state.unrecordedPoints += gatePoints;
        callbacks.onAwardPoints(gatePoints);
        state.consecutiveWrongGates = 0;
        state.feedbackMessage = `✓ ${feedbackCopy.gateCorrect}`;
        state.feedbackType = 'correct';
        state.feedbackUntil = time + 1000;
        callbacks.onSound('correct');
        state.particles.push(
          ...createSparkleParticles(playerX + PLAYER_SIZE / 2, py + PLAYER_SIZE / 2),
        );
        state.particles.push(
          ...createScorePopup(playerX + PLAYER_SIZE / 2, py - 20, GATE_POINTS, state.combo),
        );
      } else {
        state.consecutiveWrongGates += 1;
        if (state.consecutiveWrongGates >= 2) {
          state.screenShake = SCREEN_SHAKE_INTENSITY;
          state.particles.push(
            ...createExplosionParticles(playerX + PLAYER_SIZE / 2, py + PLAYER_SIZE / 2, '#ff3366'),
          );
          callbacks.onSound('wrong');
          return { outcome: 'crashed', isGrounded };
        }
        if (state.hasShield) {
          state.hasShield = false;
          state.particles.push(
            ...createExplosionParticles(playerX + PLAYER_SIZE / 2, py + PLAYER_SIZE / 2, '#00ffcc'),
          );
          state.feedbackMessage = feedbackCopy.shieldLost;
        } else {
          state.combo = 1;
          state.comboCount = 0;
          state.feedbackMessage = `✗ ${feedbackCopy.gateWrong}`;
        }
        state.feedbackType = 'wrong';
        state.feedbackUntil = time + 1500;
        callbacks.onSound('wrong');
      }
    }
  }

  if (hasReachedFinish(nextScroll, problem.runLength)) {
    state.particles.push(...createFireworkParticles(canvasWidth * 0.5, canvasHeight * 0.25));
    callbacks.onSound('win');
    return {
      outcome: 'won',
      isGrounded,
      rating: calculateStarRating(state.starsCollected, state.totalStars, state.attemptCount),
    };
  }

  return { outcome: 'playing', isGrounded };
}
