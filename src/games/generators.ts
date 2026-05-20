import { getPackItems, getPackItemsForLocale } from '../curriculum';
import {
  getConstellationsForLevel,
  ASTRONOMY_VISIBLE_FROM_ESTONIA_PACK,
} from '../curriculum/packs/astronomy/visibleFromEstonia';
import {
  LANGUAGE_LONG_VOCABULARY_SKILL,
  LANGUAGE_SYLLABIFICATION_SKILL,
  LANGUAGE_VOCABULARY_SKILL,
} from '../curriculum/skills/language';
import {
  getSyllableWordsForLevel,
  type SyllableWord,
  type VocabularyWord,
} from '../curriculum/packs/language/types';
import {
  ALPHABET,
  getVocabularyWordsAvailableForLevel,
  getVocabularyWordsForLength,
  getVocabularyWordsForLevel,
} from '../curriculum/packs/language/vocabulary';
import {
  LANGUAGE_SPATIAL_SENTENCES_PACK,
  generateSentence,
  getSpatialSentenceScenesForLevel,
  getSceneName,
  type SpatialSentenceScene,
} from '../curriculum/packs/language/spatialSentences';
import { MATH_ADDITION_WITHIN_20_PACK } from '../curriculum/packs/math/addition_within_20';
import { MATH_ADDITION_WITHIN_100_PACK } from '../curriculum/packs/math/addition_within_100';
import { MATH_SUBTRACTION_WITHIN_20_PACK } from '../curriculum/packs/math/subtraction_within_20';
import { MATH_SUBTRACTION_WITHIN_100_PACK } from '../curriculum/packs/math/subtraction_within_100';
import { MATH_MULTIPLICATION_1_5_PACK } from '../curriculum/packs/math/multiplication_1_5';
import { MATH_MULTIPLICATION_1_10_PACK } from '../curriculum/packs/math/multiplication_1_10';
import type { ArithmeticSpec } from '../curriculum/packs/math/types';
import {
  MATH_GEOMETRY_SHAPES_PACK,
  getShapeDashCheckpointQuestions,
  getShapeDashGateQuestions,
  getShapeDashShapeLabel,
  type ShapeDashGateShape,
  type ShapeDashGeometryItem,
} from '../curriculum/packs/math/geometry_shapes';
import { generateBalanceScale } from './balanceScale/generator';
import { generateTimeMatch } from './timeMatch/generator';
import { generateCompareSizes } from './compareSizes/generator';
import { generateUnitConversion } from './unitConversion/generator';
import { generatePattern } from './pattern/generator';
import { generateMemoryMath } from './memoryMath/generator';
import { generatePicturePairs } from './picturePairs/generator';
import {
  MATH_GRID_NAVIGATION_PACK,
  getRoboPathGridSize,
  getRoboPathObstacleStage,
  getRoboPathProfile,
  getRoboPathSettings,
  type RoboPathProgressionItem,
  type RoboPathProgressionProfile,
} from '../curriculum/packs/math/grid_navigation';
import {
  MATH_BATTLELEARN_PACK,
  getBattleLearnCellDistribution,
  getBattleLearnProfileStage,
  type BattleLearnCurriculumItem,
  type BattleLearnProfile,
} from '../curriculum/packs/math/battlelearn';
import { SHAPE_SHIFT_PUZZLES_PACK } from '../curriculum/packs/geometry/shapeShiftPuzzles';
import { getRandom, uid } from '../engine/rng';
import { getLocale } from '../i18n/index';
import { createMathSnakeProblem } from '../engine/mathSnake';
import { buildFactPool, makeFact, pickNextFact } from '../engine/factDrill';
import { placeShips } from '../engine/battlelearn';
import {
  generateBattleLearnOptions,
  generateBattleLearnQuestionForStage,
  shuffleOptionsWithCorrect,
} from './battlelearnQuestions';
import { GATE_WIDTH, getMinObstacleGap, SPIKE_WIDTH } from '../engine/shapeDash';
import type {
  RngFunction,
  WordBuilderProblem,
  WordCascadeProblem,
  SentenceLogicProblem,
  RoboPathProblem,
  SyllableBuilderProblem,
  LetterMatchProblem,
  StarMapperProblem,
  Star,
  Constellation,
  ShapeShiftProblem,
  Puzzle,
  PieceState,
  ShapeType,
  GeneratorFunction,
  GeneratorContext,
  SceneAnchor,
  SceneSubject,
  LetterObject,
  BattleLearnProblem,
  BattleLearnCellType,
  ShapeDashProblem,
  ShapeDashObstacle,
  ShapeDashCheckpoint,
  ShapeDashStar,
  ShapeDashJumpPad,
  ShapeDashBoostZone,
  ShapeDashShapeGate,
  ShapeDashTerrainSegment,
} from '../types/game';

// Helper function to apply letter case based on level
function applyLetterCase(word: string, level: number, rng: RngFunction): string {
  // Level 1-3: All uppercase (KASS)
  if (level <= 3) {
    return word.toUpperCase();
  }
  // Level 4-6: Title case (Kass) to ease into lowercase
  if (level <= 6) {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }
  // Level 7-9: All lowercase (kass)
  if (level <= 9) {
    return word.toLowerCase();
  }
  // Level 10+: Mixed case (KaSs, KoEr)
  return word
    .split('')
    .map((char, idx) => {
      // First letter is always uppercase
      if (idx === 0) return char.toUpperCase();
      // Random case for other letters
      return rng() > 0.5 ? char.toUpperCase() : char.toLowerCase();
    })
    .join('');
}

// Helper function to add distractor letters
function addDistractorLetters(
  correctLetters: LetterObject[],
  count: number,
  language: string,
  rng: RngFunction,
): LetterObject[] {
  if (count === 0) return correctLetters;

  const distractors: LetterObject[] = [];
  const correctCharsRaw = correctLetters.map((l) => l.char);
  const hasUpper = correctCharsRaw.some((c) => c !== c.toLowerCase());
  const hasLower = correctCharsRaw.some((c) => c !== c.toUpperCase());
  const isTitleCase =
    correctCharsRaw.length > 0 &&
    correctCharsRaw[0] !== undefined &&
    correctCharsRaw[0] === correctCharsRaw[0].toUpperCase() &&
    correctCharsRaw.slice(1).every((c) => c === c.toLowerCase());
  const caseStyle: 'upper' | 'lower' | 'title' | 'mixed' = !hasLower
    ? 'upper'
    : !hasUpper
      ? 'lower'
      : isTitleCase
        ? 'title'
        : 'mixed';

  // Define visually and phonetically similar letters
  const similarLetters: Record<string, string[]> =
    language === 'en'
      ? {
          // English similar letters
          A: ['E', 'O', 'H'],
          B: ['D', 'P', 'R'],
          C: ['G', 'O', 'Q'],
          D: ['B', 'O', 'P'],
          E: ['F', 'A', 'B'],
          F: ['E', 'T', 'P'],
          G: ['C', 'O', 'Q'],
          H: ['N', 'K', 'A'],
          I: ['L', 'J', 'T'],
          J: ['I', 'L', 'T'],
          K: ['H', 'R', 'X'],
          L: ['I', 'T', 'J'],
          M: ['N', 'W', 'H'],
          N: ['M', 'H', 'R'],
          O: ['Q', 'C', 'G'],
          P: ['B', 'D', 'R'],
          Q: ['O', 'C', 'G'],
          R: ['P', 'B', 'K'],
          S: ['Z', 'C', 'G'],
          T: ['F', 'I', 'L'],
          U: ['V', 'W', 'Y'],
          V: ['U', 'Y', 'W'],
          W: ['M', 'V', 'U'],
          X: ['K', 'Y', 'Z'],
          Y: ['V', 'U', 'T'],
          Z: ['S', 'X', 'N'],
        }
      : {
          // Estonian similar letters
          A: ['Ä', 'E', 'O'],
          Ä: ['A', 'E', 'Ö'],
          E: ['A', 'Ä', 'I'],
          I: ['E', 'L', 'J'],
          O: ['Ö', 'A', 'Q'],
          Ö: ['O', 'Ü', 'Õ'],
          U: ['Ü', 'V', 'Y'],
          Ü: ['U', 'Ö', 'Y'],
          Õ: ['O', 'Ö', 'A'],
          K: ['G', 'H', 'R'],
          G: ['K', 'Q', 'C'],
          P: ['B', 'R', 'D'],
          B: ['P', 'D', 'R'],
          T: ['D', 'L', 'F'],
          D: ['T', 'B', 'P'],
          S: ['Z', 'Š', 'C'],
          Š: ['S', 'Z', 'Ž'],
          Z: ['S', 'Ž', 'Š'],
          Ž: ['Z', 'Š', 'S'],
          L: ['I', 'T', 'J'],
          R: ['K', 'P', 'N'],
          M: ['N', 'W', 'H'],
          N: ['M', 'R', 'H'],
        };

  const correctChars = correctCharsRaw.map((c) => c.toUpperCase());
  const availableLetters = language === 'en' ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('') : ALPHABET;

  for (let i = 0; i < count; i++) {
    let distractor: string = availableLetters[0] ?? 'A';

    // Try to find a visually/phonetically similar letter
    if (correctChars.length > 0 && rng() > 0.3) {
      const targetChar = correctChars[Math.floor(rng() * correctChars.length)];
      if (!targetChar) {
        // Fallback to random letter
        const randomLetter = availableLetters[Math.floor(rng() * availableLetters.length)];
        if (randomLetter) {
          distractor = randomLetter;
        }
      } else {
        const similar = similarLetters[targetChar];
        if (similar && similar.length > 0) {
          distractor = similar[Math.floor(rng() * similar.length)] as string;
        } else {
          // Fallback to random letter
          const randomLetter = availableLetters[Math.floor(rng() * availableLetters.length)];
          if (randomLetter) {
            distractor = randomLetter;
          }
        }
      }
    } else {
      // Random letter from alphabet
      const randomLetter = availableLetters[Math.floor(rng() * availableLetters.length)];
      if (randomLetter) {
        distractor = randomLetter;
      }
    }

    // Ensure we don't add a letter that's already in the correct set
    let attempts = 0;
    while (distractor && correctChars.includes(distractor.toUpperCase()) && attempts < 20) {
      const newDistractor = availableLetters[Math.floor(rng() * availableLetters.length)];
      if (newDistractor) {
        distractor = newDistractor;
      }
      attempts++;
    }
    if (!distractor) {
      distractor = availableLetters[0] ?? 'A';
    }

    let displayChar = distractor;
    if (caseStyle === 'upper') {
      displayChar = distractor.toUpperCase();
    } else if (caseStyle === 'lower' || caseStyle === 'title') {
      displayChar = distractor.toLowerCase();
    } else {
      displayChar = rng() > 0.5 ? distractor.toUpperCase() : distractor.toLowerCase();
    }

    distractors.push({
      char: displayChar,
      id: `distractor-${i}-${uid(rng)}`,
    });
  }

  return [...correctLetters, ...distractors];
}

export const Generators: Record<string, GeneratorFunction> = {
  balance_scale: generateBalanceScale,

  word_builder: (level: number, rng: RngFunction = Math.random): WordBuilderProblem => {
    const locale = getLocale();
    const words = getPackItemsForLocale<VocabularyWord>(LANGUAGE_VOCABULARY_SKILL.id, locale);
    const availableWords = getVocabularyWordsForLevel(words, level, {
      preferWithoutDiacritics: locale !== 'en' && level <= 2,
    });

    const wordObj = getRandom(availableWords, rng);
    if (!wordObj) {
      throw new Error('No word found for word_builder game');
    }

    // Apply letter case transformation based on level
    const displayWord = applyLetterCase(wordObj.w, level, rng);

    // Generate letter objects
    let letters: LetterObject[] = displayWord.split('').map((c, i) => ({
      char: c,
      id: `char-${i}-${uid(rng)}`,
    }));

    // Add distractor letters based on level
    const distractorCount = level <= 2 ? 0 : level <= 4 ? 1 : level <= 7 ? 2 : 3;
    if (distractorCount > 0) {
      letters = addDistractorLetters(letters, distractorCount, locale, rng);
    }

    // Shuffle all letters
    const shuffled = [...letters].sort(() => rng() - 0.5);

    // Pre-filled positions for longer words
    let preFilledPositions: number[] | undefined;
    if (displayWord.length >= 6) {
      const preFillCount = displayWord.length >= 7 ? 2 : 1;
      preFilledPositions = [];
      // Fill first position
      if (preFillCount >= 1) {
        preFilledPositions.push(0);
      }
      // Fill last position for 7+ letter words
      if (preFillCount >= 2) {
        preFilledPositions.push(displayWord.length - 1);
      }
    }

    return {
      type: 'word_builder',
      target: displayWord,
      emoji: wordObj.e,
      shuffled,
      preFilledPositions,
      uid: uid(rng),
    };
  },

  word_cascade: (level: number, rng: RngFunction = Math.random): WordCascadeProblem => {
    const locale = getLocale();
    const words = getPackItemsForLocale<VocabularyWord>(LANGUAGE_VOCABULARY_SKILL.id, locale);

    // Levels map to word lengths (start short, grow gradually)
    // Allow longer words at earlier levels to increase variety
    // Level 1-2: allow 3-4 letter words (was: only 3)
    // Level 3-4: allow 4-5 letter words (was: only 4)
    // Level 5+: normal progression
    let desiredLen: number;
    if (level <= 2) {
      // Level 1-2: prefer 3, but allow 4
      desiredLen = rng() < 0.7 ? 3 : 4;
    } else if (level <= 4) {
      // Level 3-4: prefer 4, but allow 5
      desiredLen = rng() < 0.7 ? 4 : 5;
    } else {
      // Level 5+: normal progression
      desiredLen = Math.max(3, Math.min(7, 3 + Math.floor(level / 2)));
    }

    const bucket = getVocabularyWordsForLength(words, desiredLen, level, {
      fallbackLengths: [desiredLen - 1, desiredLen + 1, 3, 4, 5, 6, 7],
    });
    const chosen = (bucket.length > 0 ? getRandom(bucket, rng) : null) ?? {
      w: 'KASS',
      e: '🐱',
    };

    // Keep casing aligned with the existing word builder logic
    const target = applyLetterCase(chosen.w, level, rng);

    return {
      type: 'word_cascade',
      uid: uid(rng),
      target,
      emoji: chosen.e,
      columns: level < 6 ? 4 : 5,
    };
  },

  word_cascade_long: (level: number, rng: RngFunction = Math.random): WordCascadeProblem => {
    const locale = getLocale();
    const words = getPackItemsForLocale<VocabularyWord>(LANGUAGE_LONG_VOCABULARY_SKILL.id, locale);

    const desiredLen = level <= 3 ? 9 : 10;
    const bucket = getVocabularyWordsForLength(words, desiredLen, level, {
      fallbackLengths: [desiredLen + 1, desiredLen - 1, 11, 10, 9, 8],
    });
    const chosen = (bucket.length > 0 ? getRandom(bucket, rng) : null) ?? {
      w: locale === 'en' ? 'TELESCOPE' : 'TELESKOOP',
      e: '🔭',
    };

    const target = applyLetterCase(chosen.w, level, rng);

    return {
      type: 'word_cascade',
      uid: uid(rng),
      target,
      emoji: chosen.e,
      columns: 5,
    };
  },

  pattern: generatePattern,

  memory_math: generateMemoryMath,

  picture_pairs: generatePicturePairs,

  // Each snake generator resolves its own focused pack. One mechanic, many skills.
  addition_snake: (level: number, rng: RngFunction = Math.random) => {
    const specs = getPackItems<ArithmeticSpec>(MATH_ADDITION_WITHIN_20_PACK.id);
    return createMathSnakeProblem(specs, level, rng);
  },

  addition_big_snake: (level: number, rng: RngFunction = Math.random) => {
    const specs = getPackItems<ArithmeticSpec>(MATH_ADDITION_WITHIN_100_PACK.id);
    return createMathSnakeProblem(specs, level, rng);
  },

  subtraction_snake: (level: number, rng: RngFunction = Math.random) => {
    const specs = getPackItems<ArithmeticSpec>(MATH_SUBTRACTION_WITHIN_20_PACK.id);
    return createMathSnakeProblem(specs, level, rng);
  },

  subtraction_big_snake: (level: number, rng: RngFunction = Math.random) => {
    const specs = getPackItems<ArithmeticSpec>(MATH_SUBTRACTION_WITHIN_100_PACK.id);
    return createMathSnakeProblem(specs, level, rng);
  },

  multiplication_snake: (level: number, rng: RngFunction = Math.random) => {
    const specs = getPackItems<ArithmeticSpec>(MATH_MULTIPLICATION_1_5_PACK.id);
    return createMathSnakeProblem(specs, level, rng);
  },

  multiplication_big_snake: (level: number, rng: RngFunction = Math.random) => {
    const specs = getPackItems<ArithmeticSpec>(MATH_MULTIPLICATION_1_10_PACK.id);
    return createMathSnakeProblem(specs, level, rng);
  },

  // Fact Drill family — timed multiplication sprint. The generator only seeds
  // the first equation; FactDrillView owns subsequent picks via `makeFact` so
  // the session can keep going without round-tripping through the registry.
  multiplication_fact_drill_1_5: (_level: number, rng: RngFunction = Math.random) => {
    const range: [number, number] = [2, 5];
    const pool = buildFactPool(range);
    const pair = pickNextFact(pool, new Set(), rng) ?? [2, 2];
    return makeFact(pair[0], pair[1], '×', range, rng);
  },

  multiplication_fact_drill_1_10: (_level: number, rng: RngFunction = Math.random) => {
    const range: [number, number] = [2, 10];
    const pool = buildFactPool(range);
    const pair = pickNextFact(pool, new Set(), rng) ?? [2, 2];
    return makeFact(pair[0], pair[1], '×', range, rng);
  },

  // Addition fact drill — commutative; operand range expressed via factorRange.
  // within_20: operands 1..10 (max sum 20). within_100: operands 1..50 (max 100).
  addition_fact_drill_within_20: (_level: number, rng: RngFunction = Math.random) => {
    const range: [number, number] = [1, 10];
    const pool = buildFactPool(range);
    const pair = pickNextFact(pool, new Set(), rng) ?? [1, 1];
    return makeFact(pair[0], pair[1], '+', range, rng, (a, b) => a + b);
  },

  addition_fact_drill_within_100: (_level: number, rng: RngFunction = Math.random) => {
    const range: [number, number] = [1, 50];
    const pool = buildFactPool(range);
    const pair = pickNextFact(pool, new Set(), rng) ?? [1, 1];
    return makeFact(pair[0], pair[1], '+', range, rng, (a, b) => a + b);
  },

  // Subtraction fact drill — non-commutative; pool pairs (a, b) with a <= b
  // are reversed to (b, a) so the displayed equation is always "b − a" with
  // a non-negative result.
  subtraction_fact_drill_within_20: (_level: number, rng: RngFunction = Math.random) => {
    const range: [number, number] = [1, 20];
    const pool = buildFactPool(range);
    const pair = pickNextFact(pool, new Set(), rng) ?? [1, 1];
    const [smaller, larger] = pair;
    return makeFact(larger, smaller, '−', range, rng, (a, b) => a - b, false);
  },

  subtraction_fact_drill_within_100: (_level: number, rng: RngFunction = Math.random) => {
    const range: [number, number] = [1, 100];
    const pool = buildFactPool(range);
    const pair = pickNextFact(pool, new Set(), rng) ?? [1, 1];
    const [smaller, larger] = pair;
    return makeFact(larger, smaller, '−', range, rng, (a, b) => a - b, false);
  },

  // Division fact drill — inverse of multiplication. The (quotient, divisor)
  // pair from the factor pool builds an exact-quotient equation
  // "(q×d) ÷ d = q", so all answers stay integer.
  division_fact_drill_1_5: (_level: number, rng: RngFunction = Math.random) => {
    const range: [number, number] = [2, 5];
    const pool = buildFactPool(range);
    const pair = pickNextFact(pool, new Set(), rng) ?? [2, 2];
    const [q, d] = pair;
    return makeFact(q * d, d, '÷', range, rng, (a, b) => a / b, false);
  },

  division_fact_drill_1_10: (_level: number, rng: RngFunction = Math.random) => {
    const range: [number, number] = [2, 10];
    const pool = buildFactPool(range);
    const pair = pickNextFact(pool, new Set(), rng) ?? [2, 2];
    const [q, d] = pair;
    return makeFact(q * d, d, '÷', range, rng, (a, b) => a / b, false);
  },

  sentence_logic: (level: number, rng: RngFunction = Math.random): SentenceLogicProblem => {
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
  },

  letter_match: (level: number, rng: RngFunction = Math.random): LetterMatchProblem => {
    // Select uppercase letter - this is what is shown
    const targetUpper = getRandom(ALPHABET, rng);
    if (!targetUpper) {
      throw new Error('No letter found for letter_match game');
    }
    const targetLower = targetUpper.toLowerCase();

    // Generate wrong choices - lowercase letters
    const opts = new Set([targetLower]);

    // Level 1-2: random lowercase letters
    // Level 3-4: similar lowercase letters
    // Level 5+: very similar lowercase letters
    const similarLetters =
      level >= 5
        ? ALPHABET.filter((l) => {
            // Find letters that are close in alphabet
            const targetIdx = ALPHABET.indexOf(targetUpper);
            return Math.abs(ALPHABET.indexOf(l) - targetIdx) <= 2 && l !== targetUpper;
          })
        : level >= 3
          ? ALPHABET.filter((l) => {
              // Find letters that are close in alphabet (laiem)
              const targetIdx = ALPHABET.indexOf(targetUpper);
              return Math.abs(ALPHABET.indexOf(l) - targetIdx) <= 5 && l !== targetUpper;
            })
          : ALPHABET;

    // Level 3+ - show more choices (4 instead of 3)
    const optionCount = level >= 3 ? 4 : 3;
    while (opts.size < optionCount) {
      const r = getRandom(similarLetters.length > 0 ? similarLetters : ALPHABET, rng);
      if (r && r !== targetUpper) opts.add(r.toLowerCase());
    }

    // Find a word that contains the target letter (for emoji)
    let wordObj: Pick<VocabularyWord, 'w' | 'e'> | null = null;
    const vocabularyWords = getVocabularyWordsAvailableForLevel(
      getPackItemsForLocale<VocabularyWord>(LANGUAGE_VOCABULARY_SKILL.id, 'et'),
      level,
    );
    const letterWords = vocabularyWords.filter((word) => word.w.includes(targetUpper));
    if (letterWords.length > 0) {
      wordObj = getRandom(letterWords, rng);
    }
    if (!wordObj) {
      wordObj = { w: targetUpper, e: '❓' };
    }

    return {
      type: 'letter_match',
      word: wordObj.w,
      emoji: wordObj.e,
      display: targetUpper, // Show uppercase letter
      targetLetter: targetLower, // Correct answer is lowercase letter
      targetPosition: 0, // No longer needed, but kept for compatibility
      options: Array.from(opts).sort(() => rng() - 0.5),
      answer: targetLower,
      uid: uid(rng),
    };
  },

  robo_path: (level: number, rng: RngFunction = Math.random): RoboPathProblem => {
    const progressionItems = getPackItems<RoboPathProgressionItem>(MATH_GRID_NAVIGATION_PACK.id);
    const progressionProfile: RoboPathProgressionProfile = 'starter';
    const profileProgression = getRoboPathProfile(progressionItems, progressionProfile);
    const obstacleStage = getRoboPathObstacleStage(progressionItems, level);
    const settings = getRoboPathSettings(progressionItems);

    // Improved grid size progression - scales better with levels
    // Starter: 3x3 (1-2), 4x4 (3-5), 5x5 (6-10), 6x6 (11-15), 7x7 (16+)
    // Advanced: 4x4 (1-2), 5x5 (3-5), 6x6 (6-10), 7x7 (11-15), 8x8 (16+)
    const gridSize = getRoboPathGridSize(progressionItems, progressionProfile, level);

    // Improved obstacle count progression - more obstacles, better scaling
    // Level 1: 0-1, Level 2-3: 1-2, Level 4-5: 2-3, Level 6-8: 3-4, Level 9-12: 4-5, Level 13+: 5-7
    const baseObstacles =
      obstacleStage.baseObstacles +
      Math.floor((level - obstacleStage.levelOffset) / obstacleStage.growthDivisor);
    const obstacleBonus =
      level === 1 ? profileProgression.firstLevelObstacleBonus : profileProgression.obstacleBonus;
    const obstacleCount = Math.min(
      baseObstacles + obstacleBonus + Math.floor(rng() * obstacleStage.obstacleVariance),
      Math.max(
        settings.maxObstacleFloor,
        Math.floor(gridSize * gridSize * settings.maxObstacleRatio),
      ), // Max 25% of grid cells
    );

    const start = { x: 0, y: 0, dir: 'N' };
    const maxCells = gridSize * gridSize;
    const maxObstacles = Math.max(0, maxCells - settings.reservedCells); // Reserve space for start, goal, and path
    const cappedObstacleCount = Math.min(obstacleCount, maxObstacles);

    const directions: Array<[number, number]> = [
      [0, -1],
      [0, 1],
      [-1, 0],
      [1, 0],
    ]; // UP, DOWN, LEFT, RIGHT

    const findShortestPath = (
      startPos: [number, number],
      endPos: [number, number],
      obstacleSet: Set<string>,
    ): { length: number; path: Array<[number, number]> } | null => {
      const queue: Array<[number, number]> = [startPos];
      const visited = new Set<string>();
      const parent = new Map<string, string>();
      visited.add(`${startPos[0]},${startPos[1]}`);

      while (queue.length > 0) {
        const current = queue.shift();
        if (!current) break;
        const [x, y] = current;
        if (x === endPos[0] && y === endPos[1]) {
          const path: Array<[number, number]> = [];
          let key: string | undefined = `${x},${y}`;
          while (key) {
            const parts = key.split(',');
            const px = Number(parts[0]);
            const py = Number(parts[1]);
            if (!isNaN(px) && !isNaN(py)) {
              path.push([px, py]);
            }
            key = parent.get(key);
          }
          path.reverse();
          return { length: path.length - 1, path };
        }
        for (const [dx, dy] of directions) {
          const newX = x + dx;
          const newY = y + dy;
          const key = `${newX},${newY}`;
          if (
            newX >= 0 &&
            newX < gridSize &&
            newY >= 0 &&
            newY < gridSize &&
            !visited.has(key) &&
            !obstacleSet.has(key)
          ) {
            visited.add(key);
            parent.set(key, `${x},${y}`);
            queue.push([newX, newY]);
          }
        }
      }

      return null;
    };

    const hasFreeStartNeighbor = (obstacleSet: Set<string>): boolean => {
      return directions.some(([dx, dy]) => {
        const nx = start.x + dx;
        const ny = start.y + dy;
        if (nx < 0 || ny < 0 || nx >= gridSize || ny >= gridSize) return false;
        return !obstacleSet.has(`${nx},${ny}`);
      });
    };

    // Calculate minimum distance based on grid size (at least 50% of diagonal)
    const minDistance = Math.max(
      2,
      Math.ceil(Math.sqrt(gridSize * gridSize * 2) * settings.minGoalDistanceRatio),
    );
    const maxDistance = Math.floor(
      Math.sqrt(gridSize * gridSize * 2) * settings.maxGoalDistanceRatio,
    ); // Max 90% of diagonal

    let end = { x: 0, y: 0 };
    let obstacles: Array<{ x: number; y: number }> = [];
    let optimalMoves = 0;
    let path: Array<[number, number]> = [];
    let safety = 0;

    while (safety < 100) {
      safety++;

      // Place goal with minimum distance requirement
      let attempts = 0;
      do {
        end = { x: Math.floor(rng() * gridSize), y: Math.floor(rng() * gridSize) };
        attempts++;
      } while (
        attempts < 60 &&
        (Math.abs(end.x - start.x) + Math.abs(end.y - start.y) < minDistance ||
          Math.abs(end.x - start.x) + Math.abs(end.y - start.y) > maxDistance)
      );

      // Strategic obstacle placement
      obstacles = [];
      const obstacleSet = new Set<string>();

      // First, place obstacles strategically along potential paths
      // 1. Place some obstacles near the goal (makes it harder to reach)
      const goalObstacleCount = Math.floor(cappedObstacleCount * 0.4); // 40% near goal
      let goalObstacleAttempts = 0;
      while (obstacles.length < goalObstacleCount && goalObstacleAttempts < 50) {
        goalObstacleAttempts++;
        const angle = rng() * Math.PI * 2;
        const distance = 1 + rng() * 2; // 1-3 cells from goal
        const obsX = Math.round(end.x + Math.cos(angle) * distance);
        const obsY = Math.round(end.y + Math.sin(angle) * distance);

        if (
          obsX >= 0 &&
          obsX < gridSize &&
          obsY >= 0 &&
          obsY < gridSize &&
          obsX !== start.x &&
          obsY !== start.y &&
          obsX !== end.x &&
          obsY !== end.y &&
          !obstacleSet.has(`${obsX},${obsY}`)
        ) {
          obstacles.push({ x: obsX, y: obsY });
          obstacleSet.add(`${obsX},${obsY}`);
        }
      }

      // 2. Place obstacles to create interesting detours (not blocking completely, but forcing longer paths)
      const detourObstacleCount = Math.floor(cappedObstacleCount * 0.4); // 40% for detours
      let detourAttempts = 0;
      while (obstacles.length < goalObstacleCount + detourObstacleCount && detourAttempts < 80) {
        detourAttempts++;
        // Place obstacles in the "middle zone" between start and goal
        const midX = Math.floor((start.x + end.x) / 2);
        const midY = Math.floor((start.y + end.y) / 2);
        const offsetX = Math.floor((rng() - 0.5) * (gridSize * 0.6));
        const offsetY = Math.floor((rng() - 0.5) * (gridSize * 0.6));
        const obsX = Math.max(0, Math.min(gridSize - 1, midX + offsetX));
        const obsY = Math.max(0, Math.min(gridSize - 1, midY + offsetY));

        if (
          obsX !== start.x &&
          obsY !== start.y &&
          obsX !== end.x &&
          obsY !== end.y &&
          !obstacleSet.has(`${obsX},${obsY}`)
        ) {
          obstacles.push({ x: obsX, y: obsY });
          obstacleSet.add(`${obsX},${obsY}`);
        }
      }

      // 3. Fill remaining obstacles randomly (but not too close to start)
      let randomAttempts = 0;
      while (obstacles.length < cappedObstacleCount && randomAttempts < 100) {
        randomAttempts++;
        const obs = { x: Math.floor(rng() * gridSize), y: Math.floor(rng() * gridSize) };
        const distFromStart = Math.abs(obs.x - start.x) + Math.abs(obs.y - start.y);
        const isStart = obs.x === start.x && obs.y === start.y;
        const isEnd = obs.x === end.x && obs.y === end.y;
        const exists = obstacleSet.has(`${obs.x},${obs.y}`);

        // Don't place obstacles too close to start (at least 2 cells away)
        if (!isStart && !isEnd && !exists && distFromStart >= 2) {
          obstacles.push(obs);
          obstacleSet.add(`${obs.x},${obs.y}`);
        }
      }

      // Verify path exists and has reasonable complexity
      const pathResult = findShortestPath([start.x, start.y], [end.x, end.y], obstacleSet);
      if (!pathResult) {
        continue;
      }
      if (!hasFreeStartNeighbor(obstacleSet)) {
        continue;
      }

      // Ensure path has minimum complexity (at least 30% longer than direct distance)
      const directDistance = Math.abs(end.x - start.x) + Math.abs(end.y - start.y);
      const pathComplexity = pathResult.length / Math.max(1, directDistance);
      if (pathComplexity < 1.3 && level > 2) {
        // Path is too simple, try again
        continue;
      }

      optimalMoves = pathResult.length;
      path = pathResult.path;
      break;
    }

    // Fallback if we couldn't generate a good puzzle
    if (path.length === 0) {
      obstacles = [];
      const fallbackPath = findShortestPath([start.x, start.y], [end.x, end.y], new Set());
      if (fallbackPath) {
        optimalMoves = fallbackPath.length;
        path = fallbackPath.path;
      } else {
        optimalMoves = Math.abs(end.x - start.x) + Math.abs(end.y - start.y);
      }
    }

    const coalIndex = Math.min(
      Math.max(1, Math.floor(path.length / 2)),
      Math.max(1, path.length - 2),
    );
    const coalPos = path.length >= 3 ? path[coalIndex] : null;

    // Build grid
    const grid: number[][] = Array.from(
      { length: gridSize },
      () => Array(gridSize).fill(0) as number[],
    );
    for (const obs of obstacles) {
      const row = grid[obs.y];
      if (row) {
        row[obs.x] = 1;
      }
    }

    // Generate correct path (simplified - just store instructions)
    const correctPath: string[] = [];
    const optionCommands = ['UP', 'DOWN', 'LEFT', 'RIGHT', 'FORWARD', 'TURN_LEFT', 'TURN_RIGHT'];

    // Calculate max commands based on optimal path + buffer for mistakes
    const commandBuffer = level <= 3 ? 2 : level <= 8 ? 3 : 4;
    const maxCommands = Math.max(optimalMoves + commandBuffer, Math.floor(gridSize * 1.2));

    return {
      type: 'robo_path',
      grid,
      gridSize,
      start: [start.x, start.y],
      goal: [end.x, end.y],
      obstacles: obstacles.map((o) => [o.x, o.y] as [number, number]),
      correctPath,
      options: optionCommands,
      maxCommands,
      optimalMoves,
      coal: coalPos ? [coalPos[0], coalPos[1]] : undefined,
      uid: uid(rng),
    };
  },

  syllable_builder: (level: number, rng: RngFunction = Math.random): SyllableBuilderProblem => {
    const locale = getLocale();
    const words = getPackItemsForLocale<SyllableWord>(LANGUAGE_SYLLABIFICATION_SKILL.id, locale);
    const filtered = getSyllableWordsForLevel(words, 'starter', level);
    const wordObj = getRandom(filtered, rng);
    if (!wordObj) {
      throw new Error('No word found for syllable_builder game');
    }
    const syllables = wordObj.syllables;
    const shuffled = syllables
      .map((text, i) => ({
        text,
        id: `syl-${i}-${uid(rng)}`,
      }))
      .sort(() => rng() - 0.5);

    return {
      type: 'syllable_builder',
      target: syllables.join(''),
      emoji: wordObj.emoji,
      syllables,
      shuffled,
      uid: uid(rng),
    };
  },

  time_match: generateTimeMatch,

  unit_conversion: generateUnitConversion,

  compare_sizes: generateCompareSizes,

  star_mapper: (level: number, rng: RngFunction = Math.random): StarMapperProblem => {
    const effectiveLevel = level;

    // Difficulty pool by effective level: easy (1–3) → 8 constellations, medium (4–6) → 15, hard (7+) → 16
    const STAR_MAPPER_EASY_MAX = 3;
    const STAR_MAPPER_MEDIUM_MAX = 6;
    const difficulty: 'easy' | 'medium' | 'hard' =
      effectiveLevel <= STAR_MAPPER_EASY_MAX
        ? 'easy'
        : effectiveLevel <= STAR_MAPPER_MEDIUM_MAX
          ? 'medium'
          : 'hard';

    // Mode by effective level: trace 1–2, build 3–5, identify 6–8, expert 9+
    const STAR_MAPPER_TRACE_MAX = 2;
    const STAR_MAPPER_BUILD_MAX = 5;
    const STAR_MAPPER_IDENTIFY_MAX = 8;
    const mode =
      effectiveLevel <= STAR_MAPPER_TRACE_MAX
        ? 'trace'
        : effectiveLevel <= STAR_MAPPER_BUILD_MAX
          ? 'build'
          : effectiveLevel <= STAR_MAPPER_IDENTIFY_MAX
            ? 'identify'
            : 'expert';

    const allConstellations = getPackItems<Constellation>(ASTRONOMY_VISIBLE_FROM_ESTONIA_PACK.id);
    const pool = getConstellationsForLevel(allConstellations, difficulty);
    const picked = getRandom(pool, rng);
    const constellation = picked ?? pool[0];
    if (!constellation) {
      throw new Error('Star Mapper: no constellations available for difficulty ' + difficulty);
    }

    // Generate distractor stars for expert mode
    const distractorStars: Star[] =
      mode === 'expert' ? generateDistractorStars(constellation, rng, effectiveLevel) : [];

    // Generate options for identify mode
    const options =
      mode === 'identify'
        ? generateIdentifyOptions(allConstellations, constellation, rng)
        : undefined;

    return {
      type: 'star_mapper',
      uid: uid(rng),
      mode,
      constellation,
      distractorStars,
      showGuide: mode === 'trace',
      options,
      correctAnswer: constellation.id,
      playerLines: [],
    };
  },

  /**
   * Shape Shift Generator
   * Generates geometric puzzle problems with different modes based on level
   */
  shape_shift: (
    level: number,
    rng: RngFunction = Math.random,
    context: GeneratorContext = {},
  ): ShapeShiftProblem => {
    // Select mode based on level
    const mode = level <= 3 ? 'match' : level <= 6 ? 'rotate' : level <= 10 ? 'build' : 'expert';

    // Select difficulty based on level
    const difficulty = level <= 3 ? 'easy' : level <= 7 ? 'medium' : 'hard';

    const puzzles = getPackItems<Puzzle>(SHAPE_SHIFT_PUZZLES_PACK.id);
    const suitablePuzzles = puzzles.filter((p) => p.difficulty === difficulty);
    if (suitablePuzzles.length === 0) {
      throw new Error(`Shape Shift: no puzzles available for difficulty ${difficulty}`);
    }
    const persistentAvoidIds = new Set(context.avoidContentIds ?? []);

    // Smart Shuffle: Avoid recently played puzzles
    // @ts-expect-error -- dynamic property on globalThis for session-scoped history
    if (!globalThis._shapeShiftHistory) globalThis._shapeShiftHistory = [];
    // @ts-expect-error -- dynamic property on globalThis for session-scoped history
    let history = globalThis._shapeShiftHistory as string[];

    // Prefer persisted fresh content, then avoid the current session inside
    // that pool. If persisted history is exhausted, fall back to session-only
    // avoidance so the just-solved puzzle does not look stuck on screen.
    let sessionAvailablePuzzles = suitablePuzzles.filter((p) => !history.includes(p.id));
    if (sessionAvailablePuzzles.length === 0) {
      // @ts-expect-error -- dynamic property on globalThis for session-scoped history
      globalThis._shapeShiftHistory = history.filter(
        (id) => !suitablePuzzles.find((p) => p.id === id),
      );
      // @ts-expect-error -- dynamic property on globalThis for session-scoped history
      history = globalThis._shapeShiftHistory as string[];
      sessionAvailablePuzzles = suitablePuzzles;
    }
    const persistedFreshPuzzles = suitablePuzzles.filter((p) => !persistentAvoidIds.has(p.id));
    const freshSessionAvailablePuzzles = persistedFreshPuzzles.filter(
      (p) => !history.includes(p.id),
    );
    const pool =
      freshSessionAvailablePuzzles.length > 0
        ? freshSessionAvailablePuzzles
        : persistedFreshPuzzles.length > 0
          ? persistedFreshPuzzles
          : sessionAvailablePuzzles;

    const puzzleIndex = Math.floor(rng() * pool.length);
    const puzzle = (pool[puzzleIndex] ?? puzzles[0])!;

    // Add to history
    history.push(puzzle.id);
    if (history.length > 20) history.shift();

    // Helper to generate random rotation
    const randomRotation = (): number => {
      return [0, 90, 180, 270][Math.floor(rng() * 4)] || 0;
    };

    // Helper to shuffle array
    const shuffleArray = <T>(array: T[]): T[] => {
      const result = [...array];
      for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [result[i], result[j]] = [result[j]!, result[i]!];
      }
      return result;
    };

    // Helper to generate decoy piece
    const generateDecoyPiece = (): PieceState => {
      const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
      const types: ShapeType[] = ['triangle', 'square', 'diamond', 'circle'];
      const sourcePiece = puzzle.pieces[Math.floor(rng() * puzzle.pieces.length)];
      const fallbackSize = Math.max(16, Math.round(puzzle.gridSize * 0.22));
      const size = sourcePiece?.size ?? fallbackSize;

      return {
        id: 'decoy',
        type: types[Math.floor(rng() * types.length)] || 'square',
        color: colors[Math.floor(rng() * colors.length)] || 'gray',
        size,
        width: sourcePiece?.width,
        height: sourcePiece?.height,
        correctPosition: { x: -1, y: -1 },
        correctRotation: 0,
        isDecoy: true,
        currentPosition: null,
        currentRotation: randomRotation(),
      };
    };

    // Prepare piece states
    const pieces: PieceState[] = puzzle.pieces.map((p) => ({
      ...p,
      currentPosition: null,
      currentRotation: mode === 'match' ? p.correctRotation : randomRotation(),
    }));

    // For expert mode, add a decoy piece
    if (mode === 'expert') {
      pieces.push(generateDecoyPiece());
    }

    // Shuffle pieces in tray
    const shuffledPieces = shuffleArray(pieces);

    return {
      type: 'shape_shift',
      uid: uid(rng),
      mode,
      puzzle,
      pieces: shuffledPieces,
      showHints: mode === 'match',
    };
  },

  battlelearn: (level: number, rng: RngFunction = Math.random, context): BattleLearnProblem => {
    const curriculumItems = getPackItems<BattleLearnCurriculumItem>(
      context?.contentPackId ?? MATH_BATTLELEARN_PACK.id,
    );
    const battleProfile: BattleLearnProfile = 'starter';
    const profileStage = getBattleLearnProfileStage(curriculumItems, battleProfile, level);
    const cellDistribution = getBattleLearnCellDistribution(curriculumItems);
    const gridSize = profileStage.gridSize;
    const shipLengths = [...profileStage.shipLengths];

    function buildBattleLearnCellGrid(
      size: number,
      shipList: { positions: Array<[number, number]> }[],
      rngFn: RngFunction,
    ): BattleLearnCellType[][] {
      const grid: BattleLearnCellType[][] = Array.from({ length: size }, () =>
        Array.from({ length: size }, (): BattleLearnCellType => 'empty'),
      );
      const shipSet = new Set<string>();
      for (const ship of shipList) {
        for (const [r, c] of ship.positions) {
          shipSet.add(`${r},${c}`);
        }
      }
      const nonShipCells: [number, number][] = [];
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (shipSet.has(`${r},${c}`)) {
            grid[r]![c] = 'ship';
          } else {
            nonShipCells.push([r, c]);
          }
        }
      }
      for (const [r, c] of nonShipCells) {
        const roll = rngFn();
        let sum = 0;
        let cellType: Exclude<BattleLearnCellType, 'ship'> = 'empty';
        for (const entry of cellDistribution.weights) {
          sum += entry.weight;
          if (roll < sum) {
            cellType = entry.cell;
            break;
          }
        }
        grid[r]![c] = cellType;
      }
      return grid;
    }

    const ships = placeShips(gridSize, shipLengths, rng);
    const cellGrid = buildBattleLearnCellGrid(gridSize, ships, rng);
    const question = generateBattleLearnQuestionForStage(
      curriculumItems,
      'initial',
      battleProfile,
      level,
      rng,
      gridSize,
    );
    const options = generateBattleLearnOptions(question.correctAnswer, gridSize, rng);

    const numOptions = options.length;
    const correctIndex = Math.floor(rng() * numOptions);
    const shuffledOptions = shuffleOptionsWithCorrect(
      options,
      question.correctAnswer,
      correctIndex,
      rng,
    );

    return {
      type: 'battlelearn',
      uid: uid(rng),
      gridSize,
      cellGrid,
      ships,
      revealed: [],
      hits: [],
      sunkShips: [],
      shotAvailable: false,
      question: {
        prompt: question.prompt,
        options: shuffledOptions,
        correctIndex,
      },
      gameWon: false,
    };
  },

  shape_dash: (
    level: number,
    rng: RngFunction = Math.random,
    context: GeneratorContext = {},
  ): ShapeDashProblem => {
    const effectiveLevel = Math.max(1, level);

    // Base scroll speed and run length scale with level. Early levels should
    // teach the rhythm before they ask for fast gate reads and dense jumps.
    const baseSpeed = 96 + effectiveLevel * 14;
    const scrollSpeed = Math.min(250, baseSpeed);
    const runLength = 2850 + effectiveLevel * 300;

    const locale = getLocale();
    const lang = locale === 'et' ? 'et' : 'en';
    const geometryItems = getPackItems<ShapeDashGeometryItem>(MATH_GEOMETRY_SHAPES_PACK.id);
    const questionBank = getShapeDashCheckpointQuestions(geometryItems);
    const shapeGateBank = getShapeDashGateQuestions(geometryItems);
    const persistentAvoidIds = new Set(context.avoidContentIds ?? []);
    const pickPackItems = <T extends { id: string }>(items: readonly T[], count: number): T[] => {
      const fresh = [...items].filter((item) => !persistentAvoidIds.has(item.id));
      const freshShuffled = fresh.sort(() => rng() - 0.5);
      const fallback = [...items]
        .filter((item) => !freshShuffled.some((selected) => selected.id === item.id))
        .sort(() => rng() - 0.5);

      return [...freshShuffled, ...fallback].slice(0, count);
    };

    let obstacles: ShapeDashObstacle[] = [];
    const numObstacles = 4 + Math.floor(effectiveLevel * 1.15);
    const numCheckpoints = Math.min(2, 1 + Math.floor(effectiveLevel / 4));

    // Difficulty scales with level: fewer “easy” first obstacles, slightly tighter gaps at higher levels
    const minGap = getMinObstacleGap(scrollSpeed);
    const firstObstaclesCount = Math.max(3, 7 - effectiveLevel);
    const firstLandingMargin = Math.max(120, 180 - effectiveLevel * 12);
    const firstMinGap = getMinObstacleGap(scrollSpeed, firstLandingMargin);
    const gapVariation = Math.max(40, 100 - effectiveLevel * 8);
    const runInDistance = 880;
    const firstGateDistance = runInDistance + 740;
    const endObstaclePadding = 360;
    const clearAfterCheckpoint = 200;
    const checkpointLeadIn = 60;

    let lastX = runInDistance;

    const obstacleTypes: Array<'spike' | 'block' | 'circle' | 'floating'> = [
      'spike',
      'block',
      'circle',
      'floating',
    ];
    const harderBias = Math.min(0.5, effectiveLevel * 0.08);
    for (let i = 0; i < numObstacles; i++) {
      const useGenerousGap = i < firstObstaclesCount;
      const baseGap = useGenerousGap ? firstMinGap : minGap;
      const gap = baseGap + Math.floor(rng() * gapVariation);
      lastX += gap;
      if (lastX > runLength - endObstaclePadding) break;

      let type: 'spike' | 'block' | 'circle' | 'floating';
      if (effectiveLevel <= 2) {
        type = 'spike';
      } else if (rng() < harderBias) {
        type = rng() > 0.5 ? 'circle' : 'floating';
      } else {
        type = obstacleTypes[Math.floor(rng() * obstacleTypes.length)]!;
      }
      if (type === 'spike') {
        obstacles.push({ id: `obs-${uid(rng)}`, x: lastX, type: 'spike' });
      } else if (type === 'block') {
        obstacles.push({
          id: `obs-${uid(rng)}`,
          x: lastX,
          type: 'block',
          height: 32 + Math.floor(rng() * 24),
        });
      } else if (type === 'circle') {
        obstacles.push({
          id: `obs-${uid(rng)}`,
          x: lastX,
          type: 'circle',
          radius: 16 + Math.floor(rng() * 6),
          offsetY: effectiveLevel <= 2 ? 0 : rng() > 0.6 ? 20 + Math.floor(rng() * 25) : 0,
        });
      } else {
        obstacles.push({
          id: `obs-${uid(rng)}`,
          x: lastX,
          type: 'floating',
          height: 28 + Math.floor(rng() * 16),
          offsetY: 40 + Math.floor(rng() * 50),
        });
      }
    }

    const obstacleWidth = (o: ShapeDashObstacle) =>
      o.type === 'circle' ? 2 * (o.radius ?? 18) : SPIKE_WIDTH;
    const obstacleCenterX = (o: ShapeDashObstacle) => o.x + obstacleWidth(o) / 2;

    // Place checkpoints only in safe zones: after an obstacle, with no obstacle for clearAfterCheckpoint px after the checkpoint.
    const checkpoints: ShapeDashCheckpoint[] = [];
    const safeZones: { start: number; end: number }[] = [];
    for (let i = 0; i < obstacles.length - 1; i++) {
      const gapStart = obstacles[i]!.x + obstacleWidth(obstacles[i]!) + checkpointLeadIn;
      const nextObsX = obstacles[i + 1]!.x;
      const gapEnd = nextObsX - clearAfterCheckpoint;
      if (gapEnd > gapStart + 40) {
        safeZones.push({ start: gapStart, end: gapEnd });
      }
    }
    const selectedCheckpointBank = pickPackItems(questionBank, numCheckpoints);
    const numToPlace = Math.min(numCheckpoints, safeZones.length, selectedCheckpointBank.length);
    const zoneOrder = safeZones
      .map((_, i) => i)
      .sort((a, b) => safeZones[a]!.start - safeZones[b]!.start);
    for (let c = 0; c < numToPlace; c++) {
      const zoneIdx = zoneOrder[c]!;
      const zone = safeZones[zoneIdx]!;
      const x = Math.floor(zone.start + rng() * Math.max(0, zone.end - zone.start - 40));
      const q = selectedCheckpointBank[c]!;
      const prompt = q.prompt[lang];
      const localizedOptions = q.options[lang];
      const options = [...localizedOptions].sort(() => rng() - 0.5);
      const correctIndex = options.indexOf(localizedOptions[q.correctIndex]!);
      const safeCorrectIndex = correctIndex >= 0 ? correctIndex : 0;
      checkpoints.push({
        id: `cp-${uid(rng)}`,
        x,
        contentItemId: q.id,
        question: { prompt, options, correctIndex: safeCorrectIndex },
      });
    }
    checkpoints.sort((a, b) => a.x - b.x);

    // V4: Generate shape gates (3 per run, ~every 30% of run length)
    const shapeGates: ShapeDashShapeGate[] = [];
    const numShapeGates = effectiveLevel <= 2 ? 2 : 3;
    const selectedGateBank = pickPackItems(shapeGateBank, numShapeGates);

    // Define constants for gate positioning
    const GATE_CLEAR_DISTANCE = 260; // Prefer a clear corridor for choosing by jump height.
    const GATE_FALLBACK_CLEAR_DISTANCE = 150; // Keep at least this much room if the run is dense.
    const MAX_REPOSITION_ATTEMPTS = 14; // Max attempts to find valid position
    const REPOSITION_STEP_SIZE = 80; // Step size for repositioning attempts
    const END_GATE_PADDING = 300; // Padding from run end

    for (let g = 0; g < numShapeGates && g < selectedGateBank.length; g++) {
      const segment = (runLength - firstGateDistance - END_GATE_PADDING) / numShapeGates;
      let x = firstGateDistance + g * segment;
      const gateData = selectedGateBank[g]!;

      const isGateTooClose = (candidateX: number, minDistance: number) =>
        obstacles.some((obs) => Math.abs(obstacleCenterX(obs) - candidateX) < minDistance) ||
        checkpoints.some((cp) => Math.abs(cp.x - candidateX) < minDistance) ||
        shapeGates.some((gate) => Math.abs(gate.x - candidateX) < minDistance + GATE_WIDTH);

      const findGatePosition = (minDistance: number): number | null => {
        let candidateX = x;
        for (let attempt = 0; attempt < MAX_REPOSITION_ATTEMPTS; attempt++) {
          if (!isGateTooClose(candidateX, minDistance)) return candidateX;

          const offset = (attempt + 1) * REPOSITION_STEP_SIZE * (attempt % 2 === 0 ? 1 : -1);
          candidateX = firstGateDistance + g * segment + offset;
          candidateX = Math.max(
            firstGateDistance,
            Math.min(candidateX, runLength - END_GATE_PADDING),
          );
        }
        return null;
      };

      // Try to find a valid position for the gate. Prefer a very clear corridor,
      // but allow a slightly denser run rather than removing all gates.
      const positionedX =
        findGatePosition(GATE_CLEAR_DISTANCE) ?? findGatePosition(GATE_FALLBACK_CLEAR_DISTANCE);
      x = positionedX ?? x;

      // If a dense seed still leaves no ideal gate corridor, keep the curriculum
      // item and clear the nearby procedural hazards instead of dropping the gate.
      obstacles = obstacles.filter(
        (obs) => Math.abs(obstacleCenterX(obs) - x) >= GATE_FALLBACK_CLEAR_DISTANCE,
      );
      for (let i = checkpoints.length - 1; i >= 0; i--) {
        if (Math.abs(checkpoints[i]!.x - x) < GATE_FALLBACK_CLEAR_DISTANCE) {
          checkpoints.splice(i, 1);
        }
      }

      // Generate 3 shape options: correct + 2 random wrong
      const allShapes: ShapeDashGateShape[] = [
        'triangle',
        'square',
        'pentagon',
        'hexagon',
        'circle',
      ];
      const wrongShapes = allShapes.filter((s) => s !== gateData.correctShape);
      const shuffledWrong = [...wrongShapes].sort(() => rng() - 0.5);

      const correctShape = {
        type: gateData.correctShape,
        label: getShapeDashShapeLabel(gateData.correctShape, lang),
        isCorrect: true,
      };
      const wrongShapeOptions = [
        {
          type: shuffledWrong[0]!,
          label: getShapeDashShapeLabel(shuffledWrong[0]!, lang),
          isCorrect: false,
        },
        {
          type: shuffledWrong[1]!,
          label: getShapeDashShapeLabel(shuffledWrong[1]!, lang),
          isCorrect: false,
        },
      ].sort(() => rng() - 0.5);

      const shapes = [correctShape, ...wrongShapeOptions].sort(() => rng() - 0.5);
      if (effectiveLevel <= 2) {
        const earlyCorrectLane = g === 0 ? 2 : 1; // First gate on ground, second with a normal jump.
        shapes.splice(shapes.indexOf(correctShape), 1);
        shapes.splice(earlyCorrectLane, 0, correctShape);
      }

      shapeGates.push({
        id: `gate-${uid(rng)}`,
        x,
        contentItemId: gateData.id,
        prompt: gateData.prompt[lang],
        shapes,
      });
    }
    shapeGates.sort((a, b) => a.x - b.x);
    if (effectiveLevel <= 2) {
      shapeGates.forEach((gate, index) => {
        const targetLane = index === 0 ? 2 : 1;
        const currentLane = gate.shapes.findIndex((shape) => shape.isCorrect);
        if (currentLane < 0 || currentLane === targetLane) return;
        const [correctShape] = gate.shapes.splice(currentLane, 1);
        if (correctShape) gate.shapes.splice(targetLane, 0, correctShape);
      });
    }

    type SafeSegment = { start: number; end: number };

    const gameplayStartX = runInDistance + 120;
    const gameplayEndX = runLength - 260;
    const clampZone = (zone: SafeSegment): SafeSegment => ({
      start: Math.max(gameplayStartX, zone.start),
      end: Math.min(gameplayEndX, zone.end),
    });
    const makeCenterZone = (centerX: number, radius: number): SafeSegment =>
      clampZone({ start: centerX - radius, end: centerX + radius });

    const baseForbiddenZones: SafeSegment[] = [
      ...obstacles.map((obs) => makeCenterZone(obstacleCenterX(obs), 108)),
      ...checkpoints.map((cp) => makeCenterZone(cp.x, 120)),
      ...shapeGates.map((gate) => makeCenterZone(gate.x, 210)),
    ];

    const buildSafeSegments = (zones: SafeSegment[], minWidth: number): SafeSegment[] => {
      const sortedZones = zones
        .map(clampZone)
        .filter((zone) => zone.end > zone.start)
        .sort((a, b) => a.start - b.start);
      const segments: SafeSegment[] = [];
      let cursor = gameplayStartX;

      for (const zone of sortedZones) {
        if (zone.start - cursor >= minWidth) {
          segments.push({ start: cursor, end: zone.start });
        }
        cursor = Math.max(cursor, zone.end);
      }

      if (gameplayEndX - cursor >= minWidth) {
        segments.push({ start: cursor, end: gameplayEndX });
      }

      return segments;
    };

    const pickXFromSegments = (
      segments: SafeSegment[],
      usedX: number[],
      minSpacing: number,
      edgePadding: number,
    ): number | null => {
      const eligibleSegments = segments.filter(
        (segment) => segment.end - segment.start > edgePadding * 2,
      );
      if (eligibleSegments.length === 0) return null;

      for (let attempt = 0; attempt < 80; attempt++) {
        const totalWidth = eligibleSegments.reduce(
          (sum, segment) => sum + (segment.end - segment.start - edgePadding * 2),
          0,
        );
        let pick = rng() * totalWidth;
        let selected = eligibleSegments[0]!;

        for (const segment of eligibleSegments) {
          const width = segment.end - segment.start - edgePadding * 2;
          if (pick <= width) {
            selected = segment;
            break;
          }
          pick -= width;
        }

        const availableWidth = selected.end - selected.start - edgePadding * 2;
        const x = Math.floor(selected.start + edgePadding + rng() * availableWidth);
        if (usedX.every((used) => Math.abs(used - x) >= minSpacing)) return x;
      }

      return null;
    };

    // V3: Generate stars in clear, reachable lanes.
    const stars: ShapeDashStar[] = [];
    const STARS_PER_LEVEL_SCALING = 0.3; // Additional stars per level (0.3 = 1 star every ~3 levels)
    const numStars = 3 + Math.floor(effectiveLevel * STARS_PER_LEVEL_SCALING);
    const starHeights = [24, 84, 124, 164]; // run, low jump, high jump, double-jump lanes
    const starSegments = buildSafeSegments(baseForbiddenZones, 96);
    const fallbackStarSegments = buildSafeSegments(baseForbiddenZones, 56);

    for (let s = 0; s < numStars; s++) {
      const usedStarX = stars.map((star) => star.x);
      const x =
        pickXFromSegments(starSegments, usedStarX, 170, 32) ??
        pickXFromSegments(fallbackStarSegments, usedStarX, 120, 20);
      if (x === null) break;

      const laneOffset = Math.floor(rng() * starHeights.length);
      const y = starHeights[(s + laneOffset) % starHeights.length]!;
      stars.push({ id: `star-${uid(rng)}`, x, y });
    }

    // V3: Generate jump pads in clear ground sections.
    const jumpPads: ShapeDashJumpPad[] = [];
    if (effectiveLevel >= 4) {
      const numJumpPads = effectiveLevel >= 8 ? 2 : 1;
      const jumpPadForbiddenZones = [
        ...baseForbiddenZones,
        ...stars.map((star) => makeCenterZone(star.x, 90)),
      ];
      const jumpPadSegments = buildSafeSegments(jumpPadForbiddenZones, 180);

      for (let j = 0; j < numJumpPads; j++) {
        const x = pickXFromSegments(
          jumpPadSegments,
          jumpPads.map((pad) => pad.x),
          520,
          24,
        );
        if (x !== null) {
          jumpPads.push({ id: `pad-${uid(rng)}`, x });
        }
      }
    }

    // V3: Generate boost zones only in long clear corridors.
    const boostZones: ShapeDashBoostZone[] = [];
    if (effectiveLevel >= 3) {
      const numBoosts = 1 + Math.floor(effectiveLevel / 5);
      const boostForbiddenZones = [
        ...baseForbiddenZones,
        ...stars.map((star) => makeCenterZone(star.x, 90)),
        ...jumpPads.map((pad) => makeCenterZone(pad.x, 120)),
      ];

      for (let b = 0; b < numBoosts; b++) {
        const width = 170 + Math.floor(rng() * 40);
        const boostSegments = buildSafeSegments(boostForbiddenZones, width + 80);
        const usedBoostX = boostZones.map((zone) => zone.x + zone.width / 2);
        const centerX = pickXFromSegments(boostSegments, usedBoostX, 520, width / 2 + 24);

        if (centerX !== null) {
          boostZones.push({ id: `boost-${uid(rng)}`, x: Math.floor(centerX - width / 2), width });
        }
      }
    }

    // V4: Generate terrain segments (varied heights for visual interest)
    const terrainSegments: ShapeDashTerrainSegment[] = [];
    const numSegments = 8 + Math.floor(effectiveLevel * 0.5);
    const segmentWidth = runLength / numSegments;
    const themes: Array<'cave' | 'sky' | 'neon' | 'default'> = ['cave', 'sky', 'neon', 'default'];

    for (let s = 0; s < numSegments; s++) {
      const x = s * segmentWidth;
      const types: Array<'flat' | 'raised' | 'gap' | 'ramp'> = ['flat', 'flat', 'raised', 'ramp']; // Bias toward flat
      const type = types[Math.floor(rng() * types.length)]!;
      const height = type === 'raised' ? 20 + Math.floor(rng() * 30) : 0;
      const theme = themes[Math.floor(s / 3) % themes.length]!; // Change theme every 3 segments

      terrainSegments.push({
        id: `terrain-${uid(rng)}`,
        x,
        width: segmentWidth,
        height,
        type,
        theme,
      });
    }

    return {
      type: 'shape_dash',
      uid: uid(rng),
      obstacles,
      checkpoints,
      scrollSpeed,
      runLength,
      stars,
      jumpPads,
      boostZones,
      shapeGates,
      terrainSegments,
      contentItemIds: [
        ...checkpoints
          .map((checkpoint) => checkpoint.contentItemId)
          .filter((id): id is string => Boolean(id)),
        ...shapeGates.map((gate) => gate.contentItemId).filter((id): id is string => Boolean(id)),
      ],
    };
  },
};

/**
 * Helper function to generate distractor stars for expert mode
 *
 * Creates dim background stars that are not part of the constellation
 * to increase difficulty. Number of distractors increases with level.
 *
 * @param constellation - The target constellation (unused, for future positioning logic)
 * @param rng - Random number generator for consistent results
 * @param level - Player level (determines number of distractors: level/3, max 3)
 * @returns Array of distractor stars with magnitude 4-6 (dimmer than constellation stars)
 */
function generateDistractorStars(
  _constellation: Constellation,
  rng: RngFunction,
  level: number,
): Star[] {
  const numDistractors = Math.min(3, Math.floor(level / 3)); // 1-3 distractor stars
  const distractors: Star[] = [];

  for (let i = 0; i < numDistractors; i++) {
    distractors.push({
      id: `distractor_${i}`,
      x: rng() * 100,
      y: rng() * 100,
      magnitude: 4 + rng() * 2, // Dim stars (magnitude 4-6)
    });
  }

  return distractors;
}

/**
 * Helper function to generate identify mode options
 * Returns 4 constellation IDs: 1 correct + 3 wrong options
 */
function generateIdentifyOptions(
  pool: readonly Constellation[],
  correct: Constellation,
  rng: RngFunction,
): string[] {
  // Get wrong options from other constellations
  const allConstellations = pool.filter((c: Constellation) => c.id !== correct.id);

  // Fisher-Yates shuffle
  const shuffled = [...allConstellations];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }

  // Pick 3 wrong options
  const options: string[] = [correct.id];
  for (let i = 0; i < Math.min(3, shuffled.length); i++) {
    options.push(shuffled[i]!.id);
  }

  // Ensure we have 4 options - if not enough constellations, repeat some
  while (options.length < 4 && allConstellations.length > 0) {
    const extra = getRandom(allConstellations, rng);
    if (extra) options.push(extra.id);
    else break;
  }

  // Fisher-Yates shuffle final options
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [options[i], options[j]] = [options[j]!, options[i]!];
  }

  return options;
}

// BattleLearn question generators live in their own file; re-export the
// public entry so existing import paths keep working.
export { generateBattleLearnQuestion } from './battlelearnQuestions';
