import type { Category, GameConfig, MechanicConfig } from '../types/game';
import { THEME } from './themes';
import { BALANCE_SCALE_CONFIG } from './balanceScale/config';
import { TIME_MATCH_CONFIG } from './timeMatch/config';
import { COMPARE_SIZES_CONFIG } from './compareSizes/config';
import { UNIT_CONVERSION_CONFIG } from './unitConversion/config';
import { PATTERN_CONFIG } from './pattern/config';
import { MEMORY_MATH_CONFIG } from './memoryMath/config';
import { PICTURE_PAIRS_CONFIG } from './picturePairs/config';
import { SYLLABLE_BUILDER_CONFIG } from './syllableBuilder/config';
import { LETTER_MATCH_CONFIG } from './letterMatch/config';
import { SENTENCE_LOGIC_CONFIG } from './sentenceLogic/config';
import { STAR_MAPPER_CONFIG } from './starMapper/config';
import { ROBO_PATH_CONFIG } from './roboPath/config';
import { WORD_BUILDER_CONFIG } from './wordBuilder/config';
import { WORD_CASCADE_CONFIG, WORD_CASCADE_LONG_CONFIG } from './wordCascade/config';
import { SHAPE_SHIFT_CONFIG } from './shapeShift/config';

export const APP_KEY = 'smart_adv_v45_pro';
export { THEME };

export const CATEGORIES: Record<string, Category> = {
  language: {
    id: 'language',
    name: 'Language Games',
    emoji: '🔤',
    description: 'Words, letters and sentences',
    color: 'orange',
  },
  math: {
    id: 'math',
    name: 'Math',
    emoji: '🔢',
    description: 'Calculations and measurements',
    color: 'purple',
  },
  logic: {
    id: 'logic',
    name: 'Logic',
    emoji: '🧩',
    description: 'Patterns and programming',
    color: 'teal',
  },
  memory: {
    id: 'memory',
    name: 'Memory',
    emoji: '🧠',
    description: 'Memory games',
    color: 'blue',
  },
};

/**
 * Mechanics — one entry per shared engine/view. Bindings (GAME_CONFIG entries)
 * pointing at the same mechanic id collapse into one menu card; the card opens
 * a pack picker listing the bindings inside. New mechanics are added here when
 * a second binding starts sharing a view component.
 */
export const MECHANICS: Record<string, MechanicConfig> = {
  math_snake: {
    id: 'math_snake',
    title: 'NUMBRIMADU',
    desc: 'Söö õunu, lahenda tehe',
    theme: THEME.green!,
    icon: 'Sparkles',
    emoji: '🐍',
    category: 'math',
  },
  word_cascade: {
    id: 'word_cascade',
    title: 'WORD CASCADE',
    desc: 'Catch letters and build words fast',
    theme: THEME.pink!,
    icon: 'Layers',
    emoji: '🌊',
    category: 'language',
  },
  fact_drill: {
    id: 'fact_drill',
    title: 'TEHTESPRINT',
    desc: 'Lahenda tehted kiires tempos',
    theme: THEME.amber!,
    icon: 'Zap',
    emoji: '⚡',
    category: 'math',
  },
  battlelearn: {
    id: 'battlelearn',
    title: 'LAEVADE UPUTAMINE',
    desc: 'Uputa laevad vastustega',
    theme: THEME.blue!,
    icon: 'Anchor',
    emoji: '⚓',
    category: 'math',
  },
};

// Paid hints: only add game-specific hints that give a real advantage in that game.
// Use the same system (GAME_CONFIG.paidHints, PaidHintButtons, stars/spendStars) for all.
export const GAME_CONFIG: Record<string, GameConfig> = {
  // 5+ games - simpler, visual (7 games - added letter_match)
  word_builder: WORD_BUILDER_CONFIG,
  word_cascade: WORD_CASCADE_CONFIG,
  word_cascade_long: WORD_CASCADE_LONG_CONFIG,
  syllable_builder: SYLLABLE_BUILDER_CONFIG,
  pattern: PATTERN_CONFIG,
  sentence_logic: SENTENCE_LOGIC_CONFIG,
  memory_math: MEMORY_MATH_CONFIG,
  picture_pairs: PICTURE_PAIRS_CONFIG,
  robo_path: ROBO_PATH_CONFIG,
  addition_snake: {
    id: 'addition_snake',
    title: 'LIITMISUSS',
    theme: THEME.green!,
    icon: 'Plus',
    emoji: '➕',
    desc: 'Liitmine kuni 20',
    difficulty: 'easy',
    category: 'math',
    mechanic: 'math_snake',
    paidHints: [
      { id: 'eliminate', icon: '❌', cost: 1, labelKey: 'games.addition_snake.hintEliminateCost' },
    ],
    visualTheme: { snakePalette: 'emerald' },
  },
  addition_big_snake: {
    id: 'addition_big_snake',
    title: 'SUUR LIITMISUSS',
    theme: THEME.teal!,
    icon: 'Plus',
    emoji: '🧮',
    desc: 'Liitmine kuni 100',
    difficulty: 'medium',
    category: 'math',
    mechanic: 'math_snake',
    paidHints: [
      {
        id: 'eliminate',
        icon: '❌',
        cost: 1,
        labelKey: 'games.addition_big_snake.hintEliminateCost',
      },
    ],
    visualTheme: { snakePalette: 'teal' },
  },
  subtraction_snake: {
    id: 'subtraction_snake',
    title: 'LAHUTUSUSS',
    theme: THEME.orange!,
    icon: 'Minus',
    emoji: '➖',
    desc: 'Lahutamine kuni 20',
    difficulty: 'easy',
    category: 'math',
    mechanic: 'math_snake',
    paidHints: [
      {
        id: 'eliminate',
        icon: '❌',
        cost: 1,
        labelKey: 'games.subtraction_snake.hintEliminateCost',
      },
    ],
    visualTheme: { snakePalette: 'orange' },
  },
  subtraction_big_snake: {
    id: 'subtraction_big_snake',
    title: 'SUUR LAHUTUSUSS',
    theme: THEME.pink!,
    icon: 'Minus',
    emoji: '🧮',
    desc: 'Lahutamine kuni 100',
    difficulty: 'medium',
    category: 'math',
    mechanic: 'math_snake',
    paidHints: [
      {
        id: 'eliminate',
        icon: '❌',
        cost: 1,
        labelKey: 'games.subtraction_big_snake.hintEliminateCost',
      },
    ],
    visualTheme: { snakePalette: 'pink' },
  },
  multiplication_snake: {
    id: 'multiplication_snake',
    title: 'KORRUTUSUSS',
    theme: THEME.indigo!,
    icon: 'Sparkles',
    emoji: '🪐',
    desc: 'Korrutustabel 1–5',
    difficulty: 'medium',
    category: 'math',
    mechanic: 'math_snake',
    paidHints: [
      {
        id: 'eliminate',
        icon: '❌',
        cost: 1,
        labelKey: 'games.multiplication_snake.hintEliminateCost',
      },
    ],
    visualTheme: {
      normalCollectibleEmoji: '⭐',
      challengeCollectibleEmoji: '🪐',
      background: 'cosmic',
      snakePalette: 'indigo',
    },
  },
  multiplication_big_snake: {
    id: 'multiplication_big_snake',
    title: 'SUUR KORRUTUSUSS',
    theme: THEME.purple!,
    icon: 'Sparkles',
    emoji: '🌌',
    desc: 'Korrutustabel 1–10',
    difficulty: 'hard',
    category: 'math',
    mechanic: 'math_snake',
    paidHints: [
      {
        id: 'eliminate',
        icon: '❌',
        cost: 1,
        labelKey: 'games.multiplication_big_snake.hintEliminateCost',
      },
    ],
    visualTheme: {
      normalCollectibleEmoji: '✨',
      challengeCollectibleEmoji: '🌌',
      background: 'cosmic',
      snakePalette: 'purple',
    },
  },
  multiplication_fact_drill_1_5: {
    id: 'multiplication_fact_drill_1_5',
    title: 'KORRUTUSSPRINT 1–5',
    theme: THEME.amber!,
    icon: 'Zap',
    emoji: '⚡',
    desc: 'Korrutustabel 1–5 kiires tempos',
    difficulty: 'medium',
    category: 'math',
    mechanic: 'fact_drill',
    sessionMode: 'continuous',
    timerDuration: 60,
  },
  multiplication_fact_drill_1_10: {
    id: 'multiplication_fact_drill_1_10',
    title: 'KORRUTUSSPRINT 1–10',
    theme: THEME.indigo!,
    icon: 'Zap',
    emoji: '⚡',
    desc: 'Korrutustabel 1–10 kiires tempos',
    difficulty: 'hard',
    category: 'math',
    mechanic: 'fact_drill',
    sessionMode: 'continuous',
    timerDuration: 60,
  },
  addition_fact_drill_within_20: {
    id: 'addition_fact_drill_within_20',
    title: 'LIITMISSPRINT 20',
    theme: THEME.green!,
    icon: 'Zap',
    emoji: '⚡',
    desc: 'Liitmine kuni 20 kiires tempos',
    difficulty: 'easy',
    category: 'math',
    mechanic: 'fact_drill',
    sessionMode: 'continuous',
    timerDuration: 60,
  },
  addition_fact_drill_within_100: {
    id: 'addition_fact_drill_within_100',
    title: 'LIITMISSPRINT 100',
    theme: THEME.teal!,
    icon: 'Zap',
    emoji: '⚡',
    desc: 'Liitmine kuni 100 kiires tempos',
    difficulty: 'medium',
    category: 'math',
    mechanic: 'fact_drill',
    sessionMode: 'continuous',
    timerDuration: 60,
  },
  subtraction_fact_drill_within_20: {
    id: 'subtraction_fact_drill_within_20',
    title: 'LAHUTUSSPRINT 20',
    theme: THEME.orange!,
    icon: 'Zap',
    emoji: '⚡',
    desc: 'Lahutamine kuni 20 kiires tempos',
    difficulty: 'easy',
    category: 'math',
    mechanic: 'fact_drill',
    sessionMode: 'continuous',
    timerDuration: 60,
  },
  subtraction_fact_drill_within_100: {
    id: 'subtraction_fact_drill_within_100',
    title: 'LAHUTUSSPRINT 100',
    theme: THEME.pink!,
    icon: 'Zap',
    emoji: '⚡',
    desc: 'Lahutamine kuni 100 kiires tempos',
    difficulty: 'medium',
    category: 'math',
    mechanic: 'fact_drill',
    sessionMode: 'continuous',
    timerDuration: 60,
  },
  division_fact_drill_1_5: {
    id: 'division_fact_drill_1_5',
    title: 'JAGAMISSPRINT 1–5',
    theme: THEME.purple!,
    icon: 'Zap',
    emoji: '⚡',
    desc: 'Jagamine 1–5 kiires tempos',
    difficulty: 'medium',
    category: 'math',
    mechanic: 'fact_drill',
    sessionMode: 'continuous',
    timerDuration: 60,
  },
  division_fact_drill_1_10: {
    id: 'division_fact_drill_1_10',
    title: 'JAGAMISSPRINT 1–10',
    theme: THEME.blue!,
    icon: 'Zap',
    emoji: '⚡',
    desc: 'Jagamine 1–10 kiires tempos',
    difficulty: 'hard',
    category: 'math',
    mechanic: 'fact_drill',
    sessionMode: 'continuous',
    timerDuration: 60,
  },
  letter_match: LETTER_MATCH_CONFIG,
  unit_conversion: UNIT_CONVERSION_CONFIG,
  compare_sizes: COMPARE_SIZES_CONFIG,
  star_mapper: STAR_MAPPER_CONFIG,
  shape_shift: SHAPE_SHIFT_CONFIG,
  battlelearn: {
    id: 'battlelearn',
    title: 'BATTLELEARN',
    theme: THEME.blue!,
    icon: 'Anchor',
    emoji: '⚓',
    desc: 'Answer and sink ships',
    difficulty: 'medium',
    category: 'math',
    mechanic: 'battlelearn',
    levelUpStrategy: 'onGameWin',
    paidHints: [
      {
        id: 'reveal_empty',
        icon: '💧',
        cost: 1,
        labelKey: 'games.battlelearn.hintRevealEmptyCost',
      },
      { id: 'reveal', icon: '🎯', cost: 10, labelKey: 'games.battlelearn.hintRevealCost' },
      { id: 'eliminate', icon: '❌', cost: 1, labelKey: 'games.battlelearn.hintEliminateCost' },
    ],
  },
  battlelearn_multiplication: {
    id: 'battlelearn_multiplication',
    title: 'BATTLELEARN: MULTIPLICATION',
    theme: THEME.indigo!,
    icon: 'Anchor',
    emoji: '⚓',
    desc: 'Sink ships with multiplication facts',
    difficulty: 'medium',
    category: 'math',
    mechanic: 'battlelearn',
    levelUpStrategy: 'onGameWin',
    paidHints: [
      {
        id: 'reveal_empty',
        icon: '💧',
        cost: 1,
        labelKey: 'games.battlelearn.hintRevealEmptyCost',
      },
      { id: 'reveal', icon: '🎯', cost: 10, labelKey: 'games.battlelearn.hintRevealCost' },
      { id: 'eliminate', icon: '❌', cost: 1, labelKey: 'games.battlelearn.hintEliminateCost' },
    ],
  },
  battlelearn_multiplication_1_5: {
    id: 'battlelearn_multiplication_1_5',
    title: 'BATTLELEARN: MULTIPLICATION 1-5',
    theme: THEME.indigo!,
    icon: 'Anchor',
    emoji: '⚓',
    desc: 'Sink ships with multiplication facts 1-5',
    difficulty: 'easy',
    category: 'math',
    mechanic: 'battlelearn',
    levelUpStrategy: 'onGameWin',
    paidHints: [
      {
        id: 'reveal_empty',
        icon: '💧',
        cost: 1,
        labelKey: 'games.battlelearn.hintRevealEmptyCost',
      },
      { id: 'reveal', icon: '🎯', cost: 10, labelKey: 'games.battlelearn.hintRevealCost' },
      { id: 'eliminate', icon: '❌', cost: 1, labelKey: 'games.battlelearn.hintEliminateCost' },
    ],
  },
  shape_dash: {
    id: 'shape_dash',
    title: 'SHAPE DASH',
    theme: THEME.teal!,
    icon: 'Gamepad2',
    emoji: '🏃',
    desc: 'Jump, dodge, and answer geometry',
    difficulty: 'medium',
    category: 'logic',
    paidHints: [
      { id: 'reveal_gate', icon: '🎯', cost: 2, labelKey: 'games.shape_dash.hintRevealGateCost' },
      { id: 'slow_time', icon: '⏱️', cost: 3, labelKey: 'games.shape_dash.hintSlowTimeCost' },
    ],
  },
  // Advanced-only games (7+)
  balance_scale: BALANCE_SCALE_CONFIG,
  time_match: TIME_MATCH_CONFIG,
};

/**
 * Resolve the mechanic id for a gameType. Bindings sharing a mechanic (e.g.
 * all snake variants → `'math_snake'`) collapse to one id; singletons fall
 * back to the gameType itself. Per-learner `mechanicPreference` is keyed on
 * this id.
 */
export function getMechanicIdForGame(gameType: string): string {
  return GAME_CONFIG[gameType]?.mechanic ?? gameType;
}

export const ICONS: Record<string, string> = {
  Type: 'Type',
  Brain: 'Brain',
  BookOpen: 'BookOpen',
  Scale: 'Scale',
  GraduationCap: 'GraduationCap',
  TrainFront: 'TrainFront',
  Bot: 'Bot',
  Clock3: 'Clock3',
  Ruler: 'Ruler',
  Gamepad2: 'Gamepad2',
  Hash: 'Hash',
  FileText: 'FileText',
  Layers: 'Layers',
  Search: 'Search',
  Star: 'Star',
  Shapes: 'Shapes',
  Target: 'Target',
  Zap: 'Zap',
};
