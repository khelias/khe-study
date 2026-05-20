/**
 * picture_pairs mechanic registration. See src/games/balanceScale/register.ts
 * for the established colocation pattern (ADR-0001, Phase 1.6).
 */

import { LANGUAGE_VOCABULARY_SKILL } from '../../curriculum/skills/language';
import { gameRegistry } from '../registry';
import { PICTURE_PAIRS_CONFIG } from './config';
import { generatePicturePairs } from './generator';
import { validatePicturePairs } from './validator';
import { PicturePairsView } from './View';

gameRegistry.register({
  id: 'picture_pairs',
  component: PicturePairsView,
  generator: generatePicturePairs,
  config: PICTURE_PAIRS_CONFIG,
  validator: validatePicturePairs,
  skillIds: [LANGUAGE_VOCABULARY_SKILL.id],
});
