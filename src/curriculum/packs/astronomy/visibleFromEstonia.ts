/**
 * Content pack: constellations visible from Estonia (59°N).
 *
 * Star positions are normalized to a 0–100 viewBox (x right, y down).
 * Shapes follow classic line-drawing patterns (e.g. Big Dipper bowl + handle).
 * Difficulty: easy = 8, medium = 7 more (15 total), hard = 1 more (16 total).
 * Mix of circumpolar and seasonal constellations.
 *
 * Consumed by the `star_mapper` mechanic. Other mechanics (future: quiz,
 * match) can also bind to the same pack via `ASTRONOMY_VISIBLE_CONSTELLATIONS_SKILL`.
 */

import type { ContentPack } from '../../types';
import type { Constellation } from '../../../types/game';
import { ASTRONOMY_VISIBLE_CONSTELLATIONS_SKILL } from '../../skills/astronomy';

const ITEMS: readonly Constellation[] = [
  {
    id: 'ursa_major',
    nameEn: 'Big Dipper',
    nameEt: 'Suur Vanker',
    folkNameEt: 'Odamus',
    descriptionKey: 'starMapper.constellations.ursa_major.desc',
    season: 'circumpolar',
    difficulty: 'easy',
    stars: [
      { id: 'alkaid', x: 10, y: 25, magnitude: 1.9 },
      { id: 'mizar', x: 25, y: 20, magnitude: 2.2 },
      { id: 'alioth', x: 40, y: 22, magnitude: 1.8 },
      { id: 'megrez', x: 52, y: 28, magnitude: 3.3 },
      { id: 'phecda', x: 55, y: 45, magnitude: 2.4 },
      { id: 'merak', x: 72, y: 48, magnitude: 2.4 },
      { id: 'dubhe', x: 75, y: 28, magnitude: 1.8, name: 'Dubhe' },
    ],
    lines: [
      { from: 'alkaid', to: 'mizar' },
      { from: 'mizar', to: 'alioth' },
      { from: 'alioth', to: 'megrez' },
      { from: 'megrez', to: 'phecda' },
      { from: 'phecda', to: 'merak' },
      { from: 'merak', to: 'dubhe' },
      { from: 'dubhe', to: 'megrez' },
    ],
    bounds: { width: 100, height: 70 },
  },
  {
    id: 'ursa_minor',
    nameEn: 'Little Dipper',
    nameEt: 'Väike Vanker',
    folkNameEt: 'Väike Vanker',
    descriptionKey: 'starMapper.constellations.ursa_minor.desc',
    season: 'circumpolar',
    difficulty: 'easy',
    stars: [
      { id: 'polaris', x: 85, y: 20, magnitude: 2.0, name: 'Polaris' },
      { id: 'yildun', x: 70, y: 30, magnitude: 4.4 },
      { id: 'epsilon_umi', x: 55, y: 35, magnitude: 4.2 },
      { id: 'zeta_umi', x: 40, y: 45, magnitude: 4.3 },
      { id: 'eta_umi', x: 25, y: 55, magnitude: 5.0 },
      { id: 'gamma_umi', x: 15, y: 70, magnitude: 3.0 },
      { id: 'kochab', x: 30, y: 80, magnitude: 2.1, name: 'Kochab' },
    ],
    lines: [
      { from: 'polaris', to: 'yildun' },
      { from: 'yildun', to: 'epsilon_umi' },
      { from: 'epsilon_umi', to: 'zeta_umi' },
      { from: 'zeta_umi', to: 'eta_umi' },
      { from: 'eta_umi', to: 'gamma_umi' },
      { from: 'gamma_umi', to: 'kochab' },
      { from: 'kochab', to: 'zeta_umi' },
    ],
    bounds: { width: 100, height: 90 },
  },
  {
    id: 'cassiopeia',
    nameEn: 'Cassiopeia',
    nameEt: 'Kassiopeia',
    descriptionKey: 'starMapper.constellations.cassiopeia.desc',
    season: 'circumpolar',
    difficulty: 'easy',
    stars: [
      { id: 'segin', x: 10, y: 35, magnitude: 3.4 },
      { id: 'ruchbah', x: 30, y: 55, magnitude: 2.7 },
      { id: 'gamma_cas', x: 50, y: 30, magnitude: 2.5 },
      { id: 'schedar', x: 70, y: 50, magnitude: 2.2 },
      { id: 'caph', x: 90, y: 40, magnitude: 2.3 },
    ],
    lines: [
      { from: 'segin', to: 'ruchbah' },
      { from: 'ruchbah', to: 'gamma_cas' },
      { from: 'gamma_cas', to: 'schedar' },
      { from: 'schedar', to: 'caph' },
    ],
    bounds: { width: 100, height: 70 },
  },
  {
    id: 'cepheus',
    nameEn: 'Cepheus',
    nameEt: 'Kefeus',
    descriptionKey: 'starMapper.constellations.cepheus.desc',
    season: 'circumpolar',
    difficulty: 'medium',
    stars: [
      { id: 'alderamin', x: 50, y: 15, magnitude: 2.4 },
      { id: 'alfirk', x: 70, y: 30, magnitude: 3.2 },
      { id: 'iota_cep', x: 80, y: 60, magnitude: 3.5 },
      { id: 'delta_cep', x: 40, y: 75, magnitude: 3.8 },
      { id: 'zeta_cep', x: 25, y: 40, magnitude: 3.4 },
    ],
    lines: [
      { from: 'alderamin', to: 'alfirk' },
      { from: 'alfirk', to: 'iota_cep' },
      { from: 'iota_cep', to: 'delta_cep' },
      { from: 'delta_cep', to: 'zeta_cep' },
      { from: 'zeta_cep', to: 'alderamin' },
    ],
    bounds: { width: 100, height: 90 },
  },
  {
    id: 'draco',
    nameEn: 'Draco',
    nameEt: 'Draakon',
    descriptionKey: 'starMapper.constellations.draco.desc',
    season: 'circumpolar',
    difficulty: 'hard',
    stars: [
      { id: 'eltanin', x: 75, y: 90, magnitude: 2.2, name: 'Eltanin' },
      { id: 'rastaban', x: 65, y: 85, magnitude: 2.8 },
      { id: 'grumium', x: 55, y: 80, magnitude: 3.7 },
      { id: 'xi_dra', x: 50, y: 70, magnitude: 3.7 },
      { id: 'delta_dra', x: 55, y: 55, magnitude: 3.1 },
      { id: 'epsilon_dra', x: 70, y: 45, magnitude: 3.8 },
      { id: 'chi_dra', x: 80, y: 30, magnitude: 3.6 },
      { id: 'thuban', x: 60, y: 20, magnitude: 3.7, name: 'Thuban' },
    ],
    lines: [
      { from: 'eltanin', to: 'rastaban' },
      { from: 'rastaban', to: 'grumium' },
      { from: 'grumium', to: 'xi_dra' },
      { from: 'xi_dra', to: 'delta_dra' },
      { from: 'delta_dra', to: 'epsilon_dra' },
      { from: 'epsilon_dra', to: 'chi_dra' },
      { from: 'chi_dra', to: 'thuban' },
    ],
    bounds: { width: 100, height: 100 },
  },
  {
    id: 'orion',
    nameEn: 'Orion',
    nameEt: 'Orion',
    folkNameEt: 'Reha ja Vikat',
    descriptionKey: 'starMapper.constellations.orion.desc',
    season: 'winter',
    difficulty: 'easy',
    stars: [
      { id: 'betelgeuse', x: 25, y: 15, magnitude: 0.5, name: 'Betelgeuse' },
      { id: 'bellatrix', x: 75, y: 18, magnitude: 1.6 },
      { id: 'alnitak', x: 40, y: 50, magnitude: 1.8 },
      { id: 'alnilam', x: 50, y: 48, magnitude: 1.7 },
      { id: 'mintaka', x: 60, y: 46, magnitude: 2.2 },
      { id: 'saiph', x: 30, y: 85, magnitude: 2.1 },
      { id: 'rigel', x: 70, y: 88, magnitude: 0.1, name: 'Rigel' },
    ],
    lines: [
      { from: 'betelgeuse', to: 'bellatrix' },
      { from: 'betelgeuse', to: 'alnitak' },
      { from: 'bellatrix', to: 'mintaka' },
      { from: 'alnitak', to: 'alnilam' },
      { from: 'alnilam', to: 'mintaka' },
      { from: 'alnitak', to: 'saiph' },
      { from: 'mintaka', to: 'rigel' },
      { from: 'saiph', to: 'rigel' },
    ],
    bounds: { width: 100, height: 100 },
  },
  {
    id: 'cygnus',
    nameEn: 'Cygnus',
    nameEt: 'Luik',
    descriptionKey: 'starMapper.constellations.cygnus.desc',
    season: 'summer',
    difficulty: 'medium',
    stars: [
      { id: 'deneb', x: 50, y: 10, magnitude: 1.3, name: 'Deneb' },
      { id: 'sadr', x: 50, y: 40, magnitude: 2.2 },
      { id: 'gienah', x: 25, y: 55, magnitude: 2.5 },
      { id: 'delta_cyg', x: 75, y: 55, magnitude: 2.9 },
      { id: 'albireo', x: 50, y: 90, magnitude: 3.1, name: 'Albireo' },
    ],
    lines: [
      { from: 'deneb', to: 'sadr' },
      { from: 'sadr', to: 'gienah' },
      { from: 'sadr', to: 'delta_cyg' },
      { from: 'sadr', to: 'albireo' },
    ],
    bounds: { width: 100, height: 100 },
  },
  {
    id: 'leo',
    nameEn: 'Leo',
    nameEt: 'Lõvi',
    descriptionKey: 'starMapper.constellations.leo.desc',
    season: 'spring',
    difficulty: 'medium',
    stars: [
      { id: 'regulus', x: 20, y: 80, magnitude: 1.4, name: 'Regulus' },
      { id: 'eta_leo', x: 25, y: 55, magnitude: 3.5 },
      { id: 'gamma_leo', x: 35, y: 35, magnitude: 2.0 },
      { id: 'zeta_leo', x: 45, y: 25, magnitude: 3.4 },
      { id: 'mu_leo', x: 55, y: 20, magnitude: 3.9 },
      { id: 'epsilon_leo', x: 60, y: 35, magnitude: 3.0 },
      { id: 'delta_leo', x: 75, y: 50, magnitude: 2.6 },
      { id: 'beta_leo', x: 90, y: 55, magnitude: 2.1, name: 'Denebola' },
    ],
    lines: [
      { from: 'regulus', to: 'eta_leo' },
      { from: 'eta_leo', to: 'gamma_leo' },
      { from: 'gamma_leo', to: 'zeta_leo' },
      { from: 'zeta_leo', to: 'mu_leo' },
      { from: 'mu_leo', to: 'epsilon_leo' },
      { from: 'epsilon_leo', to: 'delta_leo' },
      { from: 'delta_leo', to: 'beta_leo' },
    ],
    bounds: { width: 100, height: 90 },
  },
  {
    id: 'pegasus',
    nameEn: 'Pegasus',
    nameEt: 'Pegasus',
    descriptionKey: 'starMapper.constellations.pegasus.desc',
    season: 'autumn',
    difficulty: 'easy',
    stars: [
      { id: 'markab', x: 85, y: 85, magnitude: 2.5 },
      { id: 'scheat', x: 85, y: 15, magnitude: 2.4 },
      { id: 'algenib', x: 15, y: 85, magnitude: 2.8 },
      { id: 'alpheratz', x: 15, y: 15, magnitude: 2.1, name: 'Alpheratz' },
    ],
    lines: [
      { from: 'markab', to: 'scheat' },
      { from: 'scheat', to: 'alpheratz' },
      { from: 'alpheratz', to: 'algenib' },
      { from: 'algenib', to: 'markab' },
    ],
    bounds: { width: 100, height: 100 },
  },
  {
    id: 'lyra',
    nameEn: 'Lyra',
    nameEt: 'Lüüra',
    descriptionKey: 'starMapper.constellations.lyra.desc',
    season: 'summer',
    difficulty: 'easy',
    stars: [
      { id: 'vega', x: 50, y: 10, magnitude: 0.0, name: 'Vega' },
      { id: 'epsilon1', x: 35, y: 40, magnitude: 4.7 },
      { id: 'epsilon2', x: 45, y: 45, magnitude: 4.6 },
      { id: 'zeta', x: 55, y: 45, magnitude: 4.4 },
      { id: 'delta2', x: 65, y: 40, magnitude: 4.2 },
      { id: 'gamma', x: 40, y: 70, magnitude: 3.2 },
      { id: 'beta', x: 60, y: 70, magnitude: 3.5 },
    ],
    lines: [
      { from: 'vega', to: 'epsilon1' },
      { from: 'vega', to: 'zeta' },
      { from: 'epsilon1', to: 'zeta' },
      { from: 'zeta', to: 'beta' },
      { from: 'epsilon1', to: 'gamma' },
      { from: 'gamma', to: 'beta' },
    ],
    bounds: { width: 80, height: 80 },
  },
  {
    id: 'aquila',
    nameEn: 'Aquila',
    nameEt: 'Kotkas',
    descriptionKey: 'starMapper.constellations.aquila.desc',
    season: 'summer',
    difficulty: 'easy',
    stars: [
      { id: 'altair', x: 50, y: 50, magnitude: 0.8, name: 'Altair' },
      { id: 'alshain', x: 35, y: 60, magnitude: 3.7 },
      { id: 'tarazed', x: 65, y: 35, magnitude: 2.7 },
    ],
    lines: [
      { from: 'alshain', to: 'altair' },
      { from: 'altair', to: 'tarazed' },
    ],
    bounds: { width: 80, height: 80 },
  },
  {
    id: 'taurus',
    nameEn: 'Taurus',
    nameEt: 'Sõnn',
    descriptionKey: 'starMapper.constellations.taurus.desc',
    season: 'winter',
    difficulty: 'medium',
    stars: [
      { id: 'aldebaran', x: 40, y: 60, magnitude: 0.9, name: 'Aldebaran' },
      { id: 'elnath', x: 85, y: 15, magnitude: 1.7 },
      { id: 'zeta_tau', x: 70, y: 25, magnitude: 3.0 },
      { id: 'theta_tau', x: 50, y: 50, magnitude: 3.4 },
      { id: 'gamma_tau', x: 30, y: 70, magnitude: 3.7 },
    ],
    lines: [
      { from: 'aldebaran', to: 'theta_tau' },
      { from: 'theta_tau', to: 'zeta_tau' },
      { from: 'zeta_tau', to: 'elnath' },
      { from: 'aldebaran', to: 'gamma_tau' },
    ],
    bounds: { width: 100, height: 85 },
  },
  {
    id: 'gemini',
    nameEn: 'Gemini',
    nameEt: 'Kaksikud',
    descriptionKey: 'starMapper.constellations.gemini.desc',
    season: 'winter',
    difficulty: 'medium',
    stars: [
      { id: 'castor', x: 30, y: 15, magnitude: 1.6, name: 'Castor' },
      { id: 'pollux', x: 50, y: 20, magnitude: 1.2, name: 'Pollux' },
      { id: 'alhena', x: 70, y: 85, magnitude: 1.9 },
      { id: 'mebsuta', x: 35, y: 45, magnitude: 3.0 },
      { id: 'wasat', x: 55, y: 60, magnitude: 3.5 },
      { id: 'mu_gem', x: 25, y: 75, magnitude: 2.9 },
    ],
    lines: [
      { from: 'castor', to: 'mebsuta' },
      { from: 'mebsuta', to: 'mu_gem' },
      { from: 'pollux', to: 'wasat' },
      { from: 'wasat', to: 'alhena' },
      { from: 'castor', to: 'pollux' },
    ],
    bounds: { width: 90, height: 100 },
  },
  {
    id: 'auriga',
    nameEn: 'Auriga',
    nameEt: 'Veomees', // Estonian: charioteer (Auriga)
    descriptionKey: 'starMapper.constellations.auriga.desc',
    season: 'winter',
    difficulty: 'medium',
    stars: [
      { id: 'capella', x: 20, y: 25, magnitude: 0.1, name: 'Capella' },
      { id: 'menkalinan', x: 80, y: 20, magnitude: 1.9 },
      { id: 'theta_aur', x: 85, y: 60, magnitude: 2.6 },
      { id: 'iota_aur', x: 50, y: 85, magnitude: 2.7 },
      { id: 'epsilon_aur', x: 15, y: 60, magnitude: 3.0 },
    ],
    lines: [
      { from: 'capella', to: 'menkalinan' },
      { from: 'menkalinan', to: 'theta_aur' },
      { from: 'theta_aur', to: 'iota_aur' },
      { from: 'iota_aur', to: 'epsilon_aur' },
      { from: 'epsilon_aur', to: 'capella' },
    ],
    bounds: { width: 100, height: 90 },
  },
  {
    id: 'andromeda',
    nameEn: 'Andromeda',
    nameEt: 'Andromeda',
    descriptionKey: 'starMapper.constellations.andromeda.desc',
    season: 'autumn',
    difficulty: 'medium',
    stars: [
      { id: 'mirach', x: 50, y: 25, magnitude: 2.1, name: 'Mirach' },
      { id: 'mu_and', x: 35, y: 50, magnitude: 3.9 },
      { id: 'nu_and', x: 25, y: 75, magnitude: 4.5 },
      { id: 'almach', x: 20, y: 55, magnitude: 2.3, name: 'Almach' },
    ],
    lines: [
      { from: 'mirach', to: 'mu_and' },
      { from: 'mu_and', to: 'nu_and' },
      { from: 'nu_and', to: 'almach' },
    ],
    bounds: { width: 70, height: 90 },
  },
  {
    id: 'corona_borealis',
    nameEn: 'Corona Borealis',
    nameEt: 'Põhjakroon',
    descriptionKey: 'starMapper.constellations.corona_borealis.desc',
    season: 'summer',
    difficulty: 'easy',
    stars: [
      { id: 'alphecca', x: 50, y: 15, magnitude: 2.2, name: 'Alphecca' },
      { id: 'beta_crb', x: 30, y: 35, magnitude: 3.7 },
      { id: 'gamma_crb', x: 25, y: 55, magnitude: 3.8 },
      { id: 'delta_crb', x: 40, y: 70, magnitude: 4.6 },
      { id: 'epsilon_crb', x: 60, y: 70, magnitude: 4.1 },
      { id: 'zeta_crb', x: 75, y: 55, magnitude: 4.0 },
    ],
    lines: [
      { from: 'alphecca', to: 'beta_crb' },
      { from: 'beta_crb', to: 'gamma_crb' },
      { from: 'gamma_crb', to: 'delta_crb' },
      { from: 'delta_crb', to: 'epsilon_crb' },
      { from: 'epsilon_crb', to: 'zeta_crb' },
      { from: 'zeta_crb', to: 'alphecca' },
    ],
    bounds: { width: 100, height: 85 },
  },
];

export const ASTRONOMY_VISIBLE_FROM_ESTONIA_PACK: ContentPack<Constellation> = {
  id: 'astronomy.visible_from_estonia',
  skillId: ASTRONOMY_VISIBLE_CONSTELLATIONS_SKILL.id,
  locale: 'et',
  version: '1.0.0',
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

/**
 * Get constellations available at a difficulty level (includes easier ones).
 * easy → 8, medium → 15 (easy+medium), hard → 16 (all).
 */
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
