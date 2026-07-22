/**
 * Translations for sentence_logic game objects and positions
 * Supports Estonian and English
 */

import type { ContentPack, LocaleCode } from '../../types';
import { LANGUAGE_SPATIAL_SENTENCES_SKILL } from '../../skills/language';
import type { Difficulty, Scene, SceneSubject, SceneAnchor } from '../../../types/game';

export type SpatialSentenceFocus =
  'core_prepositions' | 'five_position_context' | 'inside_container_context';

export interface SpatialSentenceMetadata {
  difficulty: Difficulty;
  minLevel: number;
  maxLevel?: number;
  focus: SpatialSentenceFocus;
  learningOutcome: Record<LocaleCode, string>;
}

export type SpatialSentenceScene = Scene & SpatialSentenceMetadata & { id: string };

// English translations for Estonian object names
const OBJECT_TRANSLATIONS: Record<string, { en: string }> = {
  // Subjects
  REBANE: { en: 'Fox' },
  JÄNES: { en: 'Rabbit' },
  KARU: { en: 'Bear' },
  SIIL: { en: 'Hedgehog' },
  ORAV: { en: 'Squirrel' },
  HUNT: { en: 'Wolf' },
  PÕDER: { en: 'Moose' },
  KITS: { en: 'Goat' },
  HIRV: { en: 'Deer' },
  KONN: { en: 'Frog' },
  RAKETT: { en: 'Rocket' },
  UFO: { en: 'UFO' },
  ASTRONAUT: { en: 'Astronaut' },
  TÄHT: { en: 'Star' },
  PLANEET: { en: 'Planet' },
  KOMEET: { en: 'Comet' },
  SATELLIIT: { en: 'Satellite' },
  AUTO: { en: 'Car' },
  BUSS: { en: 'Bus' },
  PALL: { en: 'Ball' },
  KASS: { en: 'Cat' },
  KOER: { en: 'Dog' },
  ROBOT: { en: 'Robot' },
  PUSLE: { en: 'Puzzle' },
  RAAMAT: { en: 'Book' },
  RAAMATUD: { en: 'Books' },
  LAPS: { en: 'Child' },
  RATAS: { en: 'Bicycle' },
  ÕHUPALL: { en: 'Balloon' },
  KELK: { en: 'Sled' },
  KREVETT: { en: 'Shrimp' },
  KRABI: { en: 'Crab' },
  MERIKARP: { en: 'Shell' },
  ÕUN: { en: 'Apple' },
  LEIB: { en: 'Bread' },
  KÜPSIS: { en: 'Cookie' },
  KOKK: { en: 'Chef' },
  KARTUL: { en: 'Potato' },
  TOMAT: { en: 'Tomato' },
  MUNA: { en: 'Egg' },
  ÕPILANE: { en: 'Student' },
  ÕPETAJA: { en: 'Teacher' },
  PLIIATS: { en: 'Pencil' },
  KALKULAATOR: { en: 'Calculator' },
  KUSTUTI: { en: 'Eraser' },
  ÕPIK: { en: 'Textbook' },
  NUMBRID: { en: 'Numbers' },
  LUUD: { en: 'Broom' },
  // Farm subjects
  LEHM: { en: 'Cow' },
  LAMMAS: { en: 'Sheep' },
  KANA: { en: 'Hen' },
  SIGA: { en: 'Pig' },
  HOBUNE: { en: 'Horse' },
  // Underwater subjects
  KALA: { en: 'Fish' },
  HAI: { en: 'Shark' },
  VAAL: { en: 'Whale' },
  KAHEKSAJALG: { en: 'Octopus' },
  // Garden subjects
  TIBU: { en: 'Chick' },
  LIBLIKAS: { en: 'Butterfly' },
  // Bathroom subjects
  KUMMIPART: { en: 'Rubber duck' },
  RÄTIK: { en: 'Towel' },
  // Sports subjects
  TREENER: { en: 'Coach' },
  // Winter subjects
  LUMEMEMM: { en: 'Snowman' },
  // Station subjects
  KOHVER: { en: 'Suitcase' },
  // Cellar subjects
  HIIR: { en: 'Mouse' },
  ÄMBLIK: { en: 'Spider' },
  // Music subjects
  KITARR: { en: 'Guitar' },
  TROMMEL: { en: 'Drum' },
  PUHKPILL: { en: 'Saxophone' },

  // Anchors
  PUU: { en: 'Tree' },
  KIVI: { en: 'Stone' },
  PÕÕSAS: { en: 'Bush' },
  SEEN: { en: 'Mushroom' },
  KÄND: { en: 'Stump' },
  JÕGI: { en: 'River' },
  LEHT: { en: 'Leaf' },
  MAA: { en: 'Ground' },
  KUU: { en: 'Moon' },
  PÄIKE: { en: 'Sun' },
  KARP: { en: 'Box' },
  VOODI: { en: 'Bed' },
  TOOL: { en: 'Chair' },
  DIIVAN: { en: 'Sofa' },
  KAPP: { en: 'Cupboard' },
  RIIUL: { en: 'Shelf' },
  AKEN: { en: 'Window' },
  LAUD: { en: 'Table' },
  TAHVEL: { en: 'Board' },
  TABEL: { en: 'Chart' },
  LILL: { en: 'Flower' },
  TEKK: { en: 'Blanket' },
  LIIV: { en: 'Sand' },
  MERI: { en: 'Sea' },
  RAND: { en: 'Beach' },
  PÄIKESEVARI: { en: 'Umbrella' },
  PLIIT: { en: 'Stove' },
  KÜLMIK: { en: 'Refrigerator' },
  LAMP: { en: 'Lamp' },
  FOOR: { en: 'Traffic Light' },
  PUIESTEE: { en: 'Sidewalk' },
  // Farm anchors
  KÜÜN: { en: 'Barn' },
  HEIN: { en: 'Hay' },
  AED: { en: 'Fence' },
  // Playground anchors
  KIIK: { en: 'Swing' },
  LIUMÄGI: { en: 'Slide' },
  LIIVAKAST: { en: 'Sandbox' },
  RONILA: { en: 'Climbing frame' },
  // Underwater anchors
  KORALL: { en: 'Coral' },
  LAEV: { en: 'Shipwreck' },
  // Garden anchors
  MURU: { en: 'Lawn' },
  KASTEKANN: { en: 'Watering can' },
  // Bathroom anchors
  VANN: { en: 'Bathtub' },
  PEEGEL: { en: 'Mirror' },
  KRAANIKAUSS: { en: 'Sink' },
  // Sports anchors
  VÄRAV: { en: 'Goal' },
  KORV: { en: 'Basket' },
  PINK: { en: 'Bench' },
  // Winter anchors
  KUUSK: { en: 'Spruce' },
  MÄGI: { en: 'Hill' },
  JÄRV: { en: 'Lake' },
  // Cafe anchors
  TASS: { en: 'Cup' },
  TALDRIK: { en: 'Plate' },
  // Wardrobe anchors
  SAHTEL: { en: 'Drawer' },
  // Station anchors
  RONG: { en: 'Train' },
  KELL: { en: 'Clock' },
  // Cellar anchors
  PURK: { en: 'Jar' },
  // Music anchors
  KLAVER: { en: 'Piano' },
  PULT: { en: 'Stand' },
};

// Position translations
const POSITION_TRANSLATIONS: Record<string, { et: string; en: string }> = {
  NEXT_TO: { et: 'kõrval', en: 'next to' },
  ON: { et: 'kohal', en: 'on' },
  UNDER: { et: 'all', en: 'under' },
  IN_FRONT: { et: 'ees', en: 'in front of' },
  BEHIND: { et: 'taga', en: 'behind' },
  INSIDE: { et: 'sees', en: 'inside' },
};

// Get English form for anchor (simplified - no cases in English)
function getAnchorEnglishForm(anchor: SceneAnchor, _position: string): string {
  // For English, we use simple preposition structure
  // "next to the tree", "on the tree", "under the tree", etc.
  const baseName = OBJECT_TRANSLATIONS[anchor.n]?.en || anchor.n;
  return baseName.toLowerCase();
}

// Scene name translations - map English keys to localized names
const SCENE_NAME_TRANSLATIONS: Record<string, { et: string }> = {
  Forest: { et: 'Mets' },
  Space: { et: 'Kosmos' },
  Room: { et: 'Tuba' },
  School: { et: 'Kool' },
  Park: { et: 'Park' },
  Beach: { et: 'Rand' },
  Kitchen: { et: 'Köök' },
  Street: { et: 'Tänav' },
  Farm: { et: 'Talu' },
  Playground: { et: 'Mängumaa' },
  Underwater: { et: 'Veealune' },
  Garden: { et: 'Aed' },
  Bathroom: { et: 'Vannituba' },
  Sports: { et: 'Spordiväljak' },
  Winter: { et: 'Talv' },
  Cafe: { et: 'Kohvik' },
  Wardrobe: { et: 'Garderoob' },
  Station: { et: 'Rongijaam' },
  Cellar: { et: 'Kelder' },
  Music: { et: 'Muusikatuba' },
};

/**
 * Get localized scene name
 *
 * This function translates scene names from English keys to the target locale.
 * The English keys (e.g., 'Forest', 'Kitchen') serve as both the base identifier
 * and the English translation. For Estonian, it looks up the translation.
 *
 * @param sceneKey - English scene key (e.g., 'Forest', 'Kitchen', 'Space')
 * @param locale - Target locale: 'et' for Estonian, 'en' for English (default: 'et')
 * @returns Localized scene name - returns the English key for 'en' locale,
 *          or the Estonian translation for 'et' locale
 *
 * @example
 * getSceneName('Forest', 'en') // Returns: 'Forest'
 * getSceneName('Forest', 'et') // Returns: 'Mets'
 * getSceneName('Kitchen', 'en') // Returns: 'Kitchen'
 * getSceneName('Kitchen', 'et') // Returns: 'Köök'
 */
export function getSceneName(sceneKey: string, locale: 'et' | 'en' = 'et'): string {
  if (locale === 'en') {
    // For English, the key itself is the name
    return sceneKey;
  }
  // For Estonian, look up the translation
  const translation = SCENE_NAME_TRANSLATIONS[sceneKey];
  return translation ? translation.et : sceneKey;
}

// Get subject English name
function getSubjectEnglishName(subject: SceneSubject): string {
  return OBJECT_TRANSLATIONS[subject.n]?.en || subject.n;
}

// Generate sentence based on language
export function generateSentence(
  subject: SceneSubject,
  anchor: SceneAnchor,
  position: string,
  locale: 'et' | 'en' = 'et',
): string {
  if (locale === 'en') {
    const subjectName = getSubjectEnglishName(subject);
    const anchorName = getAnchorEnglishForm(anchor, position);
    const positionText = POSITION_TRANSLATIONS[position]?.en || position.toLowerCase();

    // English sentence structure: "Subject is position the anchor."
    // e.g., "Rocket is in front of the planet."
    return `${subjectName} is ${positionText} the ${anchorName}.`;
  } else {
    // Estonian sentence structure
    const isInside = position === 'INSIDE';
    const anchorForm = isInside ? anchor.iness : anchor.genitive;
    const positionText = POSITION_TRANSLATIONS[position]?.et || position.toLowerCase();
    return `${subject.n} ON ${anchorForm} ${positionText}.`;
  }
}

export const SCENE_DB = {
  forest: {
    bg: 'bg-gradient-to-b from-green-200 to-green-300',
    name: 'Forest',
    subjects: [
      { n: 'REBANE', e: '🦊' },
      { n: 'JÄNES', e: '🐰' },
      { n: 'KARU', e: '🐻' },
      { n: 'SIIL', e: '🦔' },
      { n: 'ORAV', e: '🐿️' },
      { n: 'HUNT', e: '🐺' },
      { n: 'PÕDER', e: '🫎' },
      { n: 'KITS', e: '🐐' },
      { n: 'HIRV', e: '🦌' },
      { n: 'KONN', e: '🐸' },
    ],
    anchors: [
      { n: 'PUU', adess: 'PUUL', iness: 'PUUS', genitive: 'PUU', e: '🌳' },
      { n: 'KIVI', adess: 'KIVIL', iness: 'KIVIS', genitive: 'KIVI', e: '🪨' },
      { n: 'LEHT', adess: 'LEHEL', iness: 'LEHES', genitive: 'LEHE', e: '🍃' },
      { n: 'SEEN', adess: 'SEENEL', iness: 'SEENES', genitive: 'SEENE', e: '🍄' },
      { n: 'KÄND', adess: 'KÄNNUL', iness: 'KÄNNUS', genitive: 'KÄNNU', e: '🪵' },
      { n: 'JÕGI', adess: 'JÕEL', iness: 'JÕES', genitive: 'JÕE', e: '🏞️' },
    ],
    positions: ['IN_FRONT', 'BEHIND', 'NEXT_TO', 'ON', 'UNDER'],
  },
  space: {
    bg: 'bg-gradient-to-b from-slate-800 via-purple-900 to-slate-900',
    name: 'Space',
    subjects: [
      { n: 'RAKETT', e: '🚀' },
      { n: 'UFO', e: '🛸' },
      { n: 'ASTRONAUT', e: '👨‍🚀' },
      { n: 'TÄHT', e: '⭐' },
      { n: 'PLANEET', e: '🪐' },
      { n: 'KOMEET', e: '☄️' },
      { n: 'SATELLIIT', e: '🛰️' },
    ],
    anchors: [
      { n: 'MAA', adess: 'MAAL', iness: 'MAAS', genitive: 'MAA', e: '🌍' },
      { n: 'KUU', adess: 'KUUL', iness: 'KUUS', genitive: 'KUU', e: '🌙' },
      { n: 'PÄIKE', adess: 'PÄIKESEL', iness: 'PÄIKESES', genitive: 'PÄIKESE', e: '☀️' },
      { n: 'PLANEET', adess: 'PLANEEDIL', iness: 'PLANEEDIS', genitive: 'PLANEEDI', e: '🪐' },
    ],
    positions: ['ON', 'UNDER', 'NEXT_TO', 'IN_FRONT'],
  },
  room: {
    bg: 'bg-gradient-to-b from-orange-50 to-yellow-50',
    name: 'Room',
    subjects: [
      { n: 'AUTO', e: '🚗' },
      { n: 'PALL', e: '⚽' },
      { n: 'KARU', e: '🧸' },
      { n: 'KASS', e: '🐱' },
      { n: 'KOER', e: '🐶' },
      { n: 'ROBOT', e: '🤖' },
      { n: 'PUSLE', e: '🧩' },
      { n: 'RAAMAT', e: '📖' },
    ],
    anchors: [
      { n: 'KARP', adess: 'KARBIL', iness: 'KARBIS', genitive: 'KARBI', e: '📦' },
      { n: 'VOODI', adess: 'VOODIL', iness: 'VOODIS', genitive: 'VOODI', e: '🛏️' },
      { n: 'TOOL', adess: 'TOOLIL', iness: 'TOOLIS', genitive: 'TOOLI', e: '🪑' },
      { n: 'DIIVAN', adess: 'DIIVANIL', iness: 'DIIVANIS', genitive: 'DIIVANI', e: '🛋️' },
      { n: 'KAPP', adess: 'KAPIL', iness: 'KAPIS', genitive: 'KAPI', e: '📦' },
      { n: 'AKEN', adess: 'AKNAL', iness: 'AKNAS', genitive: 'AKNA', e: '🪟' },
      { n: 'RIIUL', adess: 'RIIULIL', iness: 'RIIULIS', genitive: 'RIIULI', e: '🗄️' },
    ],
    positions: ['INSIDE', 'ON', 'UNDER', 'NEXT_TO', 'IN_FRONT', 'BEHIND'],
  },
  school: {
    bg: 'bg-gradient-to-b from-blue-100 to-blue-200',
    name: 'School',
    subjects: [
      { n: 'ÕPILANE', e: '👨‍🎓' },
      { n: 'ÕPETAJA', e: '🧑‍🏫' },
      { n: 'RAAMAT', e: '📖' },
      { n: 'PLIIATS', e: '✏️' },
      { n: 'NUMBRID', e: '🔢' },
      { n: 'LUUD', e: '🧹' },
      { n: 'ÕPIK', e: '📘' },
    ],
    anchors: [
      { n: 'AKEN', adess: 'AKNAL', iness: 'AKNAS', genitive: 'AKNA', e: '🪟' },
      { n: 'TAHVEL', adess: 'TAHVLIL', iness: 'TAHVLIS', genitive: 'TAHVLI', e: '📺' },
      { n: 'TABEL', adess: 'TABELIL', iness: 'TABELIS', genitive: 'TABELI', e: '📋' },
      { n: 'KAPP', adess: 'KAPIL', iness: 'KAPIS', genitive: 'KAPI', e: '📦' },
      { n: 'TOOL', adess: 'TOOLIL', iness: 'TOOLIS', genitive: 'TOOLI', e: '🪑' },
      { n: 'RIIUL', adess: 'RIIULIL', iness: 'RIIULIS', genitive: 'RIIULI', e: '🗄️' },
    ],
    positions: ['ON', 'UNDER', 'NEXT_TO', 'IN_FRONT', 'BEHIND', 'INSIDE'],
  },
  park: {
    bg: 'bg-gradient-to-b from-emerald-100 to-emerald-200',
    name: 'Park',
    subjects: [
      { n: 'LAPS', e: '🧒' },
      { n: 'KOER', e: '🐶' },
      { n: 'PALL', e: '⚽' },
      { n: 'RATAS', e: '🚲' },
      { n: 'ÕHUPALL', e: '🎈' },
      { n: 'KELK', e: '🛷' },
      { n: 'JÄNES', e: '🐰' },
    ],
    anchors: [
      { n: 'TOOL', adess: 'TOOLIL', iness: 'TOOLIS', genitive: 'TOOLI', e: '🪑' },
      { n: 'PUU', adess: 'PUUL', iness: 'PUUS', genitive: 'PUU', e: '🌳' },
      { n: 'LILL', adess: 'LILLEL', iness: 'LILLES', genitive: 'LILLE', e: '🌸' },
      { n: 'VOODI', adess: 'VOODIL', iness: 'VOODIS', genitive: 'VOODI', e: '🛌' },
      { n: 'KIVI', adess: 'KIVIL', iness: 'KIVIS', genitive: 'KIVI', e: '🪨' },
      { n: 'KÄND', adess: 'KÄNNUL', iness: 'KÄNNUS', genitive: 'KÄNNU', e: '🪵' },
    ],
    positions: ['ON', 'UNDER', 'NEXT_TO', 'IN_FRONT', 'BEHIND', 'INSIDE'],
  },
  beach: {
    bg: 'bg-gradient-to-b from-cyan-200 to-blue-300',
    name: 'Beach',
    subjects: [
      { n: 'LAPS', e: '🧒' },
      { n: 'PALL', e: '⚽' },
      { n: 'MERIKARP', e: '🐚' },
      { n: 'ÕHUPALL', e: '🎈' },
      { n: 'KREVETT', e: '🦐' },
      { n: 'KRABI', e: '🦀' },
    ],
    anchors: [
      { n: 'RAND', adess: 'RANNAL', iness: 'RANNAS', genitive: 'RANNA', e: '🏖️' },
      { n: 'MERI', adess: 'MEREL', iness: 'MERES', genitive: 'MERE', e: '🌊' },
      { n: 'KIVI', adess: 'KIVIL', iness: 'KIVIS', genitive: 'KIVI', e: '🪨' },
      {
        n: 'PÄIKESEVARI',
        adess: 'PÄIKESEVARJUL',
        iness: 'PÄIKESEVARJUS',
        genitive: 'PÄIKESEVARJU',
        e: '⛱️',
      },
    ],
    positions: ['ON', 'UNDER', 'NEXT_TO', 'IN_FRONT', 'INSIDE'],
  },
  kitchen: {
    bg: 'bg-gradient-to-b from-yellow-50 to-orange-50',
    name: 'Kitchen',
    subjects: [
      { n: 'ÕUN', e: '🍎' },
      { n: 'LEIB', e: '🥖' },
      { n: 'KÜPSIS', e: '🍪' },
      { n: 'KOKK', e: '👨‍🍳' },
      { n: 'KARTUL', e: '🥔' },
      { n: 'TOMAT', e: '🍅' },
      { n: 'MUNA', e: '🥚' },
    ],
    anchors: [
      { n: 'AKEN', adess: 'AKNAL', iness: 'AKNAS', genitive: 'AKNA', e: '🪟' },
      { n: 'PLIIT', adess: 'PLIIDIL', iness: 'PLIIDIS', genitive: 'PLIIDI', e: '🍳' },
      { n: 'KAPP', adess: 'KAPIL', iness: 'KAPIS', genitive: 'KAPI', e: '📦' },
      { n: 'KÜLMIK', adess: 'KÜLMIKUL', iness: 'KÜLMIKUS', genitive: 'KÜLMIKU', e: '❄️' },
      { n: 'RIIUL', adess: 'RIIULIL', iness: 'RIIULIS', genitive: 'RIIULI', e: '🗄️' },
      { n: 'KARP', adess: 'KARBIL', iness: 'KARBIS', genitive: 'KARBI', e: '📦' },
    ],
    positions: ['ON', 'UNDER', 'NEXT_TO', 'IN_FRONT', 'BEHIND', 'INSIDE'],
  },
  street: {
    bg: 'bg-gradient-to-b from-gray-200 to-gray-300',
    name: 'Street',
    subjects: [
      { n: 'AUTO', e: '🚗' },
      { n: 'BUSS', e: '🚌' },
      { n: 'RATAS', e: '🚲' },
      { n: 'LAPS', e: '🧒' },
      { n: 'KOER', e: '🐶' },
      { n: 'PALL', e: '⚽' },
    ],
    anchors: [
      { n: 'MAA', adess: 'MAAL', iness: 'MAAS', genitive: 'MAA', e: '🛣️' },
      { n: 'KIVI', adess: 'KIVIL', iness: 'KIVIS', genitive: 'KIVI', e: '🪨' },
      { n: 'LAMP', adess: 'LAMBIL', iness: 'LAMBIS', genitive: 'LAMBI', e: '💡' },
      { n: 'FOOR', adess: 'FOORIL', iness: 'FOORIS', genitive: 'FOORI', e: '🚦' },
    ],
    positions: ['ON', 'UNDER', 'NEXT_TO', 'IN_FRONT', 'BEHIND'],
  },
  farm: {
    bg: 'bg-gradient-to-b from-amber-100 to-lime-200',
    name: 'Farm',
    subjects: [
      { n: 'LEHM', e: '🐄' },
      { n: 'LAMMAS', e: '🐑' },
      { n: 'KANA', e: '🐔' },
      { n: 'SIGA', e: '🐖' },
      { n: 'HOBUNE', e: '🐎' },
      { n: 'KOER', e: '🐶' },
      { n: 'KASS', e: '🐱' },
    ],
    anchors: [
      { n: 'KÜÜN', adess: 'KÜÜNIL', iness: 'KÜÜNIS', genitive: 'KÜÜNI', e: '🏚️' },
      { n: 'HEIN', adess: 'HEINAL', iness: 'HEINAS', genitive: 'HEINA', e: '🌾' },
      { n: 'AED', adess: 'AIAL', iness: 'AIAS', genitive: 'AIA', e: '🚧' },
      { n: 'PUU', adess: 'PUUL', iness: 'PUUS', genitive: 'PUU', e: '🌳' },
    ],
    positions: ['ON', 'UNDER', 'NEXT_TO', 'IN_FRONT'],
  },
  playground: {
    bg: 'bg-gradient-to-b from-yellow-100 to-orange-200',
    name: 'Playground',
    subjects: [
      { n: 'LAPS', e: '🧒' },
      { n: 'JÄNES', e: '🐰' },
      { n: 'KASS', e: '🐱' },
      { n: 'PALL', e: '⚽' },
      { n: 'TIBU', e: '🐤' },
    ],
    anchors: [
      { n: 'KIIK', adess: 'KIIGEL', iness: 'KIIGES', genitive: 'KIIGE', e: '🎠' },
      { n: 'LIUMÄGI', adess: 'LIUMÄEL', iness: 'LIUMÄES', genitive: 'LIUMÄE', e: '🛝' },
      {
        n: 'LIIVAKAST',
        adess: 'LIIVAKASTIL',
        iness: 'LIIVAKASTIS',
        genitive: 'LIIVAKASTI',
        e: '🏖️',
      },
      { n: 'RONILA', adess: 'RONILAL', iness: 'RONILAS', genitive: 'RONILA', e: '🧗' },
    ],
    positions: ['ON', 'UNDER', 'NEXT_TO', 'IN_FRONT'],
  },
  underwater: {
    bg: 'bg-gradient-to-b from-cyan-300 via-sky-500 to-blue-700',
    name: 'Underwater',
    subjects: [
      { n: 'KALA', e: '🐠' },
      { n: 'HAI', e: '🦈' },
      { n: 'VAAL', e: '🐋' },
      { n: 'KAHEKSAJALG', e: '🐙' },
      { n: 'KRABI', e: '🦀' },
      { n: 'KREVETT', e: '🦐' },
    ],
    anchors: [
      { n: 'KORALL', adess: 'KORALLIL', iness: 'KORALLIS', genitive: 'KORALLI', e: '🪸' },
      { n: 'KIVI', adess: 'KIVIL', iness: 'KIVIS', genitive: 'KIVI', e: '🪨' },
      { n: 'LAEV', adess: 'LAEVAL', iness: 'LAEVAS', genitive: 'LAEVA', e: '🚢' },
      { n: 'MERIKARP', adess: 'MERIKARBIL', iness: 'MERIKARBIS', genitive: 'MERIKARBI', e: '🐚' },
    ],
    positions: ['ON', 'UNDER', 'NEXT_TO', 'IN_FRONT'],
  },
  garden: {
    bg: 'bg-gradient-to-b from-lime-100 to-emerald-300',
    name: 'Garden',
    subjects: [
      { n: 'TIBU', e: '🐤' },
      { n: 'JÄNES', e: '🐰' },
      { n: 'LIBLIKAS', e: '🦋' },
      { n: 'KASS', e: '🐱' },
      { n: 'KONN', e: '🐸' },
    ],
    anchors: [
      { n: 'LILL', adess: 'LILLEL', iness: 'LILLES', genitive: 'LILLE', e: '🌸' },
      { n: 'MURU', adess: 'MURUL', iness: 'MURUS', genitive: 'MURU', e: '🌱' },
      { n: 'PUU', adess: 'PUUL', iness: 'PUUS', genitive: 'PUU', e: '🌳' },
      {
        n: 'KASTEKANN',
        adess: 'KASTEKANNUL',
        iness: 'KASTEKANNUS',
        genitive: 'KASTEKANNU',
        e: '🪴',
      },
    ],
    positions: ['ON', 'UNDER', 'NEXT_TO', 'IN_FRONT', 'BEHIND'],
  },
  bathroom: {
    bg: 'bg-gradient-to-b from-sky-100 to-cyan-200',
    name: 'Bathroom',
    subjects: [
      { n: 'KASS', e: '🐱' },
      { n: 'KUMMIPART', e: '🦆' },
      { n: 'RÄTIK', e: '🧻' },
      { n: 'KÜPSIS', e: '🧼' },
      { n: 'LAPS', e: '🧒' },
    ],
    anchors: [
      { n: 'VANN', adess: 'VANNIL', iness: 'VANNIS', genitive: 'VANNI', e: '🛁' },
      { n: 'PEEGEL', adess: 'PEEGLIL', iness: 'PEEGLIS', genitive: 'PEEGLI', e: '🪞' },
      {
        n: 'KRAANIKAUSS',
        adess: 'KRAANIKAUSIL',
        iness: 'KRAANIKAUSIS',
        genitive: 'KRAANIKAUSI',
        e: '🚰',
      },
      { n: 'RIIUL', adess: 'RIIULIL', iness: 'RIIULIS', genitive: 'RIIULI', e: '🗄️' },
    ],
    positions: ['ON', 'UNDER', 'NEXT_TO', 'IN_FRONT', 'INSIDE'],
  },
  sports: {
    bg: 'bg-gradient-to-b from-green-300 to-emerald-400',
    name: 'Sports',
    subjects: [
      { n: 'LAPS', e: '🧒' },
      { n: 'PALL', e: '⚽' },
      { n: 'KOER', e: '🐶' },
      { n: 'TREENER', e: '🧑‍🏫' },
    ],
    anchors: [
      { n: 'VÄRAV', adess: 'VÄRAVAL', iness: 'VÄRAVAS', genitive: 'VÄRAVA', e: '🥅' },
      { n: 'KORV', adess: 'KORVIL', iness: 'KORVIS', genitive: 'KORVI', e: '🧺' },
      { n: 'PINK', adess: 'PINGIL', iness: 'PINGIS', genitive: 'PINGI', e: '🪑' },
      { n: 'MAA', adess: 'MAAL', iness: 'MAAS', genitive: 'MAA', e: '🟢' },
    ],
    positions: ['ON', 'UNDER', 'NEXT_TO', 'IN_FRONT', 'BEHIND'],
  },
  winter: {
    bg: 'bg-gradient-to-b from-slate-100 to-sky-200',
    name: 'Winter',
    subjects: [
      { n: 'LUMEMEMM', e: '☃️' },
      { n: 'JÄNES', e: '🐰' },
      { n: 'KELK', e: '🛷' },
      { n: 'LAPS', e: '🧒' },
      { n: 'KOER', e: '🐶' },
    ],
    anchors: [
      { n: 'KUUSK', adess: 'KUUSEL', iness: 'KUUSES', genitive: 'KUUSE', e: '🌲' },
      { n: 'MÄGI', adess: 'MÄEL', iness: 'MÄES', genitive: 'MÄE', e: '⛰️' },
      { n: 'JÄRV', adess: 'JÄRVEL', iness: 'JÄRVES', genitive: 'JÄRVE', e: '🧊' },
      { n: 'KIVI', adess: 'KIVIL', iness: 'KIVIS', genitive: 'KIVI', e: '🪨' },
    ],
    positions: ['ON', 'UNDER', 'NEXT_TO', 'IN_FRONT', 'BEHIND'],
  },
  cafe: {
    bg: 'bg-gradient-to-b from-amber-50 to-orange-100',
    name: 'Cafe',
    subjects: [
      { n: 'KASS', e: '🐱' },
      { n: 'KOER', e: '🐶' },
      { n: 'LAPS', e: '🧒' },
      { n: 'ÕUN', e: '🍎' },
      { n: 'KÜPSIS', e: '🍪' },
    ],
    anchors: [
      { n: 'TASS', adess: 'TASSIL', iness: 'TASSIS', genitive: 'TASSI', e: '☕' },
      { n: 'TALDRIK', adess: 'TALDRIKUL', iness: 'TALDRIKUS', genitive: 'TALDRIKU', e: '🍽️' },
      { n: 'LAUD', adess: 'LAUAL', iness: 'LAUAS', genitive: 'LAUA', e: '🪑' },
      { n: 'KARP', adess: 'KARBIL', iness: 'KARBIS', genitive: 'KARBI', e: '📦' },
    ],
    positions: ['ON', 'UNDER', 'NEXT_TO', 'IN_FRONT', 'BEHIND', 'INSIDE'],
  },
  wardrobe: {
    bg: 'bg-gradient-to-b from-rose-50 to-pink-100',
    name: 'Wardrobe',
    subjects: [
      { n: 'KARU', e: '🧸' },
      { n: 'ROBOT', e: '🤖' },
      { n: 'PALL', e: '⚽' },
      { n: 'KASS', e: '🐱' },
    ],
    anchors: [
      { n: 'KAPP', adess: 'KAPIL', iness: 'KAPIS', genitive: 'KAPI', e: '🚪' },
      { n: 'KARP', adess: 'KARBIL', iness: 'KARBIS', genitive: 'KARBI', e: '📦' },
      { n: 'RIIUL', adess: 'RIIULIL', iness: 'RIIULIS', genitive: 'RIIULI', e: '🗄️' },
      { n: 'SAHTEL', adess: 'SAHTLIL', iness: 'SAHTLIS', genitive: 'SAHTLI', e: '🗃️' },
    ],
    positions: ['ON', 'NEXT_TO', 'IN_FRONT', 'BEHIND', 'INSIDE'],
  },
  station: {
    bg: 'bg-gradient-to-b from-slate-200 to-zinc-300',
    name: 'Station',
    subjects: [
      { n: 'LAPS', e: '🧒' },
      { n: 'KOER', e: '🐶' },
      { n: 'KOHVER', e: '🧳' },
      { n: 'KASS', e: '🐱' },
    ],
    anchors: [
      { n: 'RONG', adess: 'RONGIL', iness: 'RONGIS', genitive: 'RONGI', e: '🚂' },
      { n: 'PINK', adess: 'PINGIL', iness: 'PINGIS', genitive: 'PINGI', e: '🪑' },
      { n: 'KARP', adess: 'KARBIL', iness: 'KARBIS', genitive: 'KARBI', e: '📦' },
      { n: 'KELL', adess: 'KELLAL', iness: 'KELLAS', genitive: 'KELLA', e: '🕰️' },
    ],
    positions: ['ON', 'UNDER', 'NEXT_TO', 'IN_FRONT', 'BEHIND', 'INSIDE'],
  },
  cellar: {
    bg: 'bg-gradient-to-b from-stone-300 to-stone-500',
    name: 'Cellar',
    subjects: [
      { n: 'KASS', e: '🐱' },
      { n: 'HIIR', e: '🐭' },
      { n: 'ÄMBLIK', e: '🕷️' },
      { n: 'KARU', e: '🧸' },
    ],
    anchors: [
      { n: 'PURK', adess: 'PURGIL', iness: 'PURGIS', genitive: 'PURGI', e: '🫙' },
      { n: 'KORV', adess: 'KORVIL', iness: 'KORVIS', genitive: 'KORVI', e: '🧺' },
      { n: 'KAPP', adess: 'KAPIL', iness: 'KAPIS', genitive: 'KAPI', e: '🚪' },
      { n: 'KARP', adess: 'KARBIL', iness: 'KARBIS', genitive: 'KARBI', e: '📦' },
    ],
    positions: ['ON', 'UNDER', 'NEXT_TO', 'IN_FRONT', 'BEHIND', 'INSIDE'],
  },
  music: {
    bg: 'bg-gradient-to-b from-violet-100 to-fuchsia-200',
    name: 'Music',
    subjects: [
      { n: 'KITARR', e: '🎸' },
      { n: 'TROMMEL', e: '🥁' },
      { n: 'PUHKPILL', e: '🎷' },
      { n: 'LAPS', e: '🧒' },
      { n: 'KASS', e: '🐱' },
    ],
    anchors: [
      { n: 'KLAVER', adess: 'KLAVERIL', iness: 'KLAVERIS', genitive: 'KLAVERI', e: '🎹' },
      { n: 'PULT', adess: 'PULDIL', iness: 'PULDIS', genitive: 'PULDI', e: '🎤' },
      { n: 'RIIUL', adess: 'RIIULIL', iness: 'RIIULIS', genitive: 'RIIULI', e: '🗄️' },
      { n: 'KORV', adess: 'KORVIL', iness: 'KORVIS', genitive: 'KORVI', e: '🧺' },
    ],
    positions: ['ON', 'UNDER', 'NEXT_TO', 'IN_FRONT', 'BEHIND', 'INSIDE'],
  },
} satisfies Record<string, Scene>;

type SpatialSentenceSceneId = keyof typeof SCENE_DB;

const SCENE_METADATA: Record<SpatialSentenceSceneId, SpatialSentenceMetadata> = {
  forest: {
    difficulty: 'medium',
    minLevel: 3,
    focus: 'five_position_context',
    learningOutcome: {
      et: 'Asukohalaused viie põhisuhtega loodusstseenis',
      en: 'Spatial sentences with five core relations in a nature scene',
    },
  },
  space: {
    difficulty: 'easy',
    minLevel: 1,
    focus: 'core_prepositions',
    learningOutcome: {
      et: 'Esimesed asukohasuhted: kohal, all, kõrval ja ees',
      en: 'First spatial relations: on, under, next to, and in front',
    },
  },
  room: {
    difficulty: 'hard',
    minLevel: 6,
    focus: 'inside_container_context',
    learningOutcome: {
      et: 'Toa asjad ja sees-suhe segatud asukohalausetes',
      en: 'Room objects and inside relations in mixed spatial sentences',
    },
  },
  school: {
    difficulty: 'hard',
    minLevel: 6,
    focus: 'inside_container_context',
    learningOutcome: {
      et: 'Koolistseen sees-suhte ja kuue valikuga',
      en: 'School scene with inside relations and six possible positions',
    },
  },
  park: {
    difficulty: 'hard',
    minLevel: 6,
    focus: 'inside_container_context',
    learningOutcome: {
      et: 'Pargistseen tuttavate esemete ja sees-suhtega',
      en: 'Park scene with familiar objects and inside relations',
    },
  },
  beach: {
    difficulty: 'medium',
    minLevel: 3,
    focus: 'five_position_context',
    learningOutcome: {
      et: 'Rannastseen viie asukohavalikuga',
      en: 'Beach scene with five spatial choices',
    },
  },
  kitchen: {
    difficulty: 'hard',
    minLevel: 6,
    focus: 'inside_container_context',
    learningOutcome: {
      et: 'Köögistseen mahutite ja sees-suhtega',
      en: 'Kitchen scene with containers and inside relations',
    },
  },
  street: {
    difficulty: 'medium',
    minLevel: 3,
    focus: 'five_position_context',
    learningOutcome: {
      et: 'Tänavastseen ees/taga/kõrval suhete kordamiseks',
      en: 'Street scene for reviewing in front, behind, and next to',
    },
  },
  farm: {
    difficulty: 'easy',
    minLevel: 1,
    focus: 'core_prepositions',
    learningOutcome: {
      et: 'Esimesed asukohasuhted talustseenis loomadega',
      en: 'First spatial relations in a farm scene with animals',
    },
  },
  playground: {
    difficulty: 'easy',
    minLevel: 1,
    focus: 'core_prepositions',
    learningOutcome: {
      et: 'Mängumaa atraktsioonidel asukohasuhted',
      en: 'Spatial relations among playground attractions',
    },
  },
  underwater: {
    difficulty: 'easy',
    minLevel: 1,
    focus: 'core_prepositions',
    learningOutcome: {
      et: 'Veealune stseen merealuste loomade ja paikadega',
      en: 'Underwater scene with sea creatures and landmarks',
    },
  },
  garden: {
    difficulty: 'medium',
    minLevel: 3,
    focus: 'five_position_context',
    learningOutcome: {
      et: 'Aiastseen viie põhisuhtega ja taimedega',
      en: 'Garden scene with five core relations and plants',
    },
  },
  bathroom: {
    difficulty: 'medium',
    minLevel: 3,
    focus: 'five_position_context',
    learningOutcome: {
      et: 'Vannitoa esemed viie asukohasuhtega',
      en: 'Bathroom items with five spatial relations',
    },
  },
  sports: {
    difficulty: 'medium',
    minLevel: 3,
    focus: 'five_position_context',
    learningOutcome: {
      et: 'Spordiväljaku esemed ees/taga/kõrval suhetes',
      en: 'Sports field objects in front/behind/next-to relations',
    },
  },
  winter: {
    difficulty: 'medium',
    minLevel: 3,
    focus: 'five_position_context',
    learningOutcome: {
      et: 'Talvine maastik viie põhisuhtega',
      en: 'Winter landscape with five core relations',
    },
  },
  cafe: {
    difficulty: 'hard',
    minLevel: 6,
    focus: 'inside_container_context',
    learningOutcome: {
      et: 'Kohviku lauad ja anumad sees-suhtega',
      en: 'Cafe tables and containers with inside relations',
    },
  },
  wardrobe: {
    difficulty: 'hard',
    minLevel: 6,
    focus: 'inside_container_context',
    learningOutcome: {
      et: 'Garderoobi sahtlid ja kapid sees-suhtega',
      en: 'Wardrobe drawers and cupboards with inside relations',
    },
  },
  station: {
    difficulty: 'hard',
    minLevel: 6,
    focus: 'inside_container_context',
    learningOutcome: {
      et: 'Rongijaama stseen rongi ja mahutitega',
      en: 'Train station scene with train and containers',
    },
  },
  cellar: {
    difficulty: 'hard',
    minLevel: 6,
    focus: 'inside_container_context',
    learningOutcome: {
      et: 'Keldri purgid ja korvid sees-suhtega',
      en: 'Cellar jars and baskets with inside relations',
    },
  },
  music: {
    difficulty: 'hard',
    minLevel: 6,
    focus: 'inside_container_context',
    learningOutcome: {
      et: 'Muusikatuba pillide ja sees-suhtega',
      en: 'Music room with instruments and inside relations',
    },
  },
};

export function getSpatialSentenceScenesForLevel(
  items: readonly SpatialSentenceScene[],
  level = 1,
): SpatialSentenceScene[] {
  const scenes = items.filter(
    (scene) => level >= scene.minLevel && (scene.maxLevel === undefined || level <= scene.maxLevel),
  );
  if (scenes.length === 0) {
    throw new Error(`No spatial sentence scenes found for level ${level}`);
  }
  return scenes;
}

export const LANGUAGE_SPATIAL_SENTENCES_PACK: ContentPack<SpatialSentenceScene> = {
  id: 'language.spatial_sentences.scene_pack',
  skillId: LANGUAGE_SPATIAL_SENTENCES_SKILL.id,
  locale: 'et',
  version: '1.2.0',
  title: { et: 'Asukohalausete stseenid', en: 'Spatial sentence scenes' },
  items: (Object.entries(SCENE_DB) as Array<[SpatialSentenceSceneId, Scene]>).map(
    ([id, scene]) => ({
      id,
      ...scene,
      ...SCENE_METADATA[id],
    }),
  ),
};
