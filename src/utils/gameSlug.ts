/**
 * Utilities for converting game IDs to URL-safe slugs and vice versa.
 * Ensures English slugs are used regardless of locale.
 */

/**
 * Converts a game ID to a URL-safe slug.
 * Examples:
 *   word_cascade -> word-cascade
 *   addition_snake -> addition-snake
 *   balance_scale -> balance-scale
 */
export function gameIdToSlug(gameId: string): string {
  return gameId.replace(/_/g, '-');
}

/** Legacy _adv slugs map to the single game ID (profile selects difficulty). */
const SLUG_TO_GAME_ID: Record<string, string> = {
  'pattern-train-adv': 'pattern',
  'word-cascade-adv': 'word_cascade',
  'math-snake-adv': 'math_snake',
  'memory-math-adv': 'memory_math',
  'robo-path-adv': 'robo_path',
  'sentence-logic-adv': 'sentence_logic',
  'letter-match-adv': 'letter_match',
  'unit-conversion-adv': 'unit_conversion',
  'battlelearn-adv': 'battlelearn',
};

/**
 * Converts a URL slug back to a game ID.
 * Legacy -adv slugs redirect to the single game (e.g. pattern-train-adv -> pattern).
 */
export function slugToGameId(slug: string): string {
  const legacy = SLUG_TO_GAME_ID[slug];
  if (legacy) return legacy;
  return slug.replace(/-/g, '_');
}

/**
 * Validates if a slug corresponds to a valid game ID.
 */
export function isValidGameSlug(slug: string, validGameIds: string[]): boolean {
  const gameId = slugToGameId(slug);
  return validGameIds.includes(gameId);
}
