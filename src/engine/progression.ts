import { GAME_CONFIG } from '../games/data';

/**
 * Game difficulty tiers for star rewards
 * Prevents farming easy games for stars
 */
const GAME_DIFFICULTY_TIERS: Record<string, number> = {
  easy: 1, // Easy games: 1 star base
  medium: 2, // Medium games: 2 stars base
  hard: 3, // Hard games: 3 stars base
};

/** Rounds that reach their goal at the highest reached level before it rises (ADR 0005 point 3). */
export const ROUNDS_PER_LEVEL = 3;

/** A learner's level in one mechanic: the highest reached and the rounds won toward the next. */
export interface MechanicLevelProgress {
  highestLevel: number;
  roundsReached: number;
}

export interface RoundLevelOutcome extends MechanicLevelProgress {
  leveledUp: boolean;
  /** True when the round counted toward the next level. */
  counted: boolean;
}

/**
 * Applies one finished round to the level. Only a round that reached its goal
 * at the highest reached level counts; the third such round raises the level.
 */
export const applyRoundToLevel = (
  progress: MechanicLevelProgress,
  roundLevel: number,
  reached: boolean,
): RoundLevelOutcome => {
  if (!reached || roundLevel !== progress.highestLevel) {
    return { ...progress, leveledUp: false, counted: false };
  }
  const roundsReached = progress.roundsReached + 1;
  if (roundsReached >= ROUNDS_PER_LEVEL) {
    return {
      highestLevel: progress.highestLevel + 1,
      roundsReached: 0,
      leveledUp: true,
      counted: true,
    };
  }
  return { highestLevel: progress.highestLevel, roundsReached, leveledUp: false, counted: true };
};

/** What a finished round's end screen says about the level. */
export type RoundLevelLine =
  | { kind: 'leveledUp'; level: number }
  | { kind: 'passed' }
  | { kind: 'toNext'; roundsLeft: number; nextLevel: number };

export const roundLevelLine = (
  roundLevel: number,
  outcome: MechanicLevelProgress & { leveledUp: boolean },
): RoundLevelLine => {
  if (outcome.leveledUp) return { kind: 'leveledUp', level: outcome.highestLevel };
  if (roundLevel < outcome.highestLevel) return { kind: 'passed' };
  return {
    kind: 'toNext',
    roundsLeft: ROUNDS_PER_LEVEL - outcome.roundsReached,
    nextLevel: outcome.highestLevel + 1,
  };
};

/**
 * Gets the base star reward for a game based on difficulty
 * @param gameType - Game type (e.g., 'word_builder', 'math_snake')
 * @returns Base star reward (1-3)
 */
export const getGameBaseStarReward = (gameType: string): number => {
  const config = GAME_CONFIG[gameType] || GAME_CONFIG['word_builder']!;
  const difficulty = config.difficulty || 'easy';
  return GAME_DIFFICULTY_TIERS[difficulty] || 1;
};

/**
 * Calculates level multiplier for star rewards
 * @param level - Current level
 * @returns Multiplier (1.0, 1.5, 2.0, or 2.5)
 */
export const getLevelStarMultiplier = (level: number): number => {
  if (level <= 5) return 1.0;
  if (level <= 10) return 1.5;
  if (level <= 15) return 2.0;
  return 2.5;
};

/**
 * Calculates the star reward for a round that reached its goal
 * @param gameType - Game type
 * @param level - Level the round was played at
 * @param perfect - Whether the round lost no life
 * @returns Number of stars earned
 */
export const calculateStarReward = (
  gameType: string,
  level: number,
  perfect: boolean = false,
): number => {
  const baseReward = getGameBaseStarReward(gameType);
  const multiplier = getLevelStarMultiplier(level);
  const baseStars = Math.round(baseReward * multiplier);
  const perfectBonus = perfect ? 1 : 0;

  return baseStars + perfectBonus;
};
