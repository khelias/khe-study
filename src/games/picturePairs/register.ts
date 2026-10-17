/**
 * picture_pairs mechanic registration. See src/games/balanceScale/register.ts
 * for the established colocation pattern (ADR-0001).
 */

import { LANGUAGE_VOCABULARY_SKILL } from '../../curriculum/skills/language';
import { gameRegistry } from '../registry';
import { PICTURE_PAIRS_CONFIG } from './config';
import { generatePicturePairs } from './generator';
import { validatePicturePairs } from './validator';
import { PicturePairsView } from './View';
import type { PicturePairsProblem } from '../../types/game';

gameRegistry.register<PicturePairsProblem>({
  id: 'picture_pairs',
  component: PicturePairsView,
  generator: generatePicturePairs,
  config: PICTURE_PAIRS_CONFIG,
  validator: validatePicturePairs,
  skillIds: [LANGUAGE_VOCABULARY_SKILL.id],
  problemKey: (p) => `pairs:${p.cards.map((c) => c.content).join('|')}`,
  cloneProblem: (p) => ({ ...p, cards: p.cards.map((c) => ({ ...c })) }),
});
