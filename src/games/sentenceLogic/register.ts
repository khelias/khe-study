/**
 * sentence_logic mechanic registration. See src/games/balanceScale/register.ts
 * for the established colocation pattern (ADR-0001).
 *
 * Mechanic: pick the picture that matches a spatial sentence.
 * SentenceLogicView sits on the shared AnswerCardView shell.
 * Content: LANGUAGE_SPATIAL_SENTENCES_PACK (Sentence Logic scenes).
 */

import { LANGUAGE_SPATIAL_SENTENCES_SKILL } from '../../curriculum/skills/language';
import { LANGUAGE_SPATIAL_SENTENCES_PACK } from '../../curriculum/packs/language/spatialSentences';
import { gameRegistry } from '../registry';
import { SENTENCE_LOGIC_CONFIG } from './config';
import { generateSentenceLogic } from './generator';
import { validateSentenceLogic } from './validator';
import { SentenceLogicView } from './View';
import type { SentenceLogicProblem } from '../../types/game';

gameRegistry.register<SentenceLogicProblem>({
  id: 'sentence_logic',
  component: SentenceLogicView,
  generator: generateSentenceLogic,
  config: SENTENCE_LOGIC_CONFIG,
  validator: validateSentenceLogic,
  skillIds: [LANGUAGE_SPATIAL_SENTENCES_SKILL.id],
  contentPackId: LANGUAGE_SPATIAL_SENTENCES_PACK.id,
  problemKey: (p) => `sent:${p.sentence}`,
});
