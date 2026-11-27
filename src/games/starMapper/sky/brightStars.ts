import bright from './data/bright.json';
import type { SkyStar } from '../../../types/game';

/**
 * Figure stars and stars brighter than magnitude 4.5: the only star data the
 * eager bundle carries (the full catalogue is in the renderer's lazy chunk).
 */
export const BRIGHT_STARS: ReadonlyMap<number, SkyStar> = new Map(
  (bright as unknown as [number, number, number, number][]).map(([hip, ra, dec, mag]) => [
    hip,
    { hip, ra, dec, mag },
  ]),
);

export function brightStar(hip: number): SkyStar {
  const star = BRIGHT_STARS.get(hip);
  if (!star) throw new Error(`Star HIP ${hip} is not in bright.json`);
  return star;
}
