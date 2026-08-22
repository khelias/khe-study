import { getPackItems } from '../../curriculum';
import {
  getConstellationsForLevel,
  ASTRONOMY_VISIBLE_FROM_ESTONIA_PACK,
} from '../../curriculum/packs/astronomy/visibleFromEstonia';
import { getRandom, uid } from '../../engine/rng';
import type { RngFunction, StarMapperProblem, Star, Constellation } from '../../types/game';

/**
 * Helper function to generate distractor stars for expert mode
 *
 * Creates dim background stars that are not part of the constellation
 * to increase difficulty. Number of distractors increases with level.
 *
 * @param constellation - The target constellation (unused, for future positioning logic)
 * @param rng - Random number generator for consistent results
 * @param level - Player level (determines number of distractors: level/3, max 3)
 * @returns Array of distractor stars with magnitude 4-6 (dimmer than constellation stars)
 */
function generateDistractorStars(
  _constellation: Constellation,
  rng: RngFunction,
  level: number,
): Star[] {
  const numDistractors = Math.min(3, Math.floor(level / 3)); // 1-3 distractor stars
  const distractors: Star[] = [];

  for (let i = 0; i < numDistractors; i++) {
    distractors.push({
      id: `distractor_${i}`,
      x: rng() * 100,
      y: rng() * 100,
      magnitude: 4 + rng() * 2, // Dim stars (magnitude 4-6)
    });
  }

  return distractors;
}

/**
 * Helper function to generate identify mode options
 * Returns 4 constellation IDs: 1 correct + 3 wrong options
 */
function generateIdentifyOptions(
  pool: readonly Constellation[],
  correct: Constellation,
  rng: RngFunction,
): string[] {
  // Get wrong options from other constellations
  const allConstellations = pool.filter((c: Constellation) => c.id !== correct.id);

  // Fisher-Yates shuffle
  const shuffled = [...allConstellations];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }

  // Pick 3 wrong options
  const options: string[] = [correct.id];
  for (let i = 0; i < Math.min(3, shuffled.length); i++) {
    options.push(shuffled[i]!.id);
  }

  // Ensure we have 4 options - if not enough constellations, repeat some
  while (options.length < 4 && allConstellations.length > 0) {
    const extra = getRandom(allConstellations, rng);
    if (extra) options.push(extra.id);
    else break;
  }

  // Fisher-Yates shuffle final options
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [options[i], options[j]] = [options[j]!, options[i]!];
  }

  return options;
}

/**
 * star_mapper generator. Mechanic: trace / build / identify constellation
 * shapes, scaling mode and difficulty with level. Content:
 * ASTRONOMY_VISIBLE_FROM_ESTONIA_PACK (constellations visible from 59°N).
 */
export function generateStarMapper(
  level: number,
  rng: RngFunction = Math.random,
): StarMapperProblem {
  const effectiveLevel = level;

  // Difficulty pool by effective level: easy (1–3) → 8 constellations, medium (4–6) → 15, hard (7+) → 16
  const STAR_MAPPER_EASY_MAX = 3;
  const STAR_MAPPER_MEDIUM_MAX = 6;
  const difficulty: 'easy' | 'medium' | 'hard' =
    effectiveLevel <= STAR_MAPPER_EASY_MAX
      ? 'easy'
      : effectiveLevel <= STAR_MAPPER_MEDIUM_MAX
        ? 'medium'
        : 'hard';

  // Mode by effective level: trace 1–2, build 3–5, identify 6–8, expert 9+
  const STAR_MAPPER_TRACE_MAX = 2;
  const STAR_MAPPER_BUILD_MAX = 5;
  const STAR_MAPPER_IDENTIFY_MAX = 8;
  const mode =
    effectiveLevel <= STAR_MAPPER_TRACE_MAX
      ? 'trace'
      : effectiveLevel <= STAR_MAPPER_BUILD_MAX
        ? 'build'
        : effectiveLevel <= STAR_MAPPER_IDENTIFY_MAX
          ? 'identify'
          : 'expert';

  const allConstellations = getPackItems<Constellation>(ASTRONOMY_VISIBLE_FROM_ESTONIA_PACK.id);
  const pool = getConstellationsForLevel(allConstellations, difficulty);
  const picked = getRandom(pool, rng);
  const constellation = picked ?? pool[0];
  if (!constellation) {
    throw new Error('Star Mapper: no constellations available for difficulty ' + difficulty);
  }

  // Generate distractor stars for expert mode
  const distractorStars: Star[] =
    mode === 'expert' ? generateDistractorStars(constellation, rng, effectiveLevel) : [];

  // Generate options for identify mode
  const options =
    mode === 'identify'
      ? generateIdentifyOptions(allConstellations, constellation, rng)
      : undefined;

  return {
    type: 'star_mapper',
    uid: uid(rng),
    mode,
    constellation,
    distractorStars,
    showGuide: mode === 'trace',
    options,
    correctAnswer: constellation.id,
    playerLines: [],
  };
}
