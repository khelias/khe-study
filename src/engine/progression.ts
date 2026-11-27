import { GAME_CONFIG } from '../games/data';

/**
 * Stars a reached round gives before its game and level add theirs. Set
 * against the shop: a round at level 1 gives five to eight, so the cheapest
 * theme takes about five rounds and the dearest about fifteen.
 */
export const ROUND_BASE_STARS = 5;

/** A harder game's round gives more, so easy games are not the way to farm stars. */
const GAME_DIFFICULTY_BONUS: Record<string, number> = { easy: 0, medium: 1, hard: 2 };

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

/** A reached round's stars in a game before its level: five, six or seven by the game's difficulty. */
export const getGameBaseStarReward = (gameType: string): number => {
  const config = GAME_CONFIG[gameType] || GAME_CONFIG['word_builder']!;
  const difficulty = config.difficulty || 'easy';
  return ROUND_BASE_STARS + (GAME_DIFFICULTY_BONUS[difficulty] ?? 0);
};

/** One more star for every five levels above the first five. */
export const getLevelStarBonus = (level: number): number => {
  if (level <= 5) return 0;
  if (level <= 10) return 1;
  if (level <= 15) return 2;
  return 3;
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
  return getGameBaseStarReward(gameType) + getLevelStarBonus(level) + (perfect ? 1 : 0);
};
