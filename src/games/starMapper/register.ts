/**
 * star_mapper mechanic registration. See src/games/balanceScale/register.ts
 * for the established colocation pattern (ADR-0001).
 *
 * Mechanic: draw, name, draw from memory and find constellations in the real
 * sky (Tähistaevas). Content: ASTRONOMY_VISIBLE_FROM_ESTONIA_PACK. The fact
 * key is the constellation, so a traced one is `factsKnown[id].correct > 0`;
 * the constant render key keeps the sky mounted from task to task.
 */

import { ASTRONOMY_VISIBLE_CONSTELLATIONS_SKILL } from '../../curriculum/skills/astronomy';
import { ASTRONOMY_VISIBLE_FROM_ESTONIA_PACK } from '../../curriculum/packs/astronomy/visibleFromEstonia';
import { gameRegistry } from '../registry';
import { STAR_MAPPER_CONFIG } from './config';
import { generateStarMapper } from './generator';
import { validateStarMapper } from './validator';
import { StarMapperView } from './View';
import type { StarMapperProblem } from '../../types/game';

gameRegistry.register<StarMapperProblem>({
  id: 'star_mapper',
  round: { kind: 'puzzle', size: 3 },
  component: StarMapperView,
  generator: generateStarMapper,
  config: STAR_MAPPER_CONFIG,
  validator: validateStarMapper,
  skillIds: [ASTRONOMY_VISIBLE_CONSTELLATIONS_SKILL.id],
  contentPackId: ASTRONOMY_VISIBLE_FROM_ESTONIA_PACK.id,
  problemKey: (p) => `star:${p.constellation.id}`,
  contentItemIds: (p) => [p.constellation.id],
  factKey: (p) => p.constellation.id,
  renderKey: () => 'sky',
});
