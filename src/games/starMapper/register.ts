/**
 * star_mapper mechanic registration. See src/games/balanceScale/register.ts
 * for the established colocation pattern (ADR-0001, Phase 1.6).
 *
 * Mechanic: trace / build / identify constellation shapes.
 * Content: ASTRONOMY_VISIBLE_FROM_ESTONIA_PACK (constellations visible from 59°N).
 */

import { ASTRONOMY_VISIBLE_CONSTELLATIONS_SKILL } from '../../curriculum/skills/astronomy';
import { ASTRONOMY_VISIBLE_FROM_ESTONIA_PACK } from '../../curriculum/packs/astronomy/visibleFromEstonia';
import { gameRegistry } from '../registry';
import { STAR_MAPPER_CONFIG } from './config';
import { generateStarMapper } from './generator';
import { validateStarMapper } from './validator';
import { StarMapperView } from './View';

gameRegistry.register({
  id: 'star_mapper',
  component: StarMapperView,
  generator: generateStarMapper,
  config: STAR_MAPPER_CONFIG,
  validator: validateStarMapper,
  skillIds: [ASTRONOMY_VISIBLE_CONSTELLATIONS_SKILL.id],
  contentPackId: ASTRONOMY_VISIBLE_FROM_ESTONIA_PACK.id,
});
