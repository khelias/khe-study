/**
 * word_cascade mechanic registration. See src/games/balanceScale/register.ts
 * for the established colocation pattern (ADR-0001).
 *
 * One mechanic (WordCascadeView), two bindings: the core short-word pack and a
 * long-word pack. Both share the validator + view; only generator + skill differ.
 */

import {
  LANGUAGE_LONG_VOCABULARY_SKILL,
  LANGUAGE_VOCABULARY_SKILL,
} from '../../curriculum/skills/language';
import { gameRegistry } from '../registry';
import { WORD_CASCADE_CONFIG, WORD_CASCADE_LONG_CONFIG } from './config';
import { generateWordCascade, generateWordCascadeLong } from './generator';
import { validateWordCascade } from './validator';
import { WordCascadeView } from './View';
import type { WordCascadeProblem } from '../../types/game';

const dedupeWord = (p: WordCascadeProblem) => p.target;
// A new uid remounts the view, which starts the same word over.
const restartTask = (p: WordCascadeProblem): WordCascadeProblem => ({ ...p, uid: `${p.uid}+` });

gameRegistry.register({
  id: 'word_cascade',
  round: { kind: 'tasks', size: 5 },
  component: WordCascadeView,
  generator: generateWordCascade,
  config: WORD_CASCADE_CONFIG,
  validator: validateWordCascade,
  skillIds: [LANGUAGE_VOCABULARY_SKILL.id],
  dedupeWord,
  restartTask,
});

// Long-word pack binding (same mechanic/view as Sõnakosk).
gameRegistry.register({
  id: 'word_cascade_long',
  round: { kind: 'tasks', size: 5 },
  component: WordCascadeView,
  generator: generateWordCascadeLong,
  config: WORD_CASCADE_LONG_CONFIG,
  validator: validateWordCascade,
  skillIds: [LANGUAGE_LONG_VOCABULARY_SKILL.id],
  dedupeWord,
  restartTask,
});
