/**
 * Shape Dash's run state, kept in one mutable ref by the view, and the
 * restart after a crash (the failure that costs a round life; ADR 0005).
 */

// Particle system
export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: 'trail' | 'explosion' | 'landing' | 'firework' | 'sparkle' | 'score';
  text?: string; // For score popups
}

// Game state (all mutable state in a single ref object)
export interface GameState {
  scroll: number;
  playerY: number;
  playerVelY: number;
  playerRotation: number;
  isOnGround: boolean;
  canDoubleJump: boolean;
  gravityFlipped: boolean;
  speedMultiplier: number;
  playerScale: number;
  squashStretch: number;
  screenShake: number;
  attemptCount: number;
  score: number;
  /** Star and gate points not yet written to the persisted total and high score. */
  unrecordedPoints: number;
  coinsCollected: number;
  pulsePhase: number;
  particles: Particle[];
  trailPoints: Array<{ x: number; y: number }>;
  // V3 additions
  combo: number; // Current combo multiplier (1, 2, 3)
  comboCount: number; // Number of obstacles cleared without hit
  starsCollected: number; // Stars collected this run
  correctAnswerStreak: number; // Consecutive correct checkpoint answers (legacy)
  hasShield: boolean; // Shield power-up active
  questionTimer: number; // Current question timer (seconds) - not used in V4
  collectedStarIds: Set<string>; // Track which stars collected
  bestScore: number; // Best score achieved
  totalStars: number; // Total stars in the run
  // V4 additions
  passedGateIds: Set<string>; // Track which gates have been passed
  passedObstacleIndices: Set<number>; // Track which obstacles have been passed (for combo)
  consecutiveWrongGates: number; // Track consecutive wrong gates for crash mechanic
  revealedGateId: string | null; // ID of gate revealed by hint
  slowTimeUntil: number; // Timestamp when slow time effect ends
  feedbackMessage: string | null; // Feedback message to display
  feedbackType: 'correct' | 'wrong' | 'warning' | null; // Type of feedback
  feedbackUntil: number; // Timestamp when feedback disappears
}

/**
 * A crashed run starts again from the start line: position, score, combo,
 * stars and gates reset; the streak and shield carry over.
 */
export function restartRun(state: GameState, startY: number, totalStars: number): void {
  state.scroll = 0;
  state.playerY = startY;
  state.playerVelY = 0;
  state.playerRotation = 0;
  state.isOnGround = true;
  state.canDoubleJump = true;
  state.squashStretch = 1;
  state.screenShake = 0;
  state.score = 0;
  state.particles = [];
  state.trailPoints = [];
  state.attemptCount += 1;
  state.combo = 1;
  state.comboCount = 0;
  state.starsCollected = 0;
  state.collectedStarIds = new Set();
  state.totalStars = totalStars;
  state.passedGateIds = new Set();
  state.passedObstacleIndices = new Set();
  state.consecutiveWrongGates = 0;
  state.revealedGateId = null;
  state.slowTimeUntil = 0;
  state.feedbackMessage = null;
  state.feedbackType = null;
  state.feedbackUntil = 0;
}
