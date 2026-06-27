import { getPackItems } from '../../curriculum';
import {
  LANGUAGE_SPATIAL_SENTENCES_PACK,
  generateSentence,
  getSpatialSentenceScenesForLevel,
  getSceneName,
  type SpatialSentenceScene,
} from '../../curriculum/packs/language/spatialSentences';
import { getRandom, uid } from '../../engine/rng';
import { getLocale } from '../../i18n/index';
import type {
  RngFunction,
  SentenceLogicProblem,
  SceneAnchor,
  SceneSubject,
} from '../../types/game';

/**
 * sentence_logic generator. Mechanic: read a spatial sentence and pick the
 * scene where the subject sits in the described position. Content:
 * LANGUAGE_SPATIAL_SENTENCES_PACK supplies scenes, subjects, anchors, and
 * positions; the sentence is rendered in the active locale at runtime.
 */
export function generateSentenceLogic(
  level: number,
  rng: RngFunction = Math.random,
): SentenceLogicProblem {
  // 1. Select scene based on curriculum progression
  const allScenes = getPackItems<SpatialSentenceScene>(LANGUAGE_SPATIAL_SENTENCES_PACK.id);
  const scenePool = getSpatialSentenceScenesForLevel(allScenes, level);

  const scene = getRandom([...scenePool], rng);
  if (!scene) throw new Error('No scene found for sentence_logic game');
  const sceneKey = scene.id;

  // 2. Select objects
  const subject = getRandom(scene.subjects, rng);
  if (!subject) throw new Error('No subject found for sentence_logic game');

  const anchor = getRandom(scene.anchors, rng);
  if (!anchor) throw new Error('No anchor found for sentence_logic game');

  // 3. Select correct position
  const validPositions = scene.positions;
  const correctPos = getRandom(validPositions, rng);
  if (!correctPos) throw new Error('No position found for sentence_logic game');

  // 4. Generate wrong positions (same objects, different positions)
  const usedPositions = new Set([correctPos]);
  const wrongPositions: string[] = [];

  // Determine number of wrong options based on level
  const numWrongOptions = level >= 4 ? 3 : level >= 3 ? 2 : level >= 2 ? 2 : 1;

  for (let i = 0; i < numWrongOptions && wrongPositions.length < validPositions.length - 1; i++) {
    const available = validPositions.filter((p) => !usedPositions.has(p));
    if (available.length === 0) break;

    const wrongPos = getRandom(available, rng);
    if (wrongPos) {
      wrongPositions.push(wrongPos);
      usedPositions.add(wrongPos);
    }
  }

  // 5. Build options array
  const options = [
    {
      id: 'correct',
      pos: correctPos,
      answer: true,
      subject,
      anchor,
      sceneKey,
      sceneName: scene.name,
      bg: scene.bg,
    },
    ...wrongPositions.map((pos, idx) => ({
      id: `wrong-${idx}`,
      pos,
      answer: false,
      subject,
      anchor,
      sceneKey,
      sceneName: scene.name,
      bg: scene.bg,
    })),
  ];

  // Shuffle options
  const shuffledOptions = [...options].sort(() => rng() - 0.5);

  // 6. Generate sentence in current language
  // Ensure locale is properly initialized (fallback to 'et' if window is not available)
  let locale: 'et' | 'en' = 'et';
  try {
    locale = getLocale();
    // Validate locale
    if (locale !== 'et' && locale !== 'en') {
      locale = 'et';
    }
  } catch (error) {
    console.warn('Error getting locale, defaulting to Estonian:', error);
    locale = 'et';
  }

  const sentence = generateSentence(subject, anchor, correctPos, locale);
  const isInside = correctPos === 'INSIDE';
  const translatedSceneName = getSceneName(scene.name, locale);

  // 7. Map to expected format
  const optionObjects = shuffledOptions.map((opt) => ({
    text: opt.id === 'correct' ? 'correct' : opt.id,
    pos: opt.pos,
    answer: opt.answer,
    a: opt.anchor,
    s: opt.subject,
    bg: opt.bg,
    sceneName: translatedSceneName,
    id: opt.id,
  })) as Array<
    | string
    | {
        text: string;
        pos?: string;
        answer?: boolean;
        a?: SceneAnchor;
        s?: SceneSubject;
        bg?: string;
        sceneName?: string;
        id?: string;
      }
  >;

  return {
    type: 'sentence_logic',
    scene: sceneKey,
    sceneName: translatedSceneName,
    subject,
    anchor,
    position: correctPos,
    caseType: isInside ? 'iness' : 'adess',
    sentence,
    display: sentence,
    options: optionObjects,
    answer: 'correct',
    uid: uid(rng),
  };
}
