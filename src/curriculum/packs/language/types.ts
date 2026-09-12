/**
 * Shared item types for the `language.*` skill family.
 */

import type { LocaleCode } from '../../types';
import type { Difficulty } from '../../../types/game';

export type SyllableWordFocus =
  'two_syllable_words' | 'three_syllable_words' | 'four_syllable_words';
export type SyllableWordProgressionProfile = 'starter' | 'advanced';

export interface SyllableWordBase {
  syllables: string[];
  emoji: string;
}

export interface SyllableWordMetadata {
  difficulty: Difficulty;
  minLevel: number;
  maxLevel?: number;
  focus: SyllableWordFocus;
  learningOutcome: Record<LocaleCode, string>;
}

export type SyllableWord = SyllableWordBase & SyllableWordMetadata;

export type VocabularyWordFocus = 'short_words' | 'core_words' | 'longer_words';
export type VocabularyWordProgressionProfile = 'starter' | 'advanced';

export interface VocabularyWordBase {
  w: string;
  e: string;
}

export interface VocabularyWordMetadata {
  difficulty: Difficulty;
  minLevel: number;
  maxLevel?: number;
  focus: VocabularyWordFocus;
  learningOutcome: Record<LocaleCode, string>;
}

export type VocabularyWord = VocabularyWordBase & VocabularyWordMetadata;

interface SyllableWordBounds {
  targetSyllables: number;
  minSyllables: number;
  maxSyllables: number;
}

const SYLLABLE_METADATA_BY_COUNT: Record<number, SyllableWordMetadata> = {
  2: {
    difficulty: 'easy',
    minLevel: 1,
    focus: 'two_syllable_words',
    learningOutcome: {
      et: 'Kahe silbiga tuttavate sõnade kokkupanek',
      en: 'Build familiar two-syllable words',
    },
  },
  3: {
    difficulty: 'medium',
    minLevel: 3,
    focus: 'three_syllable_words',
    learningOutcome: {
      et: 'Kolme silbiga sõnade järjestamine',
      en: 'Sequence three-syllable words',
    },
  },
  4: {
    difficulty: 'hard',
    minLevel: 6,
    focus: 'four_syllable_words',
    learningOutcome: {
      et: 'Pikemate neljasilbiliste sõnade kokkupanek',
      en: 'Build longer four-syllable words',
    },
  },
};

function getSyllableMetadata(syllableCount: number): SyllableWordMetadata {
  const metadata = SYLLABLE_METADATA_BY_COUNT[syllableCount];
  if (!metadata) {
    throw new Error(`No syllable word metadata found for ${syllableCount} syllables`);
  }
  return metadata;
}

export function withSyllableWordMetadata(
  words: readonly SyllableWordBase[],
): readonly SyllableWord[] {
  return words.map((word) => ({
    ...word,
    ...getSyllableMetadata(word.syllables.length),
  }));
}

function getSyllableWordBounds(
  profile: SyllableWordProgressionProfile,
  level = 1,
): SyllableWordBounds {
  if (profile === 'advanced') {
    if (level <= 2) {
      return { targetSyllables: 2, minSyllables: 2, maxSyllables: 3 };
    }
    if (level <= 5) {
      return { targetSyllables: 3, minSyllables: 3, maxSyllables: 4 };
    }
    return { targetSyllables: 4, minSyllables: 3, maxSyllables: 4 };
  }

  if (level <= 2) {
    return { targetSyllables: 2, minSyllables: 2, maxSyllables: 2 };
  }
  if (level <= 5) {
    return { targetSyllables: 3, minSyllables: 3, maxSyllables: 3 };
  }
  if (level <= 7) {
    return { targetSyllables: 3, minSyllables: 3, maxSyllables: 4 };
  }
  return { targetSyllables: 4, minSyllables: 3, maxSyllables: 4 };
}

export function getSyllableWordsForLevel(
  words: readonly SyllableWord[],
  profile: SyllableWordProgressionProfile,
  level = 1,
): SyllableWord[] {
  const bounds = getSyllableWordBounds(profile, level);
  const effectiveLevel = profile === 'advanced' ? level + 2 : level;
  const matchingWords = words.filter((word) => {
    const syllableCount = word.syllables.length;
    return (
      effectiveLevel >= word.minLevel &&
      (word.maxLevel === undefined || effectiveLevel <= word.maxLevel) &&
      syllableCount >= bounds.minSyllables &&
      syllableCount <= bounds.maxSyllables
    );
  });

  if (matchingWords.length > 0) {
    return matchingWords;
  }

  const smallestDistance = Math.min(
    ...words.map((word) => Math.abs(word.syllables.length - bounds.targetSyllables)),
  );
  return words.filter(
    (word) => Math.abs(word.syllables.length - bounds.targetSyllables) === smallestDistance,
  );
}
