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

/**
 * Calculates how many correct answers are needed to level up
 * @param level - Current level
 * @returns Number of correct answers required
 */
export const calculateLevelUpRequirement = (level: number): number => {
  // Scaling requirements: higher levels need more correct answers
  if (level <= 1) return 5;
  if (level <= 2) return 7;
  if (level <= 3) return 10;
  if (level <= 4) return 12;
  if (level <= 5) return 15;
  if (level <= 10) return 18;
  if (level <= 15) return 20;
  // Level 16+: 25 correct answers
  return 25;
};

/**
 * Checks if player should level up based on performance
 * @param currentLevel - Current level
 * @param correctAnswers - Number of correct answers in current level
 * @param totalAnswers - Total answers (correct + wrong) in current level
 * @returns True if should level up
 */
export const checkLevelUp = (
  currentLevel: number,
  correctAnswers: number,
  totalAnswers: number,
): boolean => {
  const required = calculateLevelUpRequirement(currentLevel);
  const accuracy = totalAnswers > 0 ? correctAnswers / totalAnswers : 0;

  // Must have required correct answers AND maintain 80%+ accuracy
  return correctAnswers >= required && accuracy >= 0.8;
};

/**
 * True when the correct answers have reached the target but accuracy below 80%
 * still holds the level back.
 */
export const isLevelHeldByAccuracy = (
  currentLevel: number,
  correctAnswers: number,
  totalAnswers: number,
): boolean =>
  correctAnswers >= calculateLevelUpRequirement(currentLevel) &&
  !checkLevelUp(currentLevel, correctAnswers, totalAnswers);

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
 * Calculates star reward for completing a level
 * @param gameType - Game type
 * @param level - Level completed
 * @param perfect - Whether level was completed perfectly (no wrong answers)
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
