import type { Constellation } from '../../types/game';
import { angleBetween, equatorialVector } from './sky/astro';

/**
 * Hidden treasures: sky objects that show only when zoomed in, near the
 * target's field. A tap opens a card with `starMapper.treasures.<id>`; a
 * folk name there needs `folkSource` (quoted in khe-meta
 * `plans/study-star-sky.md` "Sources"). A treasure gives no star and is not
 * stored (the plan's Decisions).
 */
export interface Treasure {
  id: string;
  /** Degrees, rounded to 3 decimals. */
  ra: number;
  dec: number;
  folkSource?: { title: string; url: string };
}

/** A treasure's button shows only below this field of view (degrees). */
export const TREASURE_FOV = 40;
/** The id of the meteor's card: meteors cross now and then, not one per problem. */
export const METEOR_ID = 'meteor';

export const TREASURES: readonly Treasure[] = [
  {
    id: 'pleiades',
    ra: 56.75,
    dec: 24.117,
    folkSource: {
      title: 'A. Lintrop, uskumuste kartoteek: tähtkujud (ERA II 24, 705, Türi)',
      url: 'https://www.folklore.ee/~aado/maailm/kujud.htm',
    },
  },
  { id: 'andromeda_galaxy', ra: 10.685, dec: 41.269 },
  {
    id: 'mizar_alcor',
    ra: 200.981,
    dec: 54.925,
    folkSource: {
      title: 'A. Kuperjanov, „Sandivanker”. Mäetagused 46 (2010)',
      url: 'https://www.folklore.ee/tagused/nr46/kuperjanov.pdf',
    },
  },
  { id: 'orion_nebula', ra: 83.822, dec: -5.391 },
  { id: 'double_cluster', ra: 35.175, dec: 57.142 },
  { id: 'albireo', ra: 292.68, dec: 27.96 },
];

export const treasureById = (id: string): Treasure | undefined =>
  TREASURES.find((t) => t.id === id);

/** The treasure nearest the target within its field, if one is there. */
export function treasureNear(constellation: Constellation, radius: number): Treasure | null {
  const c = equatorialVector(constellation.centre.ra, constellation.centre.dec);
  const field = radius * 1.5 + 10;
  return (
    TREASURES.map((t) => ({ t, d: angleBetween(c, equatorialVector(t.ra, t.dec)) }))
      .filter(({ d }) => d <= field)
      .sort((a, b) => a.d - b.d)[0]?.t ?? null
  );
}
