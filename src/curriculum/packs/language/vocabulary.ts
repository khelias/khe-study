/**
 * Content packs: vocabulary words used by word-based language mechanics.
 *
 * The mechanics group these words by length for level progression; the pack
 * itself stays flat so it can later move to external content storage unchanged.
 */

import type { ContentPack } from '../../types';
import { LANGUAGE_LONG_VOCABULARY_SKILL, LANGUAGE_VOCABULARY_SKILL } from '../../skills/language';
import type { VocabularyWord, VocabularyWordBase, VocabularyWordMetadata } from './types';

export const ALPHABET: string[] = 'ABCDEFGHIJKLMNOPRSŠZŽTUVÕÄÖÜ'.split('');

// Based on emojis; Estonian words for language learning games, mostly <=7 letters
const RAW_ESTONIAN_WORDS: readonly VocabularyWordBase[] = [
  // nature and weather
  { w: 'PUU', e: '🌳' },
  { w: 'LILL', e: '🌸' },
  { w: 'LEHT', e: '🍃' },
  { w: 'METS', e: '🌲' },
  { w: 'MÄGI', e: '⛰️' },
  { w: 'JÕGI', e: '🏞️' },
  { w: 'MERI', e: '🌊' },
  { w: 'RAND', e: '🏖️' },
  { w: 'KIVI', e: '🪨' },
  { w: 'PILV', e: '☁️' },
  { w: 'PÄIKE', e: '☀️' },
  { w: 'KUU', e: '🌙' },
  { w: 'TÄHT', e: '⭐' },
  { w: 'ÄIKE', e: '🌩️' },
  { w: 'LUMI', e: '❄️' },
  { w: 'JÄÄ', e: '🧊' },
  { w: 'TUUL', e: '🌬️' },
  { w: 'VESI', e: '💧' },

  // animals
  { w: 'KOER', e: '🐶' },
  { w: 'KASS', e: '🐱' },
  { w: 'HIIR', e: '🐭' },
  { w: 'JÄNES', e: '🐰' },
  { w: 'KUKK', e: '🐓' }, // rooster
  { w: 'REBANE', e: '🦊' },
  { w: 'KARU', e: '🐻' },
  { w: 'SEBRA', e: '🦓' },
  { w: 'LÕVI', e: '🦁' },
  { w: 'TIIGER', e: '🐯' },
  { w: 'PANDA', e: '🐼' },
  { w: 'ELEVANT', e: '🐘' },
  { w: 'HOBUNE', e: '🐎' },
  { w: 'LAMMAS', e: '🐑' },
  { w: 'KITS', e: '🐐' },
  { w: 'LEHM', e: '🐄' },
  { w: 'PÕRSAS', e: '🐖' },
  { w: 'PART', e: '🦆' },
  { w: 'HANI', e: '🪿' },
  { w: 'PINGVIIN', e: '🐧' },
  { w: 'KONN', e: '🐸' },
  { w: 'KALA', e: '🐟' },
  { w: 'HAI', e: '🦈' },
  { w: 'DRAAKON', e: '🐉' },
  { w: 'ÄMBLIK', e: '🕷️' },
  { w: 'SIIL', e: '🦔' },
  { w: 'TIGU', e: '🐌' },
  { w: 'LIND', e: '🐦' }, // bird
  { w: 'ÖÖKULL', e: '🦉' }, // owl
  { w: 'MADU', e: '🐍' }, // snake
  { w: 'PAPAGOI', e: '🦜' }, // parrot

  // food and drinks
  { w: 'SAI', e: '🥖' },
  { w: 'LEIB', e: '🍞' },
  { w: 'JUUST', e: '🧀' },
  { w: 'PIIM', e: '🥛' },
  { w: 'PITSA', e: '🍕' },
  { w: 'BURGER', e: '🍔' },
  { w: 'LIHA', e: '🥩' },
  { w: 'MUNA', e: '🥚' },
  { w: 'KARTUL', e: '🥔' },
  { w: 'PORGAND', e: '🥕' },
  { w: 'TOMAT', e: '🍅' },
  { w: 'KURK', e: '🥒' },
  { w: 'KIRSS', e: '🍒' },
  { w: 'ÕUN', e: '🍎' },
  { w: 'VIRSIK', e: '🍑' },
  { w: 'MAASIKAS', e: '🍓' },
  { w: 'ARBUUS', e: '🍉' },
  { w: 'SIDRUN', e: '🍋' },
  { w: 'PÄHKEL', e: '🌰' },
  { w: 'KOMM', e: '🍬' },
  { w: 'JÄÄTIS', e: '🍦' },
  { w: 'KÜPSIS', e: '🍪' },
  { w: 'KOOK', e: '🍰' },
  { w: 'MESI', e: '🍯' },
  { w: 'KOHV', e: '☕' },
  { w: 'TEE', e: '🫖' },
  { w: 'KAPSAS', e: '🥬' }, // cabbage
  { w: 'ŠOKOLAAD', e: '🍫' }, // chocolate
  { w: 'PAPRIKA', e: '🫑' }, // bell pepper
  { w: 'SOOL', e: '🧂' }, // salt

  // home and items
  { w: 'KODU', e: '🏡' },
  { w: 'VOODI', e: '🛌' },
  { w: 'TALDRIK', e: '🍽️' },
  { w: 'TOOL', e: '🪑' },
  { w: 'LAMP', e: '💡' },
  { w: 'UKS', e: '🚪' },
  { w: 'KAPP', e: '🗄️' },
  { w: 'RAAMAT', e: '📖' },
  { w: 'PLIIATS', e: '✏️' },
  { w: 'VÄRV', e: '🎨' },
  { w: 'KÄÄRID', e: '✂️' },
  { w: 'ARVUTI', e: '💻' },
  { w: 'TELEFON', e: '📱' },
  { w: 'EKRAAN', e: '🖥️' },
  { w: 'KOHVER', e: '🧳' },
  { w: 'PRILLID', e: '👓' },
  { w: 'KINDAD', e: '🧤' },
  { w: 'MÜTS', e: '🧢' },
  { w: 'KELL', e: '⌚' },
  { w: 'STOPPER', e: '⏱️' },
  { w: 'ÕHUPALL', e: '🎈' },
  { w: 'PUSLE', e: '🧩' },
  { w: 'LUSIKAS', e: '🥄' },
  { w: 'KAHVEL', e: '🍴' },
  { w: 'KÄRU', e: '🛒' }, // cart
  { w: 'KÜÜNAL', e: '🕯️' }, // candle

  // transport
  { w: 'AUTO', e: '🚗' },
  { w: 'BUSS', e: '🚌' },
  { w: 'TRAMM', e: '🚊' },
  { w: 'RONG', e: '🚆' },
  { w: 'LAEV', e: '⛵' },
  { w: 'PAAT', e: '🛶' },
  { w: 'LENNUK', e: '✈️' },
  { w: 'KOPTER', e: '🚁' },
  { w: 'RATAS', e: '🚲' },
  { w: 'RULA', e: '🛹' },

  // people and emotions
  { w: 'EMA', e: '👩' },
  { w: 'ISA', e: '👨' },
  { w: 'LAPS', e: '🧒' },
  { w: 'SÕBER', e: '👫' },
  { w: 'ÕPETAJA', e: '🧑‍🏫' },
  { w: 'ARST', e: '🧑‍⚕️' },
  { w: 'POLITSEI', e: '👮' },
  { w: 'PÄÄSTJA', e: '🧑‍🚒' },
  { w: 'KOKK', e: '👨‍🍳' },
  { w: 'MUUSIK', e: '🎤' },
  { w: 'TANTS', e: '💃' },
  { w: 'RÕÕM', e: '😄' },
  { w: 'KURBUS', e: '😢' },
  { w: 'ÜLLATUS', e: '😮' },
  { w: 'UNI', e: '😴' },

  // sports and games
  { w: 'PALL', e: '⚽' },
  { w: 'KORV', e: '🧺' },
  { w: 'TENNIS', e: '🎾' },
  { w: 'GOLF', e: '⛳' },
  { w: 'MALE', e: '♟️' },
  { w: 'KAARDID', e: '🃏' },
  { w: 'UISK', e: '⛸️' },
  { w: 'KELK', e: '🛷' },
  { w: 'MAADLUS', e: '🤼' },
  { w: 'VIBU', e: '🏹' },

  // school and learning
  { w: 'KOOL', e: '🏫' },
  { w: 'KIRI', e: '✉️' },
  { w: 'NUMBRID', e: '🔢' },
  { w: 'TÄHED', e: '🔤' },
  { w: 'ÕPIK', e: '📘' },
  { w: 'MUUSIKA', e: '🎼' },

  // added words - more variations
  // nature (added)
  { w: 'MARI', e: '🫐' },
  { w: 'SEEN', e: '🍄' },
  { w: 'ROHI', e: '🌱' },
  { w: 'PÕDER', e: '🫎' },
  { w: 'HIRV', e: '🦌' },

  // animals (added)
  { w: 'KANA', e: '🐔' },
  { w: 'KALKUN', e: '🦃' },
  { w: 'KILPKONN', e: '🐢' },
  { w: 'HAMSTER', e: '🐹' },
  { w: 'KAAMEL', e: '🐫' },

  // food (added)
  { w: 'BANAAN', e: '🍌' },
  { w: 'APELSIN', e: '🍊' },
  { w: 'ANANASS', e: '🍍' },
  { w: 'MANGO', e: '🥭' },
  { w: 'KOOKOS', e: '🥥' },
  { w: 'PIRN', e: '🍐' },
  { w: 'VÕI', e: '🧈' },
  { w: 'SUPP', e: '🍲' },
  { w: 'SALAT', e: '🥗' },
  { w: 'KREVETT', e: '🦐' },
  { w: 'KRABI', e: '🦀' },

  // home (added)
  { w: 'AKEN', e: '🪟' },
  { w: 'PALK', e: '🪵' },
  { w: 'SEIN', e: '🧱' },
  { w: 'PANN', e: '🍳' },
  { w: 'VANN', e: '🛁' },
  { w: 'TELER', e: '📺' },

  // transportation (added)
  { w: 'MOPEED', e: '🛵' },
  { w: 'VEOK', e: '🚚' },

  // people (added)
  { w: 'TÜDRUK', e: '👧' },
  { w: 'POISS', e: '👦' },
  { w: 'VANAEMA', e: '👵' },
  { w: 'VANAISA', e: '👴' },
  { w: 'RAAMATUD', e: '📚' },
  { w: 'ÕPILANE', e: '👨‍🎓' },

  // sports (added) - keeping specific terms for variety
  { w: 'VÕRKPALL', e: '🏐' },
  { w: 'JÕUSAAL', e: '🏋️' },
  { w: 'JOOKS', e: '🏃' },
  { w: 'UJUMINE', e: '🏊' },

  // colors and shapes
  { w: 'PUNANE', e: '🔴' },
  { w: 'SININE', e: '🔵' },
  { w: 'ROHELINE', e: '🟢' },
  { w: 'KOLLANE', e: '🟡' },
  { w: 'VALGE', e: '⚪' },
  { w: 'MUST', e: '⚫' },
  { w: 'LILLA', e: '🟣' },
  { w: 'ORANŽ', e: '🟠' },

  // body parts
  { w: 'AJU', e: '🧠' },
  { w: 'KÄSI', e: '✋' },
  { w: 'JALG', e: '🦵' },
  { w: 'SILM', e: '👁️' },
  { w: 'KÕRV', e: '👂' },
  { w: 'NINA', e: '👃' },
  { w: 'SUU', e: '👄' },

  // natural phenomena
  { w: 'VIHM', e: '🌧️' },
  { w: 'LUMESADU', e: '🌨️' },

  // games and toys
  { w: 'MÄNG', e: '🎮' },
  { w: 'NUKK', e: '🪆' },

  // animals from scenes (add to main list)
  { w: 'ORAV', e: '🐿️' },
  { w: 'HUNT', e: '🐺' },
  { w: 'ROBOT', e: '🤖' },
];

const RAW_ENGLISH_WORDS: readonly VocabularyWordBase[] = [
  // 3-letter words
  { w: 'CAT', e: '🐱' },
  { w: 'DOG', e: '🐶' },
  { w: 'BAT', e: '🦇' },
  { w: 'BEE', e: '🐝' },
  { w: 'FOX', e: '🦊' },
  { w: 'PIG', e: '🐷' },
  { w: 'COW', e: '🐄' },
  { w: 'OWL', e: '🦉' },
  { w: 'ANT', e: '🐜' },
  { w: 'SUN', e: '☀️' },
  { w: 'SEA', e: '🌊' },
  { w: 'ICE', e: '🧊' },
  { w: 'EGG', e: '🥚' },
  { w: 'PIE', e: '🥧' },
  { w: 'TEA', e: '☕' },

  // 4-letter words
  { w: 'BIRD', e: '🐦' },
  { w: 'FISH', e: '🐟' },
  { w: 'LION', e: '🦁' },
  { w: 'BEAR', e: '🐻' },
  { w: 'FROG', e: '🐸' },
  { w: 'DUCK', e: '🦆' },
  { w: 'CRAB', e: '🦀' },
  { w: 'DEER', e: '🦌' },
  { w: 'GOAT', e: '🐐' },
  { w: 'TREE', e: '🌳' },
  { w: 'LEAF', e: '🍃' },
  { w: 'ROSE', e: '🌹' },
  { w: 'SNOW', e: '❄️' },
  { w: 'RAIN', e: '🌧️' },
  { w: 'MOON', e: '🌙' },
  { w: 'STAR', e: '⭐' },
  { w: 'CAKE', e: '🍰' },
  { w: 'MILK', e: '🥛' },
  { w: 'PEAR', e: '🍐' },
  { w: 'CORN', e: '🌽' },
  { w: 'BALL', e: '⚽' },
  { w: 'BOOK', e: '📖' },
  { w: 'LAMP', e: '💡' },
  { w: 'DOOR', e: '🚪' },

  // 5-letter words
  { w: 'APPLE', e: '🍎' },
  { w: 'BREAD', e: '🍞' },
  { w: 'PIZZA', e: '🍕' },
  { w: 'LEMON', e: '🍋' },
  { w: 'GRAPE', e: '🍇' },
  { w: 'PEACH', e: '🍑' },
  { w: 'WATER', e: '💧' },
  { w: 'HONEY', e: '🍯' },
  { w: 'HORSE', e: '🐴' },
  { w: 'MOUSE', e: '🐭' },
  { w: 'WHALE', e: '🐋' },
  { w: 'SHARK', e: '🦈' },
  { w: 'SNAKE', e: '🐍' },
  { w: 'SHEEP', e: '🐑' },
  { w: 'TIGER', e: '🐯' },
  { w: 'ZEBRA', e: '🦓' },
  { w: 'CLOUD', e: '☁️' },
  { w: 'RIVER', e: '🏞️' },
  { w: 'PLANT', e: '🪴' },
  { w: 'CHAIR', e: '🪑' },
  { w: 'HOUSE', e: '🏡' },
  { w: 'CLOCK', e: '🕰️' },

  // 6-letter words
  { w: 'BANANA', e: '🍌' },
  { w: 'ORANGE', e: '🍊' },
  { w: 'CARROT', e: '🥕' },
  { w: 'POTATO', e: '🥔' },
  { w: 'BURGER', e: '🍔' },
  { w: 'COOKIE', e: '🍪' },
  { w: 'CHEESE', e: '🧀' },
  { w: 'BUTTER', e: '🧈' },
  { w: 'RABBIT', e: '🐰' },
  { w: 'TURTLE', e: '🐢' },
  { w: 'MONKEY', e: '🐵' },
  { w: 'PARROT', e: '🦜' },
  { w: 'SPIDER', e: '🕷️' },
  { w: 'DRAGON', e: '🐉' },
  { w: 'FLOWER', e: '🌸' },
  { w: 'TOMATO', e: '🍅' },
  { w: 'ROCKET', e: '🚀' },
  { w: 'PENCIL', e: '✏️' },

  // 7-letter words
  { w: 'CHICKEN', e: '🐔' },
  { w: 'DOLPHIN', e: '🐬' },
  { w: 'GIRAFFE', e: '🦒' },
  { w: 'PENGUIN', e: '🐧' },
  { w: 'OCTOPUS', e: '🐙' },
  { w: 'RAINBOW', e: '🌈' },
  { w: 'COCONUT', e: '🥥' },
  { w: 'CABBAGE', e: '🥬' },
  { w: 'PUMPKIN', e: '🎃' },
  { w: 'AVOCADO', e: '🥑' },
  { w: 'PRETZEL', e: '🥨' },
];

const RAW_LONG_ESTONIAN_WORDS: readonly VocabularyWordBase[] = [
  { w: 'VIKERKAAR', e: '🌈' },
  { w: 'KAELKIRJAK', e: '🦒' },
  { w: 'KROKODILL', e: '🐊' },
  { w: 'MOTORRATAS', e: '🏍️' },
  { w: 'KÕRVAKLAPP', e: '🎧' },
  { w: 'TELESKOOP', e: '🔭' },
  { w: 'MIKROSKOOP', e: '🔬' },
  { w: 'AKVAARIUM', e: '🐠' },
  { w: 'KOOLIMAJA', e: '🏫' },
  { w: 'HAMBAHARI', e: '🪥' },
  { w: 'RULLUISUD', e: '🛼' },
  { w: 'PÄEVALILL', e: '🌻' },
  { w: 'VIHMAPILV', e: '🌧️' },
  { w: 'RONGIJAAM', e: '🚉' },
  { w: 'LENNUJAAM', e: '🛫' },
  { w: 'KAHEKSAJALG', e: '🐙' },
  { w: 'SÜLEARVUTI', e: '💻' },
  { w: 'PRÜGIKAST', e: '🗑️' },
  { w: 'JALGPALLUR', e: '⚽' },
  { w: 'JALGRATAS', e: '🚲' },
];

const RAW_LONG_ENGLISH_WORDS: readonly VocabularyWordBase[] = [
  { w: 'ELEPHANT', e: '🐘' },
  { w: 'DINOSAUR', e: '🦖' },
  { w: 'CROCODILE', e: '🐊' },
  { w: 'BUTTERFLY', e: '🦋' },
  { w: 'WATERMELON', e: '🍉' },
  { w: 'STRAWBERRY', e: '🍓' },
  { w: 'CHOCOLATE', e: '🍫' },
  { w: 'NOTEBOOK', e: '📓' },
  { w: 'COMPUTER', e: '💻' },
  { w: 'TELEPHONE', e: '☎️' },
  { w: 'TELESCOPE', e: '🔭' },
  { w: 'MICROSCOPE', e: '🔬' },
  { w: 'AMBULANCE', e: '🚑' },
  { w: 'FIRETRUCK', e: '🚒' },
  { w: 'MOTORCYCLE', e: '🏍️' },
  { w: 'SKATEBOARD', e: '🛹' },
  { w: 'HELICOPTER', e: '🚁' },
  { w: 'SUNFLOWER', e: '🌻' },
  { w: 'RAINCLOUD', e: '🌧️' },
  { w: 'AQUARIUM', e: '🐠' },
];

const VOCABULARY_METADATA_BY_FOCUS: Record<
  'short_words' | 'core_words' | 'longer_words',
  VocabularyWordMetadata
> = {
  short_words: {
    difficulty: 'easy',
    minLevel: 1,
    focus: 'short_words',
    learningOutcome: {
      et: 'Lühikeste 3-4-täheliste sõnade lugemine',
      en: 'Read short 3-4 letter words',
    },
  },
  core_words: {
    difficulty: 'medium',
    minLevel: 3,
    focus: 'core_words',
    learningOutcome: {
      et: '5-6-täheliste tuttavate sõnade lugemine',
      en: 'Read familiar 5-6 letter words',
    },
  },
  longer_words: {
    difficulty: 'hard',
    minLevel: 8,
    focus: 'longer_words',
    learningOutcome: {
      et: 'Pikemate sõnade lugemine ja tähtede järjestamine',
      en: 'Read and sequence longer words',
    },
  },
};

function vocabularyFocusForLength(length: number): VocabularyWordMetadata['focus'] {
  if (length <= 4) return 'short_words';
  if (length <= 6) return 'core_words';
  return 'longer_words';
}

function getVocabularyMetadata(word: VocabularyWordBase): VocabularyWordMetadata {
  return VOCABULARY_METADATA_BY_FOCUS[vocabularyFocusForLength(word.w.length)];
}

function hasVocabularyDiacritics(word: string): boolean {
  return /[ŠŽÕÄÖÜ]/i.test(word);
}

function uniqueNumbers(values: readonly number[]): number[] {
  return Array.from(new Set(values)).filter((value) => value >= 1);
}

function isUnlockedForLevel(word: VocabularyWord, level = 1): boolean {
  return level >= word.minLevel && (word.maxLevel === undefined || level <= word.maxLevel);
}

export function withVocabularyWordMetadata(
  words: readonly VocabularyWordBase[],
): readonly VocabularyWord[] {
  return words.map((word) => ({
    ...word,
    ...getVocabularyMetadata(word),
  }));
}

export function withLongVocabularyWordMetadata(
  words: readonly VocabularyWordBase[],
): readonly VocabularyWord[] {
  return withVocabularyWordMetadata(words).map((word) => ({
    ...word,
    minLevel: 1,
    learningOutcome: {
      et: 'Pikemate 8-11-täheliste sõnade lugemine Sõnakoses',
      en: 'Read longer 8-11 letter words in Word Cascade',
    },
  }));
}

export function getVocabularyWordLengthForLevel(level: number): number {
  if (level <= 2) return 3;
  if (level <= 4) return 4;
  if (level <= 7) return 5;
  if (level <= 9) return 6;
  return 7;
}

export function groupWordsByLength(
  items: readonly VocabularyWord[],
): Record<number, VocabularyWord[]> {
  return items.reduce<Record<number, VocabularyWord[]>>((acc, item) => {
    const len = item.w.length;
    if (!acc[len]) acc[len] = [];
    acc[len].push(item);
    return acc;
  }, {});
}

export function getVocabularyWordsForLength(
  items: readonly VocabularyWord[],
  desiredLength: number,
  level = 1,
  options: {
    fallbackLengths?: readonly number[];
    preferWithoutDiacritics?: boolean;
  } = {},
): VocabularyWord[] {
  const byLength = groupWordsByLength(items);
  const lengths = uniqueNumbers([
    desiredLength,
    ...(options.fallbackLengths ?? [desiredLength - 1, desiredLength + 1, 4, 3, 5, 6, 7]),
  ]);

  for (const length of lengths) {
    const unlocked = (byLength[length] ?? []).filter((word) => isUnlockedForLevel(word, level));
    if (unlocked.length === 0) continue;

    if (options.preferWithoutDiacritics) {
      const simpleWords = unlocked.filter((word) => !hasVocabularyDiacritics(word.w));
      if (simpleWords.length > 0) return simpleWords;
    }

    return unlocked;
  }

  return lengths.flatMap((length) => byLength[length] ?? []);
}

export function getVocabularyWordsForLevel(
  items: readonly VocabularyWord[],
  level = 1,
  options: { preferWithoutDiacritics?: boolean } = {},
): VocabularyWord[] {
  const desiredLength = getVocabularyWordLengthForLevel(level);
  const fallbackLengths = Array.from(
    { length: Math.max(0, desiredLength - 3) },
    (_, index) => desiredLength - index - 1,
  );
  return getVocabularyWordsForLength(items, desiredLength, level, {
    fallbackLengths: [...fallbackLengths, 4, 3, 5, 6, 7],
    ...options,
  });
}

export function getVocabularyWordsAvailableForLevel(
  items: readonly VocabularyWord[],
  level = 1,
): VocabularyWord[] {
  const unlocked = items.filter((word) => isUnlockedForLevel(word, level));
  return unlocked.length > 0 ? unlocked : [...items];
}

const ESTONIAN_WORDS = withVocabularyWordMetadata(RAW_ESTONIAN_WORDS);
const ENGLISH_WORDS = withVocabularyWordMetadata(RAW_ENGLISH_WORDS);
const LONG_ESTONIAN_WORDS = withLongVocabularyWordMetadata(RAW_LONG_ESTONIAN_WORDS);
const LONG_ENGLISH_WORDS = withLongVocabularyWordMetadata(RAW_LONG_ENGLISH_WORDS);

export const LANGUAGE_VOCABULARY_ET_PACK: ContentPack<VocabularyWord> = {
  id: 'language.vocabulary.et',
  skillId: LANGUAGE_VOCABULARY_SKILL.id,
  locale: 'et',
  version: '1.1.0',
  title: {
    et: 'Eesti sõnavara',
    en: 'Estonian vocabulary',
  },
  items: ESTONIAN_WORDS,
};

export const LANGUAGE_VOCABULARY_EN_PACK: ContentPack<VocabularyWord> = {
  id: 'language.vocabulary.en',
  skillId: LANGUAGE_VOCABULARY_SKILL.id,
  locale: 'en',
  version: '1.1.0',
  title: {
    et: 'Inglise sõnavara',
    en: 'English vocabulary',
  },
  items: ENGLISH_WORDS,
};

export const LANGUAGE_LONG_VOCABULARY_ET_PACK: ContentPack<VocabularyWord> = {
  id: 'language.vocabulary.long_words.et',
  skillId: LANGUAGE_LONG_VOCABULARY_SKILL.id,
  locale: 'et',
  version: '1.0.0',
  title: {
    et: 'Pikad sõnad',
    en: 'Long Estonian words',
  },
  items: LONG_ESTONIAN_WORDS,
};

export const LANGUAGE_LONG_VOCABULARY_EN_PACK: ContentPack<VocabularyWord> = {
  id: 'language.vocabulary.long_words.en',
  skillId: LANGUAGE_LONG_VOCABULARY_SKILL.id,
  locale: 'en',
  version: '1.0.0',
  title: {
    et: 'Pikad inglise sõnad',
    en: 'Long English words',
  },
  items: LONG_ENGLISH_WORDS,
};
