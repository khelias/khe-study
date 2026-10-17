/**
 * sentence_logic mechanic registration. See src/games/balanceScale/register.ts
 * for the established colocation pattern (ADR-0001).
 *
 * Uses the shared StandardGameView (answer-card mechanic); only the generator,
 * validator, and config are mechanic-specific.
 * Content: LANGUAGE_SPATIAL_SENTENCES_PACK (Sentence Logic scenes).
 */

import { LANGUAGE_SPATIAL_SENTENCES_SKILL } from '../../curriculum/skills/language';
import { LANGUAGE_SPATIAL_SENTENCES_PACK } from '../../curriculum/packs/language/spatialSentences';
import { StandardGameView } from '../../components/gameViews';
import { gameRegistry } from '../registry';
import { SENTENCE_LOGIC_CONFIG } from './config';
import { generateSentenceLogic } from './generator';
import { validateSentenceLogic } from './validator';
import type { SentenceLogicProblem } from '../../types/game';

gameRegistry.register<SentenceLogicProblem>({
  id: 'sentence_logic',
  component: StandardGameView,
  generator: generateSentenceLogic,
  config: SENTENCE_LOGIC_CONFIG,
  validator: validateSentenceLogic,
  skillIds: [LANGUAGE_SPATIAL_SENTENCES_SKILL.id],
  contentPackId: LANGUAGE_SPATIAL_SENTENCES_PACK.id,
  problemKey: (p) => `sent:${p.sentence}`,
});
