/**
 * Core game type definitions
 */

import type { FactStats } from '../learner/types';

// Theme configuration for games
export interface Theme {
  bg: string;
  border: string;
  text: string;
  iconBg: string;
  accent: string;
}

// Category definition
export interface Category {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
}

// Game difficulty levels
export type Difficulty = 'easy' | 'medium' | 'hard';

// Direction helpers (grid-based games)
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

// Position constants for sentence logic game (English keys, translated to Estonian in UI)
export const POSITION = {
  NEXT_TO: 'NEXT_TO', // KÕRVAL
  ON: 'ON', // PEAL
  UNDER: 'UNDER', // ALL
  IN_FRONT: 'IN_FRONT', // EES
  BEHIND: 'BEHIND', // TAGA
  INSIDE: 'INSIDE', // SEES
} as const;

export type PositionType = (typeof POSITION)[keyof typeof POSITION];

// Level-up strategy for games
export type LevelUpStrategy = 'standard' | 'onGameWin';

// Game configuration
/** Paid hint: must be game-specific and give a real advantage in that game (e.g. eliminate wrong option, show outline). */
export interface PaidHint {
  id: string;
  icon: string; // emoji
  cost: number; // stars required
  labelKey: string; // translation key for label (e.g., 'games.shape_shift.hintOutlineCost')
}

/**
 * Per-game visual overrides. Opt-in, game-specific; a game without this
 * object uses its view's built-in defaults. Added in Phase 1 Slice 3 so
 * two bindings sharing the same component (e.g. math_snake + multiplication_snake
 * both use MathSnakeView) can diverge visually without the view having to know
 * the gameType at the API level.
 */
/**
 * Snake-family color families. The MathSnakeView maps each to a Tailwind
 * gradient stack used for head, body and tail. Defaults to 'emerald' so a
 * snake binding without a palette stays visually identical to pre-theming
 * builds. Per-binding picks let the six snake cards (additsioon → roheline,
 * lahutamine → oranž, korrutus → kosmiline indigo / violet) feel distinct
 * even though they share one component.
 */
export type SnakePalette = 'emerald' | 'teal' | 'orange' | 'pink' | 'indigo' | 'purple';

export interface VisualTheme {
  /** Emoji for regular (growth) apples / collectibles. Default per view. */
  normalCollectibleEmoji?: string;
  /** Emoji for special (challenge-triggering) apples / collectibles. */
  challengeCollectibleEmoji?: string;
  /** Background flavor; each view interprets which CSS it applies. */
  background?: 'default' | 'cosmic';
  /** Snake body / head / tail color family. Snake-family bindings only. */
  snakePalette?: SnakePalette;
}

/**
 * Session mode controls how `useAnswerHandler` treats successive answers.
 *
 * - `'single'` (default): each answer ends the question; the handler generates
 *   the next problem and may trigger mid-game level-ups. Used by all classic
 *   mechanics where the registry owns problem rotation.
 * - `'continuous'`: the view owns a single play-session (e.g. timed sprint).
 *   The handler still records score/streak/high-score per answer but skips
 *   auto-generating the next problem and skips mid-game level-up. The view
 *   ends the session itself via `endGame()`.
 */
export type SessionMode = 'single' | 'continuous';

export interface GameConfig {
  id: string;
  title: string;
  theme: Theme;
  icon: string;
  emoji?: string; // Game emoji used in menu/favourites (e.g. 🧠, 🐍)
  desc: string;
  difficulty: Difficulty;
  category: string;
  levelUpStrategy?: LevelUpStrategy; // Optional - defaults to 'standard'
  paidHints?: PaidHint[]; // Optional star-based hints
  visualTheme?: VisualTheme; // Optional per-game visual overrides
  /**
   * Optional mechanic id this binding belongs to. Bindings sharing a mechanic
   * are collapsed into one menu card; tapping it opens a content-pack picker
   * listing the underlying bindings. Mechanics are declared in `MECHANICS`
   * (data.ts). Singleton bindings (no shared mechanic) leave this unset.
   */
  mechanic?: string;
  /**
   * Session model for `useAnswerHandler`. Defaults to `'single'`. See
   * `SessionMode` doc for the contract.
   */
  sessionMode?: SessionMode;
  /**
   * Session duration in seconds for timed game modes. Read by views that
   * implement a session timer (e.g. fact_drill). Ignored otherwise.
   */
  timerDuration?: number;
}

/**
 * Mechanic-level display config. A mechanic is the "how you play" — one
 * engine + view component — that may be bound to many skills/content packs.
 * The menu groups GameConfig entries sharing `mechanic` into one card whose
 * appearance is taken from this map. Click → pack-picker modal listing the
 * bindings inside.
 */
export interface MechanicConfig {
  id: string;
  /** Default English label; runtime resolves t.mechanics.<id>.title first. */
  title: string;
  /** Default English desc; runtime resolves t.mechanics.<id>.desc first. */
  desc: string;
  theme: Theme;
  icon: string;
  emoji?: string;
  category: string;
}

// Word object for word-based games
export interface WordObject {
  w: string;
  e: string;
}

// Letter object for word builder
export interface LetterObject {
  char: string;
  id: string;
}

// Scene subject for sentence logic games
export interface SceneSubject {
  n: string;
  e: string;
}

// Scene anchor for sentence logic games
export interface SceneAnchor {
  n: string;
  adess: string;
  iness: string;
  genitive: string; // Genitive case for postpositions (all, peal, kõrval, ees, taga)
  e: string;
}

// Scene definition
export interface Scene {
  bg: string;
  name: string;
  subjects: SceneSubject[];
  anchors: SceneAnchor[];
  positions: string[];
}

// Base problem interface
export interface BaseProblem {
  type: string;
  uid: string;
}

// Balance scale problem
export interface BalanceScaleProblem extends BaseProblem {
  type: 'balance_scale';
  display: {
    left: number[];
    right: number[];
  };
  answer: number;
  options: number[];
}

// Word builder problem
export interface WordBuilderProblem extends BaseProblem {
  type: 'word_builder';
  target: string;
  emoji: string;
  shuffled: LetterObject[];
  preFilledPositions?: number[]; // Indices of pre-filled positions for longer words
}

// Pattern problem
export type PatternRuleId =
  | 'repeat_ab'
  | 'repeat_abc'
  | 'repeat_abcd'
  | 'repeat_aab'
  | 'repeat_aabb'
  | 'repeat_aabc';

export interface PatternProblem extends BaseProblem {
  type: 'pattern';
  sequence: string[];
  answer: string;
  options: string[];
  patternRule: PatternRuleId;
  patternCycle: string[];
}

// Sentence logic problem
export interface SentenceLogicProblem extends BaseProblem {
  type: 'sentence_logic';
  scene: string;
  sceneName?: string;
  subject: SceneSubject;
  anchor: SceneAnchor;
  position: string;
  caseType: 'adess' | 'iness';
  sentence: string;
  display?: string;
  options: Array<string | { text: string; pos?: string; answer?: boolean }>;
  answer: string;
}

// Memory math problem
export interface MemoryMathProblem extends BaseProblem {
  type: 'memory_math';
  cards: Array<{
    id: string;
    content: string;
    matched?: boolean;
    flipped?: boolean;
    solved?: boolean;
    matchId?: string;
    type?: string;
  }>;
  pairs: Array<{ eq: string; ans: number }>;
}

// Picture Pairs problem (emoji–word matching memory game)
export interface PicturePairsCard {
  id: string;
  content: string;
  matchId: string;
  cardType: 'emoji' | 'word';
  matched?: boolean;
  flipped?: boolean;
  solved?: boolean;
}

export interface PicturePairsProblem extends BaseProblem {
  type: 'picture_pairs';
  cards: PicturePairsCard[];
  pairs: Array<{ word: string; emoji: string }>;
}

// Robo path problem
export interface RoboPathProblem extends BaseProblem {
  type: 'robo_path';
  grid: number[][];
  gridSize: number;
  start: [number, number];
  goal: [number, number];
  end?: [number, number];
  obstacles: Array<[number, number]>;
  correctPath: string[];
  options: string[];
  maxCommands?: number;
  optimalMoves?: number;
  coal?: [number, number];
  coins?: Array<[number, number]>;
}

// Math snake — arithmetic DSL shared between engine and curriculum/packs/math
export type EquationOp =
  | 'add_result'
  | 'add_missing'
  | 'sub_result'
  | 'sub_missing_minuend'
  | 'sub_missing_subtrahend'
  | 'mul_result'
  | 'mul_missing'
  | 'div_result'
  | 'div_missing';

export interface ArithmeticSpec {
  op: EquationOp;
  /** Minimum engine level at which this spec becomes available. Defaults to 1. */
  unlockLevel?: number;
  /** Override multiplication factor range (caps engine's level scaling). */
  factorRange?: [number, number];
  /** Override add/sub value range (caps engine's level scaling). */
  valueRange?: [number, number];
}

// Math snake problem
export interface MathSnakeProblem extends BaseProblem {
  type: 'math_snake';
  gridSize: number;
  snake: Array<[number, number]>;
  direction: Direction;
  apple: { id: string; kind: 'normal' | 'math'; pos: [number, number] } | null;
  applesUntilMath: number;
  math: { equation: string; answer: number; options: number[] } | null;
  /** Spec pool that drives `createMathChallenge`. Supplied at problem creation. */
  specs: readonly ArithmeticSpec[];
}

// Time match problem
export interface TimeMatchProblem extends BaseProblem {
  type: 'time_match';
  hours: number;
  minutes: number;
  display: { hour: number; minute: number };
  options: string[];
  answer: string;
}

// Syllable builder problem
export interface SyllableBuilderProblem extends BaseProblem {
  type: 'syllable_builder';
  target: string;
  emoji: string;
  hint?: string;
  parts?: number;
  syllables: string[];
  shuffled: Array<{ text: string; id: string }>;
}

// Letter match problem
export interface LetterMatchProblem extends BaseProblem {
  type: 'letter_match';
  word: string;
  emoji: string;
  display?: string;
  targetLetter: string;
  targetPosition: number;
  options: string[];
  answer?: string;
}

// Unit conversion problem
export interface UnitConversionProblem extends BaseProblem {
  type: 'unit_conversion';
  value: number;
  fromUnit: string;
  toUnit: string;
  category: string;
  answer: number;
  options: number[];
}

// Compare sizes problem
export interface CompareSizesProblem extends BaseProblem {
  type: 'compare_sizes';
  leftItem: { value: number; display: string; visual?: string };
  rightItem: { value: number; display: string; visual?: string };
  answer: 'left' | 'right' | 'equal';
  options: Array<'left' | 'right' | 'equal'>;
  showNumbers: boolean;
  showSymbols: boolean;
}

// Word cascade problem (arcade word builder)
export interface WordCascadeProblem extends BaseProblem {
  type: 'word_cascade';
  target: string; // curated dictionary word (Estonian by default)
  emoji: string;
  columns: number; // number of lanes letters can fall in
}

// Star Mapper types
export interface Star {
  id: string; // e.g., "betelgeuse"
  x: number; // Normalized 0-100 (relative to constellation bounds)
  y: number; // Normalized 0-100
  magnitude: number; // Visual brightness 0-6 (lower = brighter)
  name?: string; // Famous star name (optional)
}

export interface ConstellationLine {
  from: string; // Star ID
  to: string; // Star ID
}

export interface Constellation {
  id: string;
  nameEn: string;
  nameEt: string;
  folkNameEt?: string; // Traditional Estonian name
  descriptionKey: string; // i18n key for description
  season: 'circumpolar' | 'winter' | 'spring' | 'summer' | 'autumn';
  difficulty: 'easy' | 'medium' | 'hard';
  stars: Star[];
  lines: ConstellationLine[]; // Correct connections
  bounds: { width: number; height: number }; // Aspect ratio
}

export interface StarMapperProblem extends BaseProblem {
  type: 'star_mapper';
  mode: 'trace' | 'build' | 'identify' | 'expert';
  constellation: Constellation;
  distractorStars: Star[]; // Extra stars (expert mode)
  showGuide: boolean; // Trace mode
  options?: string[]; // Identify mode - 4 constellation IDs
  correctAnswer: string; // Constellation ID
  playerLines: ConstellationLine[]; // What player has drawn (starts empty)
}

// Shape shift problem (geometric puzzle game)
export type ShapeType =
  | 'triangle'
  | 'half_square'
  | 'square'
  | 'rectangle'
  | 'hexagon'
  | 'diamond'
  | 'circle';

export interface ShapePiece {
  id: string;
  type: ShapeType;
  color: string; // Tailwind color: 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange' | 'pink' | 'cyan'
  size: number; // Legacy square size in grid units; used when width/height are omitted
  width?: number; // Optional rectangular footprint in grid units
  height?: number; // Optional rectangular footprint in grid units
  correctPosition: { x: number; y: number }; // Target grid position
  correctRotation: number; // Target rotation (0, 90, 180, 270)
  isDecoy?: boolean; // For expert mode - piece doesn't belong
}

export interface Puzzle {
  id: string;
  nameEt: string;
  nameEn: string;
  category: 'shapes' | 'animals' | 'objects' | 'letters' | 'abstract';
  difficulty: 'easy' | 'medium' | 'hard';
  gridSize: number; // e.g., 6 = 6x6 grid
  pieces: ShapePiece[];
}

export interface ShapeShiftProblem extends BaseProblem {
  type: 'shape_shift';
  mode: 'match' | 'rotate' | 'build' | 'expert';
  puzzle: Puzzle;
  pieces: PieceState[]; // Pieces with current position/rotation state
  showHints: boolean; // Match mode shows placement hints
}

export interface PieceState extends ShapePiece {
  currentPosition: { x: number; y: number } | null; // null = in tray
  currentRotation: number;
}

// BattleLearn problem (Battleship-inspired educational game)
/** Cell types: only 'problem' cells open the question modal; others are gameplay-only */
export type BattleLearnCellType = 'empty' | 'problem' | 'ship' | 'star' | 'heart';

export interface Ship {
  id: string;
  length: number;
  positions: Array<[number, number]>; // Grid coordinates occupied by ship
  hits: number; // Number of hits on this ship
}

export interface BattleLearnQuestion {
  prompt: string; // Question text
  options: string[]; // Multiple choice options
  correctIndex: number; // Index of correct answer
}

export interface BattleLearnProblem extends BaseProblem {
  type: 'battlelearn';
  gridSize: number; // Grid dimensions (e.g., 5 for 5x5)
  /** Per-cell type: only 'problem' cells open the question modal */
  cellGrid: BattleLearnCellType[][];
  ships: Ship[]; // Ship placements (hidden from UI initially)
  revealed: Array<[number, number]>; // Cells that have been shot
  hits: Array<[number, number]>; // Cells that were hits
  sunkShips: string[]; // IDs of ships that have been sunk
  shotAvailable: boolean; // Whether player can take a shot
  question: BattleLearnQuestion; // Current educational question
  gameWon: boolean; // All ships sunk
}

// Shape Dash (Geometry Dash–inspired runner with geometry checkpoints)
export interface ShapeDashObstacle {
  id: string;
  x: number; // World x position (pixels)
  type: 'spike' | 'block' | 'circle' | 'floating';
  height?: number; // Block height in px (spikes use default)
  /** Vertical offset from ground (floating obstacles hover in air) */
  offsetY?: number;
  /** Circle radius in px (for type 'circle') */
  radius?: number;
}

export interface ShapeDashCheckpointQuestion {
  prompt: string;
  options: string[];
  correctIndex: number;
}

export interface ShapeDashCheckpoint {
  id: string;
  x: number;
  question: ShapeDashCheckpointQuestion;
  contentItemId?: string; // Curriculum pack item id used for history/rotation
}

/** Collectible star for V3 scoring system */
export interface ShapeDashStar {
  id: string;
  x: number; // World x position (pixels)
  y: number; // World y position (pixels from ground)
  collected?: boolean; // Whether the star has been collected
}

/** Jump pad that auto-bounces the player higher */
export interface ShapeDashJumpPad {
  id: string;
  x: number; // World x position (pixels)
}

/** Speed boost zone that briefly accelerates the player */
export interface ShapeDashBoostZone {
  id: string;
  x: number; // World x position (pixels)
  width: number; // Zone width in pixels
}

/** V4: Shape gate for inline geometry questions (replaces checkpoint modals) */
export interface ShapeDashShapeGate {
  id: string;
  x: number; // World x position (pixels) - center of gate zone
  contentItemId?: string; // Curriculum pack item id used for history/rotation
  prompt: string; // Question text (e.g., "4 sides?" or "Which is a triangle?")
  shapes: Array<{
    // 3 shape options displayed as gates
    type: 'triangle' | 'square' | 'pentagon' | 'hexagon' | 'circle';
    label: string; // Display label (e.g., "Triangle", "Square")
    isCorrect: boolean;
  }>;
  passed?: boolean; // Whether player has passed through this gate zone
  correctChoice?: boolean; // Whether player chose correctly (if passed)
}

/** V4: Terrain segment for multi-level platforms */
export interface ShapeDashTerrainSegment {
  id: string;
  x: number; // World x position (start of segment)
  width: number; // Segment width in pixels
  height: number; // Platform height (0 = ground level, positive = raised)
  type: 'flat' | 'raised' | 'gap' | 'ramp';
  theme?: 'cave' | 'sky' | 'neon' | 'default'; // Visual theme
}

export interface ShapeDashProblem extends BaseProblem {
  type: 'shape_dash';
  obstacles: ShapeDashObstacle[];
  checkpoints: ShapeDashCheckpoint[]; // V3: Legacy - will be replaced by shapeGates in V4
  scrollSpeed: number; // px per second
  runLength: number; // Total world width in px (finish line)
  stars?: ShapeDashStar[]; // V3: Collectible stars
  jumpPads?: ShapeDashJumpPad[]; // V3: Jump pads
  boostZones?: ShapeDashBoostZone[]; // V3: Speed boost zones
  shapeGates?: ShapeDashShapeGate[]; // V4: Shape gates for inline questions
  terrainSegments?: ShapeDashTerrainSegment[]; // V4: Multi-level terrain
  contentItemIds?: string[]; // Curriculum pack item ids included in this generated run
}

/**
 * Fact drill problem (timed-sprint mechanic).
 *
 * One equation rendered as `${a} ${opSymbol} ${b}` whose product/sum/diff is
 * `answer`. The view owns the session (timer, streak, next-fact selection);
 * the registry only seeds the first problem via the generator. Kept neutral
 * with respect to operation so the same mechanic can later host addition
 * and subtraction fact bindings without engine or view changes.
 */
export interface FactDrillProblem extends BaseProblem {
  type: 'fact_drill';
  factorA: number;
  factorB: number;
  opSymbol: string;
  equation: string;
  answer: number;
  factorRange: [number, number];
}

// Answer metadata for game-specific actions
// Union type for all problems
export type Problem =
  | BalanceScaleProblem
  | WordBuilderProblem
  | WordCascadeProblem
  | PatternProblem
  | SentenceLogicProblem
  | MemoryMathProblem
  | PicturePairsProblem
  | RoboPathProblem
  | MathSnakeProblem
  | TimeMatchProblem
  | SyllableBuilderProblem
  | LetterMatchProblem
  | UnitConversionProblem
  | CompareSizesProblem
  | StarMapperProblem
  | ShapeShiftProblem
  | BattleLearnProblem
  | ShapeDashProblem
  | FactDrillProblem;

// RNG function type
export type RngFunction = () => number;

// Generator function type
export interface GeneratorContext {
  avoidContentIds?: string[];
  contentPackId?: string;
  /**
   * Phase 5d: per-learner mechanic variant ("emoji_only", "emoji_word", …).
   * Resolved by `useGameEngine` from `mechanicPreference[mechanicId].variant`
   * with an `ageHint`-driven fallback for first-time learners. Generators
   * decide what to do with it (currently only `picture_pairs` consumes it).
   */
  variant?: string;
  /**
   * Phase 5d: learner age hint (years). Used by generators as a tie-breaker
   * when `variant` is unset. Currently only `picture_pairs` reads it.
   */
  ageHint?: number;
  /**
   * Phase 5e: per-skill state for closed-set generators. The `factsKnown`
   * map enables spaced-repetition selection (weakest fact 70% of the time,
   * mastered facts 30% for retention). Open-set skills leave it undefined
   * and generators fall back to uniform random pool selection.
   */
  skillChallenge?: {
    factsKnown?: Readonly<Record<string, FactStats>>;
  };
}

export type GeneratorFunction = (
  level: number,
  rng?: RngFunction,
  context?: GeneratorContext,
) => Problem;
