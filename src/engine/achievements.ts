import { getMechanicIdForGame } from '../games/data';
import type { Achievement } from '../types/achievement';
import type { Stats } from '../types/stats';

export const CORE_GAME_TYPES_FOR_ALL_GAMES = [
  'word_builder',
  'word_cascade',
  'syllable_builder',
  'pattern',
  'sentence_logic',
  'memory_math',
  'robo_path',
  'math_snake',
  'letter_match',
  'unit_conversion',
  'compare_sizes',
  'balance_scale',
  'time_match',
  'battlelearn',
] as const;

type Progress = ReturnType<Achievement['progress']>;

// check is derived from progress, so the unlock and the modal's bar agree.
const achievement = (
  id: string,
  icon: string,
  progress: (stats: Stats) => Progress,
): Achievement => ({
  id,
  icon,
  progress,
  check: (stats) => {
    const { current, target } = progress(stats);
    return current >= target;
  },
});

type CountStat = 'gamesPlayed' | 'maxStreak' | 'totalScore' | 'collectedStars' | 'maxSnakeLength';

const stat = (key: CountStat, target: number) => (stats: Stats) => ({
  current: stats[key] || 0,
  target,
});

/**
 * Stats are kept per binding, achievements per game type: a binding belongs to
 * its mechanic when it shares one (the six snakes are `math_snake`,
 * BattleLearn's three are `battlelearn`), else to its own id.
 */
const bindingValues = (record: Record<string, number>, gameType: string): number[] =>
  Object.entries(record)
    .filter(([binding]) => getMechanicIdForGame(binding) === gameType)
    .map(([, value]) => value || 0);

const highestLevel = (stats: Stats, gameType: string): number =>
  Math.max(0, ...bindingValues(stats.maxLevels, gameType));

const playsOf = (stats: Stats, gameType: string): number =>
  bindingValues(stats.gamesByType, gameType).reduce((sum, plays) => sum + plays, 0);

const maxLevel = (gameType: string, target: number) => (stats: Stats) => ({
  current: highestLevel(stats, gameType),
  target,
});

/**
 * Achievement definitions - achievements and medals system
 */
export const ACHIEVEMENTS: Record<string, Achievement> = {
  first_game: achievement('first_game', '🎮', stat('gamesPlayed', 1)),
  perfect_5: achievement('perfect_5', '⭐', stat('maxStreak', 5)),
  word_master: achievement('word_master', '📝', maxLevel('word_builder', 5)),
  math_whiz: achievement('math_whiz', '🧮', maxLevel('memory_math', 5)),
  pattern_pro: achievement('pattern_pro', '🚂', maxLevel('pattern', 5)),
  score_100: achievement('score_100', '💯', stat('totalScore', 100)),
  score_500: achievement('score_500', '🏆', stat('totalScore', 500)),
  persistent: achievement('persistent', '💪', stat('gamesPlayed', 10)),
  all_games: achievement('all_games', '🎯', (stats) => ({
    current: CORE_GAME_TYPES_FOR_ALL_GAMES.filter((type) => playsOf(stats, type) > 0).length,
    target: CORE_GAME_TYPES_FOR_ALL_GAMES.length,
  })),
  battlelearn_first_win: achievement('battlelearn_first_win', '⚓', maxLevel('battlelearn', 2)),
  battlelearn_captain: achievement('battlelearn_captain', '🚢', maxLevel('battlelearn', 5)),
  battlelearn_admiral: achievement('battlelearn_admiral', '🏴‍☠️', maxLevel('battlelearn', 10)),
  star_collector_50: achievement('star_collector_50', '⭐', stat('collectedStars', 50)),
  star_collector_100: achievement('star_collector_100', '🌟', stat('collectedStars', 100)),
  star_collector_250: achievement('star_collector_250', '✨', stat('collectedStars', 250)),
  snake_master: achievement('snake_master', '🐍', maxLevel('math_snake', 5)),
  snake_growth_20: achievement('snake_growth_20', '📏', stat('maxSnakeLength', 20)),
  snake_growth_30: achievement('snake_growth_30', '📐', stat('maxSnakeLength', 30)),
  // A 7x7 grid holds at most 49 segments.
  snake_growth_max: achievement('snake_growth_max', '👑', stat('maxSnakeLength', 49)),
  syllable_master: achievement('syllable_master', '📚', maxLevel('syllable_builder', 5)),
  sentence_detective: achievement('sentence_detective', '🔍', maxLevel('sentence_logic', 5)),
  robo_master: achievement('robo_master', '🤖', maxLevel('robo_path', 5)),
  letter_detective: achievement('letter_detective', '🔎', maxLevel('letter_match', 5)),
  unit_master: achievement('unit_master', '📏', maxLevel('unit_conversion', 5)),
  compare_master: achievement('compare_master', '🔢', maxLevel('compare_sizes', 5)),
  scale_master: achievement('scale_master', '⚖️', maxLevel('balance_scale', 5)),
  clock_master: achievement('clock_master', '🕐', maxLevel('time_match', 5)),
  cascade_master: achievement('cascade_master', '🌊', maxLevel('word_cascade', 5)),
  cascade_perfect_10: achievement('cascade_perfect_10', '✨', (stats) => ({
    current: playsOf(stats, 'word_cascade'),
    target: 10,
  })),
};

/**
 * Checks for newly unlocked achievements
 * @param stats - Current player statistics
 * @param unlocked - Array of already unlocked achievement IDs
 * @returns Array of newly unlocked achievements
 */
export const checkAchievements = (stats: Stats, unlocked: string[]): Achievement[] => {
  const newUnlocks: Achievement[] = [];
  Object.values(ACHIEVEMENTS).forEach((achievement) => {
    if (!unlocked.includes(achievement.id) && achievement.check(stats)) {
      newUnlocks.push(achievement);
    }
  });
  return newUnlocks;
};
