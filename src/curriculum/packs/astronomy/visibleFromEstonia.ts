/**
 * Content pack: constellations visible from Estonia (59° N), version 2.
 *
 * Every IAU constellation whose figure centre culminates at 20° or more from
 * 59° N, except four whose IAU figures are too large to draw (see
 * `scripts/build-sky-data.mjs`). The figures are Hipparcos pairs cut from
 * d3-celestial (`src/games/starMapper/sky/data/`, ADR-0007); the easy tier
 * draws a simple asterism. Names, descriptions, folk names and stories live in
 * the locales under `starMapper.constellations.<id>`; an entry with a folk
 * name or story carries its `folkSource`.
 *
 * Consumed by the `star_mapper` mechanic (Tähistaevas).
 */

import type { ContentPack } from '../../types';
import type { Constellation, FigureLine, SkySeason } from '../../../types/game';
import { ASTRONOMY_VISIBLE_CONSTELLATIONS_SKILL } from '../../skills/astronomy';
import figures from '../../../games/starMapper/sky/data/figures.json';
import { brightStar } from '../../../games/starMapper/sky/brightStars';
import { bestEvening, centreOf } from '../../../games/starMapper/sky/astro';
import { FOLK_SOURCES } from './folkSources';

type Tier = Constellation['difficulty'];

const META: readonly (readonly [id: string, iau: string, difficulty: Tier])[] = [
  ['ursa_major', 'UMa', 'easy'],
  ['ursa_minor', 'UMi', 'easy'],
  ['cassiopeia', 'Cas', 'easy'],
  ['orion', 'Ori', 'easy'],
  ['cygnus', 'Cyg', 'easy'],
  ['lyra', 'Lyr', 'easy'],
  ['pegasus', 'Peg', 'easy'],
  ['leo', 'Leo', 'easy'],
  ['corona_borealis', 'CrB', 'easy'],
  ['gemini', 'Gem', 'easy'],
  ['cepheus', 'Cep', 'medium'],
  ['aquila', 'Aql', 'medium'],
  ['taurus', 'Tau', 'medium'],
  ['auriga', 'Aur', 'medium'],
  ['andromeda', 'And', 'medium'],
  ['bootes', 'Boo', 'medium'],
  ['canis_minor', 'CMi', 'medium'],
  ['aries', 'Ari', 'medium'],
  ['delphinus', 'Del', 'medium'],
  ['triangulum', 'Tri', 'medium'],
  ['sagitta', 'Sge', 'medium'],
  ['cancer', 'Cnc', 'medium'],
  ['virgo', 'Vir', 'medium'],
  ['draco', 'Dra', 'hard'],
  ['camelopardalis', 'Cam', 'hard'],
  ['canes_venatici', 'CVn', 'hard'],
  ['coma_berenices', 'Com', 'hard'],
  ['equuleus', 'Equ', 'hard'],
  ['lacerta', 'Lac', 'hard'],
  ['leo_minor', 'LMi', 'hard'],
  ['lynx', 'Lyn', 'hard'],
  ['monoceros', 'Mon', 'hard'],
  ['serpens', 'Ser', 'hard'],
  ['sextans', 'Sex', 'hard'],
  ['vulpecula', 'Vul', 'hard'],
  ['cetus', 'Cet', 'hard'],
  ['scutum', 'Sct', 'hard'],
  ['aquarius', 'Aqr', 'hard'],
];

/** A centre this far north never sets low: 52° keeps it above 20° at 59° N. */
const CIRCUMPOLAR_DEC = 52;

const SEASON_BY_MONTH: readonly SkySeason[] = [
  'winter',
  'winter',
  'spring',
  'spring',
  'spring',
  'summer',
  'summer',
  'summer',
  'autumn',
  'autumn',
  'autumn',
  'winter',
];

const FIGURES = figures as unknown as Record<string, FigureLine[]>;

function buildItem(id: string, iau: string, difficulty: Tier): Constellation {
  const lines = FIGURES[id];
  if (!lines) throw new Error(`No figure for ${id}`);
  const hips = [...new Set(lines.flat())];
  const centre = centreOf(hips.map(brightStar));
  const evening = bestEvening(centre.ra, centre.dec);
  const folkSource = FOLK_SOURCES[id];
  return {
    id,
    iau,
    difficulty,
    lines,
    centre,
    bestEvening: evening,
    season: SEASON_BY_MONTH[evening.month - 1] ?? 'winter',
    circumpolar: centre.dec >= CIRCUMPOLAR_DEC,
    ...(folkSource ? { folkSource } : {}),
  };
}

const ITEMS: readonly Constellation[] = META.map(([id, iau, difficulty]) =>
  buildItem(id, iau, difficulty),
);

export const ASTRONOMY_VISIBLE_FROM_ESTONIA_PACK: ContentPack<Constellation> = {
  id: 'astronomy.visible_from_estonia',
  skillId: ASTRONOMY_VISIBLE_CONSTELLATIONS_SKILL.id,
  locale: 'et',
  version: '2.0.0',
  title: {
    et: 'Tähtkujud Eesti taevas',
    en: 'Constellations visible from Estonia',
  },
  items: ITEMS,
};

const DIFFICULTY_ORDER: Record<'easy' | 'medium' | 'hard', number> = {
  easy: 1,
  medium: 2,
  hard: 3,
};

/** Get constellations by exact difficulty (for tests / identify options). */
export function getConstellationsByDifficulty(
  items: readonly Constellation[],
  difficulty: 'easy' | 'medium' | 'hard',
): Constellation[] {
  return items.filter((c) => c.difficulty === difficulty);
}

/** Constellations available at a difficulty (easier ones included). */
export function getConstellationsForLevel(
  items: readonly Constellation[],
  difficulty: 'easy' | 'medium' | 'hard',
): Constellation[] {
  const level = DIFFICULTY_ORDER[difficulty];
  return items.filter((c) => DIFFICULTY_ORDER[c.difficulty] <= level);
}

/** Get a constellation by id from a pack's items. */
export function getConstellationById(
  items: readonly Constellation[],
  id: string,
): Constellation | undefined {
  return items.find((c) => c.id === id);
}
