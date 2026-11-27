import { getPackItems } from '../../curriculum';
import {
  getConstellationsForLevel,
  ASTRONOMY_VISIBLE_FROM_ESTONIA_PACK,
} from '../../curriculum/packs/astronomy/visibleFromEstonia';
import { getRandom, shuffle, uid } from '../../engine/rng';
import { starOrder } from './drawing';
import type {
  Constellation,
  GeneratorContext,
  RngFunction,
  SkyStar,
  StarMapperMode,
  StarMapperProblem,
} from '../../types/game';
import {
  angleBetween,
  bestEveningUtc,
  cameraBasis,
  clamp,
  equatorialToHorizontal,
  equatorialVector,
  horizontalToVector,
  tonightsDarkHour,
  wrap360,
} from './sky/astro';
import { BRIGHT_STARS, brightStar } from './sky/brightStars';
import { treasureNear } from './treasures';

/** Real stars brighter than this near the figure are the decoys. */
const DECOY_MAG = 4.5;
const MAX_DECOYS = 30;
/** Leia taevast starts the camera at least this far from the target. */
export const FIND_MIN_ANGLE = 60;

export function modeForLevel(level: number): StarMapperMode {
  if (level <= 2) return 'draw';
  if (level <= 4) return 'draw_name';
  if (level <= 8) return 'memory';
  return 'find';
}

/**
 * The highest tier a level draws from; the pool holds that tier and every
 * easier one, so Mälu järgi (5-8) asks from easy and medium, traced first.
 */
export function difficultyForLevel(level: number): Constellation['difficulty'] {
  if (level <= 4) return 'easy';
  if (level <= 8) return 'medium';
  return 'hard';
}

/** Constellations the learner has drawn right at least once. */
export function tracedIdsFrom(context: GeneratorContext | undefined): string[] {
  const facts = context?.skillChallenge?.factsKnown ?? {};
  return Object.entries(facts)
    .filter(([, stats]) => stats.correct > 0)
    .map(([id]) => id);
}

function figureStars(constellation: Constellation): SkyStar[] {
  return starOrder(constellation.lines).map(brightStar);
}

export function figureRadius(constellation: Constellation): number {
  const c = equatorialVector(constellation.centre.ra, constellation.centre.dec);
  return Math.max(
    ...figureStars(constellation).map((s) => angleBetween(c, equatorialVector(s.ra, s.dec))),
  );
}

/** The figure's stars and the real stars brighter than 4.5 around it. */
function tappableStars(constellation: Constellation, radius: number): SkyStar[] {
  const own = figureStars(constellation);
  const ownHips = new Set(own.map((s) => s.hip));
  const c = equatorialVector(constellation.centre.ra, constellation.centre.dec);
  const field = radius * 1.5 + 4;
  const decoys = [...BRIGHT_STARS.values()]
    .filter(
      (s) =>
        !ownHips.has(s.hip) &&
        s.mag < DECOY_MAG &&
        angleBetween(c, equatorialVector(s.ra, s.dec)) <= field,
    )
    .sort((a, b) => a.mag - b.mag)
    .slice(0, MAX_DECOYS);
  return [...own, ...decoys];
}

function sceneMoment(constellation: Constellation, nowUtcMs: number): number {
  if (constellation.circumpolar) {
    const tonight = tonightsDarkHour(nowUtcMs);
    if (tonight !== null) return tonight;
  }
  return bestEveningUtc(constellation.bestEvening);
}

/** A camera start facing away from the target by at least FIND_MIN_ANGLE. */
function findCameraStart(
  target: { alt: number; az: number },
  rng: RngFunction,
): { yaw: number; pitch: number } {
  const t = horizontalToVector(target.alt, target.az);
  const turn = 120 + rng() * 120;
  for (const pitch of [30, 15, 5]) {
    for (const extra of [0, 40, -40]) {
      const yaw = wrap360(target.az + turn + extra);
      const forward = cameraBasis({ yaw, pitch, fov: 60 }).forward;
      if (angleBetween(forward, t) >= FIND_MIN_ANGLE) return { yaw, pitch };
    }
  }
  return { yaw: wrap360(target.az + 180), pitch: 0 };
}

/** Share of Mälu järgi and Leia taevast tasks that bring in an untraced constellation to trace. */
const UNTRACED_SHARE = 1 / 3;

/**
 * The constellations a memory or find task picks from: the traced ones, with
 * an untraced one now and then (it comes as Joonista), so new ones still enter.
 */
function tracedFirst(
  pool: readonly Constellation[],
  traced: ReadonlySet<string>,
  rng: RngFunction,
): readonly Constellation[] {
  const done = pool.filter((c) => traced.has(c.id));
  const open = pool.filter((c) => !traced.has(c.id));
  if (done.length === 0 || open.length === 0) return pool;
  return rng() < UNTRACED_SHARE ? open : done;
}

function nameOptions(
  all: readonly Constellation[],
  pool: readonly Constellation[],
  correct: Constellation,
  rng: RngFunction,
): string[] {
  const others = shuffle(
    (pool.length > 3 ? pool : all).filter((c) => c.id !== correct.id),
    rng,
  );
  return shuffle([correct.id, ...others.slice(0, 3).map((c) => c.id)], rng);
}

/**
 * star_mapper (Tähistaevas) generator: a constellation in the real sky over
 * Estonia at the moment it is best seen, in the level's mode. Mälu järgi and
 * Leia taevast ask only for traced constellations; an untraced one comes as
 * Joonista first.
 */
export function generateStarMapper(
  level: number,
  rng: RngFunction = Math.random,
  context: GeneratorContext = {},
): StarMapperProblem {
  const all = getPackItems<Constellation>(ASTRONOMY_VISIBLE_FROM_ESTONIA_PACK.id);
  const pool = getConstellationsForLevel(all, difficultyForLevel(level));
  const tracedIds = tracedIdsFrom(context);
  const levelMode = modeForLevel(level);
  const needsTrace = levelMode === 'memory' || levelMode === 'find';
  const eligible = needsTrace ? tracedFirst(pool, new Set(tracedIds), rng) : pool;
  const avoid = new Set(context.avoidContentIds ?? []);
  const fresh = eligible.filter((c) => !avoid.has(c.id));
  const constellation = getRandom(fresh.length > 0 ? fresh : eligible, rng) ?? pool[0];
  if (!constellation) throw new Error('Star Mapper: the constellation pack is empty');
  const mode = needsTrace && !tracedIds.includes(constellation.id) ? 'draw' : levelMode;

  const sceneUtc = sceneMoment(constellation, Date.now());
  const radius = figureRadius(constellation);
  const target = equatorialToHorizontal(
    constellation.centre.ra,
    constellation.centre.dec,
    sceneUtc,
  );
  const cameraStart =
    mode === 'find'
      ? findCameraStart(target, rng)
      : { yaw: target.az, pitch: clamp(target.alt, 0, 85) };

  return {
    type: 'star_mapper',
    uid: uid(rng),
    mode,
    constellation,
    stars: tappableStars(constellation, radius),
    showGuide: mode === 'draw' || mode === 'draw_name',
    options: mode === 'draw_name' ? nameOptions(all, pool, constellation, rng) : undefined,
    correctAnswer: constellation.id,
    sceneUtc,
    cameraStart,
    figureRadius: radius,
    tracedIds,
    treasureId: treasureNear(constellation, radius)?.id,
    level,
  };
}
