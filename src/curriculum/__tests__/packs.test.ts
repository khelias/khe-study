import { describe, it, expect } from 'vitest';

import '../index'; // side-effect registration
import { contentPackRegistry, getPackItems, getPackItemsForLocale, skillRegistry } from '../index';
import {
  ASTRONOMY_VISIBLE_FROM_ESTONIA_PACK,
  getConstellationById,
  getConstellationsByDifficulty,
  getConstellationsForLevel,
} from '../packs/astronomy/visibleFromEstonia';
import { ASTRONOMY_VISIBLE_CONSTELLATIONS_SKILL } from '../skills/astronomy';
import {
  LANGUAGE_LONG_VOCABULARY_SKILL,
  LANGUAGE_SPATIAL_SENTENCES_SKILL,
  LANGUAGE_SYLLABIFICATION_SKILL,
  LANGUAGE_VOCABULARY_SKILL,
} from '../skills/language';
import { LANGUAGE_SYLLABIFICATION_ET_PACK } from '../packs/language/syllables_et';
import { LANGUAGE_SYLLABIFICATION_EN_PACK } from '../packs/language/syllables_en';
import { getSyllableWordsForLevel } from '../packs/language/types';
import type { SyllableWord, VocabularyWord } from '../packs/language/types';
import {
  LANGUAGE_SPATIAL_SENTENCES_PACK,
  generateSentence,
  getSpatialSentenceScenesForLevel,
} from '../packs/language/spatialSentences';
import {
  getVocabularyWordsAvailableForLevel,
  getVocabularyWordsForLength,
  getVocabularyWordsForLevel,
  groupWordsByLength,
  LANGUAGE_LONG_VOCABULARY_EN_PACK,
  LANGUAGE_LONG_VOCABULARY_ET_PACK,
  LANGUAGE_VOCABULARY_EN_PACK,
  LANGUAGE_VOCABULARY_ET_PACK,
} from '../packs/language/vocabulary';
import {
  MATH_ADDITION_WITHIN_20_SKILL,
  MATH_ADDITION_WITHIN_100_SKILL,
  MATH_SUBTRACTION_WITHIN_20_SKILL,
  MATH_SUBTRACTION_WITHIN_100_SKILL,
  MATH_MULTIPLICATION_1_TO_5_SKILL,
  MATH_MULTIPLICATION_1_TO_10_SKILL,
  MATH_GEOMETRY_SHAPES_SPATIAL_SKILL,
  MATH_GEOMETRY_SHAPES_VERBAL_SKILL,
  MATH_PATTERN_SEQUENCES_SKILL,
  MATH_UNIT_CONVERSIONS_SKILL,
  MATH_COMPARE_NUMBERS_SKILL,
  MATH_TIME_READING_SKILL,
  MATH_BALANCE_EQUATIONS_SKILL,
  MATH_ADDITION_MEMORY_SKILL,
  MATH_GRID_NAVIGATION_SKILL,
  MATH_MIXED_PROBLEM_SOLVING_SKILL,
} from '../skills/math';
import { MATH_ADDITION_WITHIN_20_PACK } from '../packs/math/addition_within_20';
import { MATH_ADDITION_WITHIN_100_PACK } from '../packs/math/addition_within_100';
import { MATH_SUBTRACTION_WITHIN_20_PACK } from '../packs/math/subtraction_within_20';
import { MATH_SUBTRACTION_WITHIN_100_PACK } from '../packs/math/subtraction_within_100';
import { MATH_MULTIPLICATION_1_5_PACK } from '../packs/math/multiplication_1_5';
import { MATH_MULTIPLICATION_1_10_PACK } from '../packs/math/multiplication_1_10';
import {
  MATH_GEOMETRY_SHAPES_PACK,
  getShapeDashCheckpointQuestions,
  getShapeDashGateQuestions,
  getShapeDashShapeLabel,
} from '../packs/math/geometry_shapes';
import {
  MATH_PATTERN_SEQUENCES_PACK,
  getPatternTemplates,
  getPatternTemplatesForLevel,
  getPatternThemes,
} from '../packs/math/pattern_sequences';
import {
  MATH_UNIT_CONVERSIONS_PACK,
  getUnitConversionItems,
  getUnitConversionStage,
  getUnitConversionsByCategory,
} from '../packs/math/unit_conversions';
import { MATH_COMPARE_NUMBERS_PACK, getCompareNumberStage } from '../packs/math/compare_numbers';
import { MATH_TIME_READING_PACK, getTimeReadingStage } from '../packs/math/time_reading';
import {
  MATH_BALANCE_EQUATIONS_PACK,
  getBalanceEquationProgression,
} from '../packs/math/balance_equations';
import { MATH_ADDITION_MEMORY_PACK, getMemoryMathProgression } from '../packs/math/addition_memory';
import {
  MATH_GRID_NAVIGATION_PACK,
  getRoboPathGridSize,
  getRoboPathObstacleStage,
  getRoboPathSettings,
} from '../packs/math/grid_navigation';
import {
  MATH_BATTLELEARN_PACK,
  MATH_BATTLELEARN_MULTIPLICATION_PACK,
  MATH_BATTLELEARN_MULTIPLICATION_1_5_PACK,
  getBattleLearnCellDistribution,
  getBattleLearnCountObjectLabels,
  getBattleLearnMultiplicationFactStage,
  getBattleLearnProfileStage,
  getBattleLearnQuestionStage,
  getBattleLearnSequencePatterns,
} from '../packs/math/battlelearn';
import { SHAPE_SHIFT_PUZZLES_PACK } from '../packs/geometry/shapeShiftPuzzles';
import { getPieceGridDimensions, pieceInBounds } from '../../engine/shapeShiftGrid';
import type { Constellation } from '../../types/game';

describe('curriculum', () => {
  describe('registry', () => {
    it('registers the astronomy skill on import', () => {
      expect(skillRegistry.has(ASTRONOMY_VISIBLE_CONSTELLATIONS_SKILL.id)).toBe(true);
    });

    it('registers the astronomy pack on import', () => {
      expect(contentPackRegistry.has(ASTRONOMY_VISIBLE_FROM_ESTONIA_PACK.id)).toBe(true);
    });

    it('resolves pack items by id', () => {
      const items = getPackItems<Constellation>(ASTRONOMY_VISIBLE_FROM_ESTONIA_PACK.id);
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBe(16);
    });

    it('throws for unknown pack', () => {
      expect(() => getPackItems('does.not.exist')).toThrow(/not registered/);
    });

    it('can look up packs by skill id', () => {
      const packs = contentPackRegistry.getBySkill(ASTRONOMY_VISIBLE_CONSTELLATIONS_SKILL.id);
      expect(packs).toHaveLength(1);
      expect(packs[0]?.id).toBe(ASTRONOMY_VISIBLE_FROM_ESTONIA_PACK.id);
    });

    it('resolves one pack per locale for a multi-locale skill', () => {
      const etPack = contentPackRegistry.findBySkillAndLocale(
        LANGUAGE_SYLLABIFICATION_SKILL.id,
        'et',
      );
      const enPack = contentPackRegistry.findBySkillAndLocale(
        LANGUAGE_SYLLABIFICATION_SKILL.id,
        'en',
      );
      expect(etPack?.id).toBe(LANGUAGE_SYLLABIFICATION_ET_PACK.id);
      expect(enPack?.id).toBe(LANGUAGE_SYLLABIFICATION_EN_PACK.id);
    });

    it('registers vocabulary packs per locale', () => {
      const etPack = contentPackRegistry.findBySkillAndLocale(LANGUAGE_VOCABULARY_SKILL.id, 'et');
      const enPack = contentPackRegistry.findBySkillAndLocale(LANGUAGE_VOCABULARY_SKILL.id, 'en');
      expect(etPack?.id).toBe(LANGUAGE_VOCABULARY_ET_PACK.id);
      expect(enPack?.id).toBe(LANGUAGE_VOCABULARY_EN_PACK.id);
    });

    it('registers long vocabulary packs per locale', () => {
      const etPack = contentPackRegistry.findBySkillAndLocale(
        LANGUAGE_LONG_VOCABULARY_SKILL.id,
        'et',
      );
      const enPack = contentPackRegistry.findBySkillAndLocale(
        LANGUAGE_LONG_VOCABULARY_SKILL.id,
        'en',
      );
      expect(etPack?.id).toBe(LANGUAGE_LONG_VOCABULARY_ET_PACK.id);
      expect(enPack?.id).toBe(LANGUAGE_LONG_VOCABULARY_EN_PACK.id);
    });

    it('getPackItemsForLocale returns locale-specific items', () => {
      const et = getPackItemsForLocale<SyllableWord>(LANGUAGE_SYLLABIFICATION_SKILL.id, 'et');
      const en = getPackItemsForLocale<SyllableWord>(LANGUAGE_SYLLABIFICATION_SKILL.id, 'en');
      expect(et.length).toBeGreaterThan(0);
      expect(en.length).toBeGreaterThan(0);
      expect(et).not.toBe(en);
      // Estonian words contain Estonian-only letters somewhere in the set
      const hasEstonianLetter = et.some((w) => w.syllables.some((s) => /[ÕÄÖÜŠŽ]/.test(s)));
      expect(hasEstonianLetter).toBe(true);
    });

    it('getPackItemsForLocale throws when skill has no packs', () => {
      expect(() => getPackItemsForLocale('does.not.exist', 'et')).toThrow(
        /No content pack registered/,
      );
    });
  });

  describe('astronomy pack shape', () => {
    const items = ASTRONOMY_VISIBLE_FROM_ESTONIA_PACK.items;

    it('binds to the astronomy skill', () => {
      expect(ASTRONOMY_VISIBLE_FROM_ESTONIA_PACK.skillId).toBe(
        ASTRONOMY_VISIBLE_CONSTELLATIONS_SKILL.id,
      );
    });

    it('has 8 easy, 7 medium, 1 hard constellations (16 total)', () => {
      expect(getConstellationsByDifficulty(items, 'easy')).toHaveLength(8);
      expect(getConstellationsByDifficulty(items, 'medium')).toHaveLength(7);
      expect(getConstellationsByDifficulty(items, 'hard')).toHaveLength(1);
    });

    it('getConstellationsForLevel includes easier tiers', () => {
      expect(getConstellationsForLevel(items, 'easy')).toHaveLength(8);
      expect(getConstellationsForLevel(items, 'medium')).toHaveLength(15);
      expect(getConstellationsForLevel(items, 'hard')).toHaveLength(16);
    });

    it('finds a known constellation by id', () => {
      const orion = getConstellationById(items, 'orion');
      expect(orion?.nameEn).toBe('Orion');
      expect(orion?.stars.length).toBeGreaterThan(0);
      expect(orion?.lines.length).toBeGreaterThan(0);
    });

    it('has unique constellation ids', () => {
      const ids = items.map((c) => c.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('every constellation has non-empty stars and lines', () => {
      for (const c of items) {
        expect(c.stars.length).toBeGreaterThan(0);
        expect(c.lines.length).toBeGreaterThan(0);
      }
    });
  });

  describe('syllabification packs shape', () => {
    it('both packs bind to the same skill', () => {
      expect(LANGUAGE_SYLLABIFICATION_ET_PACK.skillId).toBe(LANGUAGE_SYLLABIFICATION_SKILL.id);
      expect(LANGUAGE_SYLLABIFICATION_EN_PACK.skillId).toBe(LANGUAGE_SYLLABIFICATION_SKILL.id);
    });

    it('declare distinct locales', () => {
      expect(LANGUAGE_SYLLABIFICATION_ET_PACK.locale).toBe('et');
      expect(LANGUAGE_SYLLABIFICATION_EN_PACK.locale).toBe('en');
    });

    it('every item has at least 2 syllables and an emoji', () => {
      for (const pack of [LANGUAGE_SYLLABIFICATION_ET_PACK, LANGUAGE_SYLLABIFICATION_EN_PACK]) {
        for (const w of pack.items) {
          expect(w.syllables.length).toBeGreaterThanOrEqual(2);
          expect(w.emoji.length).toBeGreaterThan(0);
          expect(['easy', 'medium', 'hard']).toContain(w.difficulty);
          expect(w.minLevel).toBeGreaterThanOrEqual(1);
          expect(w.learningOutcome.et).not.toBe('');
          expect(w.learningOutcome.en).not.toBe('');
        }
      }
    });

    it('covers 2-, 3-, and 4-syllable words in each locale', () => {
      for (const pack of [LANGUAGE_SYLLABIFICATION_ET_PACK, LANGUAGE_SYLLABIFICATION_EN_PACK]) {
        const counts = new Set(pack.items.map((w) => w.syllables.length));
        expect(counts.has(2)).toBe(true);
        expect(counts.has(3)).toBe(true);
        expect(counts.has(4)).toBe(true);
      }
    });

    it('selects syllable words by locale, profile, and level metadata', () => {
      const starterLevel1 = getSyllableWordsForLevel(
        LANGUAGE_SYLLABIFICATION_ET_PACK.items,
        'starter',
        1,
      );
      const starterLevel3 = getSyllableWordsForLevel(
        LANGUAGE_SYLLABIFICATION_ET_PACK.items,
        'starter',
        3,
      );
      const advancedLevel2 = getSyllableWordsForLevel(
        LANGUAGE_SYLLABIFICATION_EN_PACK.items,
        'advanced',
        2,
      );

      expect(starterLevel1.every((word) => word.syllables.length === 2)).toBe(true);
      expect(starterLevel1.every((word) => word.difficulty === 'easy')).toBe(true);
      expect(starterLevel3.every((word) => word.syllables.length === 3)).toBe(true);
      expect(new Set(advancedLevel2.map((word) => word.syllables.length))).toEqual(new Set([2, 3]));
    });
  });

  describe('vocabulary packs shape', () => {
    it('both packs bind to the vocabulary skill', () => {
      expect(LANGUAGE_VOCABULARY_ET_PACK.skillId).toBe(LANGUAGE_VOCABULARY_SKILL.id);
      expect(LANGUAGE_VOCABULARY_EN_PACK.skillId).toBe(LANGUAGE_VOCABULARY_SKILL.id);
      expect(skillRegistry.has(LANGUAGE_VOCABULARY_SKILL.id)).toBe(true);
    });

    it('declare distinct locales', () => {
      expect(LANGUAGE_VOCABULARY_ET_PACK.locale).toBe('et');
      expect(LANGUAGE_VOCABULARY_EN_PACK.locale).toBe('en');
    });

    it('groups words by length for generator progression', () => {
      const et = groupWordsByLength(LANGUAGE_VOCABULARY_ET_PACK.items);
      const en = groupWordsByLength(LANGUAGE_VOCABULARY_EN_PACK.items);
      for (const db of [et, en]) {
        expect(db[3]?.length).toBeGreaterThan(0);
        expect(db[4]?.length).toBeGreaterThan(0);
        expect(db[5]?.length).toBeGreaterThan(0);
        expect(db[6]?.length).toBeGreaterThan(0);
        expect(db[7]?.length).toBeGreaterThan(0);
      }
    });

    it('annotates words with difficulty, level, and learning outcomes', () => {
      for (const pack of [LANGUAGE_VOCABULARY_ET_PACK, LANGUAGE_VOCABULARY_EN_PACK]) {
        for (const word of pack.items) {
          expect(['easy', 'medium', 'hard']).toContain(word.difficulty);
          expect(word.minLevel).toBeGreaterThanOrEqual(1);
          expect(word.learningOutcome.et).not.toBe('');
          expect(word.learningOutcome.en).not.toBe('');
        }
      }
    });

    it('keeps vocabulary words unique, uppercase, and visually anchored', () => {
      for (const pack of [LANGUAGE_VOCABULARY_ET_PACK, LANGUAGE_VOCABULARY_EN_PACK]) {
        const words = pack.items.map((word) => word.w);

        expect(new Set(words).size).toBe(words.length);
        for (const word of pack.items) {
          expect(word.w).toBe(word.w.toUpperCase());
          expect(word.e).not.toBe('');
        }
      }
    });

    it('keeps Estonian vocabulary age-appropriate and picture-pair safe', () => {
      const reviewedOutWords = new Set([
        'JOOKSMINE',
        'KAELKIRJAK',
        'KAKAO',
        'KIRJUTUS',
        'KLASS',
        'KLOTSID',
        'KORK',
        'KROKODILL',
        'LOODUS',
        'MOTORRATAS',
        'NUGA',
        'PIPAR',
        'PLOOM',
        'RIIUL',
        'SUHKUR',
        'TELEVIISOR',
        'TROLLIBUSS',
        'TÕRU',
        'VIKERKAAR',
        'VIINAMARI',
        'ÕIS',
      ]);
      const emojiToWords = new Map<string, string[]>();

      for (const word of LANGUAGE_VOCABULARY_ET_PACK.items) {
        const wordsForEmoji = emojiToWords.get(word.e) ?? [];
        wordsForEmoji.push(word.w);
        emojiToWords.set(word.e, wordsForEmoji);

        expect(word.w.length).toBeLessThanOrEqual(8);
        expect(word.w).toMatch(/^[A-ZÕÄÖÜŠŽ]+$/);
        expect(reviewedOutWords.has(word.w)).toBe(false);
      }

      const duplicateEmojiAnchors = Array.from(emojiToWords.entries())
        .filter(([, words]) => words.length > 1)
        .map(([emoji, words]) => `${emoji}:${words.join(',')}`);
      expect(duplicateEmojiAnchors).toEqual([]);
    });

    it('keeps English vocabulary age-appropriate and picture-pair safe', () => {
      const reviewedOutWords = new Set(['GARDEN', 'PIGEON', 'SPRING']);
      const emojiToWords = new Map<string, string[]>();

      for (const word of LANGUAGE_VOCABULARY_EN_PACK.items) {
        const wordsForEmoji = emojiToWords.get(word.e) ?? [];
        wordsForEmoji.push(word.w);
        emojiToWords.set(word.e, wordsForEmoji);

        expect(word.w.length).toBeLessThanOrEqual(7);
        expect(word.w).toMatch(/^[A-Z]+$/);
        expect(reviewedOutWords.has(word.w)).toBe(false);
      }

      const duplicateEmojiAnchors = Array.from(emojiToWords.entries())
        .filter(([, words]) => words.length > 1)
        .map(([emoji, words]) => `${emoji}:${words.join(',')}`);
      expect(duplicateEmojiAnchors).toEqual([]);
    });

    it('selects vocabulary words by level metadata', () => {
      const level1 = getVocabularyWordsForLevel(LANGUAGE_VOCABULARY_ET_PACK.items, 1);
      const level3 = getVocabularyWordsForLevel(LANGUAGE_VOCABULARY_ET_PACK.items, 3);
      const level10Available = getVocabularyWordsAvailableForLevel(
        LANGUAGE_VOCABULARY_ET_PACK.items,
        10,
      );

      expect(level1.every((word) => word.w.length === 3)).toBe(true);
      expect(level3.every((word) => word.w.length === 4)).toBe(true);
      expect(level10Available.some((word) => word.difficulty === 'hard')).toBe(true);
    });

    it('returns locale-specific vocabulary through registry lookup', () => {
      const et = getPackItemsForLocale<VocabularyWord>(LANGUAGE_VOCABULARY_SKILL.id, 'et');
      const en = getPackItemsForLocale<VocabularyWord>(LANGUAGE_VOCABULARY_SKILL.id, 'en');
      expect(et).toBe(LANGUAGE_VOCABULARY_ET_PACK.items);
      expect(en).toBe(LANGUAGE_VOCABULARY_EN_PACK.items);
      expect(et.some((word) => /[ÕÄÖÜŠŽ]/.test(word.w))).toBe(true);
      expect(en.every((word) => /^[A-Z]+$/.test(word.w))).toBe(true);
    });

    it('keeps long vocabulary packs scoped to longer word lengths from level 1', () => {
      for (const pack of [LANGUAGE_LONG_VOCABULARY_ET_PACK, LANGUAGE_LONG_VOCABULARY_EN_PACK]) {
        expect(pack.skillId).toBe(LANGUAGE_LONG_VOCABULARY_SKILL.id);
        expect(pack.items.length).toBeGreaterThanOrEqual(20);
        expect(pack.items.every((word) => word.w.length >= 8 && word.w.length <= 11)).toBe(true);
        expect(pack.items.every((word) => word.focus === 'longer_words')).toBe(true);
        expect(pack.items.every((word) => word.minLevel === 1)).toBe(true);

        const levelOneLongWords = getVocabularyWordsForLength(pack.items, 9, 1, {
          fallbackLengths: [10, 8],
        });
        expect(levelOneLongWords.length).toBeGreaterThan(0);
        expect(levelOneLongWords.every((word) => word.w.length >= 8)).toBe(true);
      }
    });
  });

  describe('spatial sentence pack shape', () => {
    it('binds to the spatial sentence skill and registers on import', () => {
      expect(LANGUAGE_SPATIAL_SENTENCES_PACK.skillId).toBe(LANGUAGE_SPATIAL_SENTENCES_SKILL.id);
      expect(skillRegistry.has(LANGUAGE_SPATIAL_SENTENCES_SKILL.id)).toBe(true);
      expect(contentPackRegistry.has(LANGUAGE_SPATIAL_SENTENCES_PACK.id)).toBe(true);
    });

    it('has keyed scenes with subjects, anchors, and positions', () => {
      expect(LANGUAGE_SPATIAL_SENTENCES_PACK.items.length).toBeGreaterThan(5);

      for (const scene of LANGUAGE_SPATIAL_SENTENCES_PACK.items) {
        expect(scene.id).not.toBe('');
        expect(['easy', 'medium', 'hard']).toContain(scene.difficulty);
        expect(scene.minLevel).toBeGreaterThanOrEqual(1);
        expect(scene.learningOutcome.et).not.toBe('');
        expect(scene.learningOutcome.en).not.toBe('');
        expect(scene.subjects.length).toBeGreaterThan(0);
        expect(scene.anchors.length).toBeGreaterThan(0);
        expect(scene.positions.length).toBeGreaterThan(0);
      }
    });

    it('selects spatial sentence scenes by level metadata', () => {
      const level1 = getSpatialSentenceScenesForLevel(LANGUAGE_SPATIAL_SENTENCES_PACK.items, 1);
      const level3 = getSpatialSentenceScenesForLevel(LANGUAGE_SPATIAL_SENTENCES_PACK.items, 3);
      const level6 = getSpatialSentenceScenesForLevel(LANGUAGE_SPATIAL_SENTENCES_PACK.items, 6);

      expect(level1.map((scene) => scene.id)).toEqual(['space']);
      expect(level3.map((scene) => scene.id).sort()).toEqual([
        'beach',
        'forest',
        'space',
        'street',
      ]);
      expect(level6).toHaveLength(LANGUAGE_SPATIAL_SENTENCES_PACK.items.length);
    });

    it('can generate localized sentences from scene content', () => {
      const scene = LANGUAGE_SPATIAL_SENTENCES_PACK.items[0];
      if (!scene) throw new Error('spatial sentence pack has no scenes');
      const subject = scene.subjects[0];
      const anchor = scene.anchors[0];
      const position = scene.positions[0];
      if (!subject || !anchor || !position) throw new Error('spatial scene is incomplete');

      expect(generateSentence(subject, anchor, position, 'et')).toContain(subject.n);
      expect(generateSentence(subject, anchor, position, 'en')).toContain(' is ');
    });
  });

  describe('math packs shape', () => {
    const packBindings = [
      { pack: MATH_ADDITION_WITHIN_20_PACK, skill: MATH_ADDITION_WITHIN_20_SKILL },
      { pack: MATH_ADDITION_WITHIN_100_PACK, skill: MATH_ADDITION_WITHIN_100_SKILL },
      { pack: MATH_SUBTRACTION_WITHIN_20_PACK, skill: MATH_SUBTRACTION_WITHIN_20_SKILL },
      { pack: MATH_SUBTRACTION_WITHIN_100_PACK, skill: MATH_SUBTRACTION_WITHIN_100_SKILL },
      { pack: MATH_MULTIPLICATION_1_5_PACK, skill: MATH_MULTIPLICATION_1_TO_5_SKILL },
      { pack: MATH_MULTIPLICATION_1_10_PACK, skill: MATH_MULTIPLICATION_1_TO_10_SKILL },
      { pack: MATH_PATTERN_SEQUENCES_PACK, skill: MATH_PATTERN_SEQUENCES_SKILL },
      { pack: MATH_UNIT_CONVERSIONS_PACK, skill: MATH_UNIT_CONVERSIONS_SKILL },
      { pack: MATH_COMPARE_NUMBERS_PACK, skill: MATH_COMPARE_NUMBERS_SKILL },
      { pack: MATH_TIME_READING_PACK, skill: MATH_TIME_READING_SKILL },
      { pack: MATH_BALANCE_EQUATIONS_PACK, skill: MATH_BALANCE_EQUATIONS_SKILL },
      { pack: MATH_ADDITION_MEMORY_PACK, skill: MATH_ADDITION_MEMORY_SKILL },
      { pack: MATH_GRID_NAVIGATION_PACK, skill: MATH_GRID_NAVIGATION_SKILL },
      { pack: MATH_BATTLELEARN_PACK, skill: MATH_MIXED_PROBLEM_SOLVING_SKILL },
      { pack: MATH_BATTLELEARN_MULTIPLICATION_PACK, skill: MATH_MULTIPLICATION_1_TO_10_SKILL },
      { pack: MATH_BATTLELEARN_MULTIPLICATION_1_5_PACK, skill: MATH_MULTIPLICATION_1_TO_5_SKILL },
    ];

    it('every math pack binds to its declared skill', () => {
      for (const { pack, skill } of packBindings) {
        expect(pack.skillId).toBe(skill.id);
      }
    });

    it('addition packs contain only add_* specs', () => {
      for (const pack of [MATH_ADDITION_WITHIN_20_PACK, MATH_ADDITION_WITHIN_100_PACK]) {
        for (const spec of pack.items) {
          expect(spec.op.startsWith('add_')).toBe(true);
        }
      }
    });

    it('subtraction packs contain only sub_* specs', () => {
      for (const pack of [MATH_SUBTRACTION_WITHIN_20_PACK, MATH_SUBTRACTION_WITHIN_100_PACK]) {
        for (const spec of pack.items) {
          expect(spec.op.startsWith('sub_')).toBe(true);
        }
      }
    });

    it('multiplication packs contain only mul_* specs', () => {
      for (const pack of [MATH_MULTIPLICATION_1_5_PACK, MATH_MULTIPLICATION_1_10_PACK]) {
        for (const spec of pack.items) {
          expect(spec.op.startsWith('mul_')).toBe(true);
        }
      }
    });

    it('addition_within_20 caps values at 20', () => {
      for (const spec of MATH_ADDITION_WITHIN_20_PACK.items) {
        expect(spec.valueRange?.[1]).toBe(20);
      }
    });

    it('addition_within_100 caps values at 100', () => {
      for (const spec of MATH_ADDITION_WITHIN_100_PACK.items) {
        expect(spec.valueRange?.[1]).toBe(100);
      }
    });

    it('multiplication_1_5 caps factors at [2,5]', () => {
      for (const spec of MATH_MULTIPLICATION_1_5_PACK.items) {
        expect(spec.factorRange).toEqual([2, 5]);
      }
    });

    it('multiplication_1_10 caps factors at [2,10]', () => {
      for (const spec of MATH_MULTIPLICATION_1_10_PACK.items) {
        expect(spec.factorRange).toEqual([2, 10]);
      }
    });

    it('pattern sequence pack has themes and progression templates', () => {
      const themes = getPatternThemes(MATH_PATTERN_SEQUENCES_PACK.items);
      const templates = getPatternTemplates(MATH_PATTERN_SEQUENCES_PACK.items);
      expect(themes).toHaveLength(5);
      expect(themes.every((theme) => theme.symbols.length === 4)).toBe(true);
      expect(templates.map((template) => template.id).sort()).toEqual([
        'repeat_aab',
        'repeat_aabb',
        'repeat_aabc',
        'repeat_ab',
        'repeat_abc',
        'repeat_abcd',
      ]);
      expect(getPatternTemplatesForLevel(MATH_PATTERN_SEQUENCES_PACK.items, 1, false)).toHaveLength(
        2,
      );
      expect(getPatternTemplatesForLevel(MATH_PATTERN_SEQUENCES_PACK.items, 6, true)).toHaveLength(
        4,
      );
    });

    it('unit conversion pack groups supported measurement categories', () => {
      const byCategory = getUnitConversionsByCategory(MATH_UNIT_CONVERSIONS_PACK.items);
      const conversions = getUnitConversionItems(MATH_UNIT_CONVERSIONS_PACK.items);
      const starterLevel1 = getUnitConversionStage(MATH_UNIT_CONVERSIONS_PACK.items, 'starter', 1);
      const starterLevel7 = getUnitConversionStage(MATH_UNIT_CONVERSIONS_PACK.items, 'starter', 7);
      const advancedLevel11 = getUnitConversionStage(
        MATH_UNIT_CONVERSIONS_PACK.items,
        'advanced',
        11,
      );

      expect(byCategory.length.map((item) => item.from)).toEqual(['m', 'km', 'cm']);
      expect(byCategory.mass.map((item) => item.from)).toEqual(['kg', 't']);
      expect(byCategory.volume.map((item) => item.from)).toEqual(['l', 'l']);
      expect(conversions.every((item) => item.factor > 1)).toBe(true);
      expect(starterLevel1.conversionIds).toEqual(['length_m_cm', 'mass_kg_g']);
      expect(starterLevel7.maxValue).toBe(20);
      expect(advancedLevel11.maxValue).toBe(1000);
      expect(advancedLevel11.conversionIds).toHaveLength(conversions.length);
    });

    it('compare number pack defines staged comparison difficulty', () => {
      const level1 = getCompareNumberStage(MATH_COMPARE_NUMBERS_PACK.items, 1);
      const level4 = getCompareNumberStage(MATH_COMPARE_NUMBERS_PACK.items, 4);
      const level12 = getCompareNumberStage(MATH_COMPARE_NUMBERS_PACK.items, 12);

      expect(level1.symbolOptions).toEqual(['left', 'right']);
      expect(level1.equalChance).toBe(0);
      expect(level4.symbolOptions).toEqual(['left', 'right', 'equal']);
      expect(level4.showNumbers).toBe(true);
      expect(level12.maxValue).toBe(100);
    });

    it('time reading pack defines learning outcomes, minute precision, and option stages', () => {
      const level1 = getTimeReadingStage(MATH_TIME_READING_PACK.items, 1);
      const level2 = getTimeReadingStage(MATH_TIME_READING_PACK.items, 2);
      const level3 = getTimeReadingStage(MATH_TIME_READING_PACK.items, 3);
      const level5 = getTimeReadingStage(MATH_TIME_READING_PACK.items, 5);
      const level6 = getTimeReadingStage(MATH_TIME_READING_PACK.items, 6);
      const level8 = getTimeReadingStage(MATH_TIME_READING_PACK.items, 8);
      const level10 = getTimeReadingStage(MATH_TIME_READING_PACK.items, 10);
      const level13 = getTimeReadingStage(MATH_TIME_READING_PACK.items, 13);

      expect(MATH_TIME_READING_PACK.items).toHaveLength(8);
      expect(level1).toMatchObject({ focus: 'full_hour', stepMinutes: 60, optionCount: 3 });
      expect(level2).toMatchObject({ focus: 'half_hour', stepMinutes: 30, optionCount: 3 });
      expect(level3).toMatchObject({ focus: 'quarter_hour', stepMinutes: 15, optionCount: 4 });
      expect(level5).toMatchObject({ focus: 'ten_minutes', stepMinutes: 10, optionCount: 4 });
      expect(level6).toMatchObject({ focus: 'five_minutes', stepMinutes: 5, optionCount: 5 });
      expect(level8).toMatchObject({ focus: 'near_hour', stepMinutes: 5, optionCount: 5 });
      expect(level10).toMatchObject({ focus: 'digital_24h', stepMinutes: 5, optionCount: 6 });
      expect(level13).toMatchObject({ focus: 'mixed_review', stepMinutes: 5, optionCount: 6 });
      expect(MATH_TIME_READING_PACK.items.every((item) => 60 % item.stepMinutes === 0)).toBe(true);
      expect(
        MATH_TIME_READING_PACK.items.every((item) => item.distractorMinuteOffsets.length > 0),
      ).toBe(true);
      expect(MATH_TIME_READING_PACK.items.every((item) => item.learningOutcome.et.length > 0)).toBe(
        true,
      );
    });

    it('balance equation pack defines level stages and distractor settings', () => {
      const level1 = getBalanceEquationProgression(MATH_BALANCE_EQUATIONS_PACK.items, 1);
      const level5 = getBalanceEquationProgression(MATH_BALANCE_EQUATIONS_PACK.items, 5);
      const level15 = getBalanceEquationProgression(MATH_BALANCE_EQUATIONS_PACK.items, 15);

      expect(MATH_BALANCE_EQUATIONS_PACK.items).toHaveLength(6);
      expect(level1).toMatchObject({
        minLevel: 1,
        maxLevel: 2,
        minSum: 4,
        maxSum: 7,
        minVisibleWeight: 2,
        optionCount: 3,
      });
      expect(level5).toMatchObject({ minLevel: 5, maxLevel: 6, optionCount: 4 });
      expect(level15).toMatchObject({ minLevel: 15, optionCount: 5 });

      for (const stage of MATH_BALANCE_EQUATIONS_PACK.items) {
        expect(stage.maxSum).toBeGreaterThanOrEqual(stage.minSum);
        expect(stage.minSum).toBeGreaterThanOrEqual(stage.minVisibleWeight * 2);
        expect(stage.distractorOffsets).not.toContain(0);
        expect(stage.distractorOffsets.some((offset) => offset < 0)).toBe(true);
        expect(stage.distractorOffsets.some((offset) => offset > 0)).toBe(true);
      }
    });

    it('addition memory pack defines starter and advanced level stages', () => {
      const starter1 = getMemoryMathProgression(MATH_ADDITION_MEMORY_PACK.items, 'starter', 1);
      const starter8 = getMemoryMathProgression(MATH_ADDITION_MEMORY_PACK.items, 'starter', 8);
      const advanced1 = getMemoryMathProgression(MATH_ADDITION_MEMORY_PACK.items, 'advanced', 1);
      const advanced10 = getMemoryMathProgression(MATH_ADDITION_MEMORY_PACK.items, 'advanced', 10);

      expect(MATH_ADDITION_MEMORY_PACK.items).toHaveLength(8);
      expect(starter1).toMatchObject({
        focus: 'first_pairs',
        cardCount: 6,
        minAnswerSum: 3,
        maxAnswerSum: 8,
      });
      expect(starter8).toMatchObject({ focus: 'sums_within_20', cardCount: 12 });
      expect(advanced1).toMatchObject({ focus: 'advanced_warmup', cardCount: 8 });
      expect(advanced10).toMatchObject({ focus: 'sums_within_35', cardCount: 14 });
      expect(MATH_ADDITION_MEMORY_PACK.items.every((item) => item.kind === 'stage')).toBe(true);
      expect(MATH_ADDITION_MEMORY_PACK.items.every((item) => item.cardCount % 2 === 0)).toBe(true);
      expect(
        MATH_ADDITION_MEMORY_PACK.items.every(
          (item) => item.maxAnswerSum >= item.minAnswerSum && item.learningOutcome.et.length > 0,
        ),
      ).toBe(true);
    });

    it('grid navigation pack defines robo path grid and obstacle progression', () => {
      const settings = getRoboPathSettings(MATH_GRID_NAVIGATION_PACK.items);

      expect(getRoboPathGridSize(MATH_GRID_NAVIGATION_PACK.items, 'starter', 1)).toBe(3);
      expect(getRoboPathGridSize(MATH_GRID_NAVIGATION_PACK.items, 'advanced', 1)).toBe(4);
      expect(getRoboPathGridSize(MATH_GRID_NAVIGATION_PACK.items, 'starter', 16)).toBe(7);
      expect(getRoboPathGridSize(MATH_GRID_NAVIGATION_PACK.items, 'advanced', 16)).toBe(8);
      expect(getRoboPathObstacleStage(MATH_GRID_NAVIGATION_PACK.items, 9).obstacleVariance).toBe(2);
      expect(settings.maxObstacleRatio).toBe(0.25);
    });

    it('battlelearn pack defines board and question progression', () => {
      const starterStage = getBattleLearnProfileStage(MATH_BATTLELEARN_PACK.items, 'starter', 1);
      const advancedStage = getBattleLearnProfileStage(MATH_BATTLELEARN_PACK.items, 'advanced', 11);
      const initialStage = getBattleLearnQuestionStage(
        MATH_BATTLELEARN_PACK.items,
        'initial',
        'starter',
        1,
      );
      const followupStage = getBattleLearnQuestionStage(
        MATH_BATTLELEARN_PACK.items,
        'followup',
        'advanced',
        6,
      );
      const cellDistribution = getBattleLearnCellDistribution(MATH_BATTLELEARN_PACK.items);
      const advancedPatterns = getBattleLearnSequencePatterns(
        MATH_BATTLELEARN_PACK.items,
        'advanced_pattern',
      );

      expect(starterStage).toMatchObject({ gridSize: 4, shipLengths: [2] });
      expect(advancedStage).toMatchObject({ gridSize: 8, shipLengths: [4, 3, 3, 2] });
      expect(initialStage.questionKinds).toEqual(['count_ships', 'simple_addition', 'count_ships']);
      expect(followupStage.questionKinds).toContain('time_problem');
      expect(cellDistribution.weights.map((entry) => entry.cell)).toEqual([
        'empty',
        'problem',
        'star',
        'heart',
      ]);
      expect(getBattleLearnCountObjectLabels(MATH_BATTLELEARN_PACK.items, 'et')).toContain('laeva');
      expect(advancedPatterns.some((pattern) => pattern.answer === 81)).toBe(true);
    });

    it('battlelearn multiplication pack narrows questions to multiplication facts', () => {
      const pack = MATH_BATTLELEARN_MULTIPLICATION_PACK;
      const starterStage = getBattleLearnProfileStage(pack.items, 'starter', 1);
      const questionStage = getBattleLearnQuestionStage(pack.items, 'initial', 'starter', 1);
      const factStageEarly = getBattleLearnMultiplicationFactStage(pack.items, 1);
      const factStageFull = getBattleLearnMultiplicationFactStage(pack.items, 6);

      expect(pack.skillId).toBe(MATH_MULTIPLICATION_1_TO_10_SKILL.id);
      expect(contentPackRegistry.has(pack.id)).toBe(true);
      expect(starterStage).toMatchObject({ gridSize: 4, shipLengths: [2] });
      expect(questionStage.questionKinds).toEqual(['multiplication_fact']);
      expect(factStageEarly).toMatchObject({ minFactor: 2, maxFactor: 5 });
      expect(factStageFull).toMatchObject({ minFactor: 2, maxFactor: 10 });
    });

    it('battlelearn multiplication 1-5 pack caps factors at 5 across all levels', () => {
      const pack = MATH_BATTLELEARN_MULTIPLICATION_1_5_PACK;
      const factStageEarly = getBattleLearnMultiplicationFactStage(pack.items, 1);
      const factStageMid = getBattleLearnMultiplicationFactStage(pack.items, 3);
      const factStageFull = getBattleLearnMultiplicationFactStage(pack.items, 6);

      expect(pack.skillId).toBe(MATH_MULTIPLICATION_1_TO_5_SKILL.id);
      expect(contentPackRegistry.has(pack.id)).toBe(true);
      expect(factStageEarly).toMatchObject({ minFactor: 2, maxFactor: 3 });
      expect(factStageMid).toMatchObject({ minFactor: 2, maxFactor: 4 });
      expect(factStageFull).toMatchObject({ minFactor: 2, maxFactor: 5 });
    });
  });

  describe('geometry shapes pack shape', () => {
    const checkpointQuestions = getShapeDashCheckpointQuestions(MATH_GEOMETRY_SHAPES_PACK.items);
    const gateQuestions = getShapeDashGateQuestions(MATH_GEOMETRY_SHAPES_PACK.items);

    it('binds to the verbal-geometry skill and registers on import', () => {
      expect(MATH_GEOMETRY_SHAPES_PACK.skillId).toBe(MATH_GEOMETRY_SHAPES_VERBAL_SKILL.id);
      expect(skillRegistry.has(MATH_GEOMETRY_SHAPES_VERBAL_SKILL.id)).toBe(true);
      expect(contentPackRegistry.has(MATH_GEOMETRY_SHAPES_PACK.id)).toBe(true);
    });

    it('contains checkpoint and gate content for Shape Dash', () => {
      expect(checkpointQuestions.length).toBeGreaterThan(20);
      expect(gateQuestions.length).toBeGreaterThanOrEqual(5);
    });

    it('keeps every checkpoint correct index inside both locale option arrays', () => {
      for (const question of checkpointQuestions) {
        expect(question.options.et[question.correctIndex]).toBeDefined();
        expect(question.options.en[question.correctIndex]).toBeDefined();
      }
    });

    it('has labels for every gate shape in both locales', () => {
      for (const question of gateQuestions) {
        expect(getShapeDashShapeLabel(question.correctShape, 'et')).not.toBe('');
        expect(getShapeDashShapeLabel(question.correctShape, 'en')).not.toBe('');
      }
    });
  });

  describe('shape shift puzzle pack shape', () => {
    it('binds to the spatial-geometry skill and registers on import', () => {
      expect(SHAPE_SHIFT_PUZZLES_PACK.skillId).toBe(MATH_GEOMETRY_SHAPES_SPATIAL_SKILL.id);
      expect(skillRegistry.has(MATH_GEOMETRY_SHAPES_SPATIAL_SKILL.id)).toBe(true);
      expect(contentPackRegistry.has(SHAPE_SHIFT_PUZZLES_PACK.id)).toBe(true);
    });

    it('covers every Shape Shift difficulty tier', () => {
      const difficulties = new Set(
        SHAPE_SHIFT_PUZZLES_PACK.items.map((puzzle) => puzzle.difficulty),
      );
      expect(difficulties.has('easy')).toBe(true);
      expect(difficulties.has('medium')).toBe(true);
      expect(difficulties.has('hard')).toBe(true);
    });

    it('keeps every puzzle id unique and every puzzle non-empty', () => {
      const ids = SHAPE_SHIFT_PUZZLES_PACK.items.map((puzzle) => puzzle.id);
      expect(new Set(ids).size).toBe(ids.length);

      for (const puzzle of SHAPE_SHIFT_PUZZLES_PACK.items) {
        expect(puzzle.pieces.length).toBeGreaterThan(0);
      }
    });

    it('keeps Shape Shift puzzles readable and broad enough per tier', () => {
      const allowedShapeTypes = new Set([
        'circle',
        'diamond',
        'half_square',
        'hexagon',
        'rectangle',
        'square',
        'triangle',
      ]);
      const countsByDifficulty = new Map<string, number>();

      expect(SHAPE_SHIFT_PUZZLES_PACK.items.length).toBeGreaterThanOrEqual(20);

      for (const puzzle of SHAPE_SHIFT_PUZZLES_PACK.items) {
        countsByDifficulty.set(
          puzzle.difficulty,
          (countsByDifficulty.get(puzzle.difficulty) ?? 0) + 1,
        );
        expect(puzzle.nameEt).not.toBe('');
        expect(puzzle.nameEn).not.toBe('');
        expect(puzzle.category).toMatch(/^[a-z_]+$/);
        expect(puzzle.gridSize).toBe(100);

        const pieceIds = puzzle.pieces.map((piece) => piece.id);
        expect(new Set(pieceIds).size).toBe(pieceIds.length);

        for (const piece of puzzle.pieces) {
          expect(allowedShapeTypes.has(piece.type)).toBe(true);
          expect(piece.color).not.toBe('');
          expect(piece.size).toBeGreaterThan(0);
          expect(piece.width ?? piece.size).toBeGreaterThan(0);
          expect(piece.height ?? piece.size).toBeGreaterThan(0);
        }
      }

      expect(countsByDifficulty.get('easy')).toBeGreaterThanOrEqual(6);
      expect(countsByDifficulty.get('medium')).toBeGreaterThanOrEqual(6);
      expect(countsByDifficulty.get('hard')).toBeGreaterThanOrEqual(5);
    });

    it('keeps every target piece inside the board', () => {
      for (const puzzle of SHAPE_SHIFT_PUZZLES_PACK.items) {
        for (const piece of puzzle.pieces) {
          const { width, height } = getPieceGridDimensions(piece);
          expect(
            pieceInBounds(
              piece.correctPosition.x,
              piece.correctPosition.y,
              width,
              puzzle.gridSize,
              height,
            ),
          ).toBe(true);
        }
      }
    });
  });
});
