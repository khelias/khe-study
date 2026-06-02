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
import {
  ADDITION_SNAKE_CONFIG,
  ADDITION_BIG_SNAKE_CONFIG,
  SUBTRACTION_SNAKE_CONFIG,
  SUBTRACTION_BIG_SNAKE_CONFIG,
  MULTIPLICATION_SNAKE_CONFIG,
  MULTIPLICATION_BIG_SNAKE_CONFIG,
} from './mathSnake/config';
import {
  MULTIPLICATION_FACT_DRILL_1_5_CONFIG,
  MULTIPLICATION_FACT_DRILL_1_10_CONFIG,
  ADDITION_FACT_DRILL_WITHIN_20_CONFIG,
  ADDITION_FACT_DRILL_WITHIN_100_CONFIG,
  SUBTRACTION_FACT_DRILL_WITHIN_20_CONFIG,
  SUBTRACTION_FACT_DRILL_WITHIN_100_CONFIG,
  DIVISION_FACT_DRILL_1_5_CONFIG,
  DIVISION_FACT_DRILL_1_10_CONFIG,
} from './factDrill/config';
import {
  BATTLELEARN_CONFIG,
  BATTLELEARN_MULTIPLICATION_CONFIG,
  BATTLELEARN_MULTIPLICATION_1_5_CONFIG,
} from './battlelearn/config';
import { SHAPE_DASH_CONFIG } from './shapeDash/config';

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
  addition_snake: ADDITION_SNAKE_CONFIG,
  addition_big_snake: ADDITION_BIG_SNAKE_CONFIG,
  subtraction_snake: SUBTRACTION_SNAKE_CONFIG,
  subtraction_big_snake: SUBTRACTION_BIG_SNAKE_CONFIG,
  multiplication_snake: MULTIPLICATION_SNAKE_CONFIG,
  multiplication_big_snake: MULTIPLICATION_BIG_SNAKE_CONFIG,
  multiplication_fact_drill_1_5: MULTIPLICATION_FACT_DRILL_1_5_CONFIG,
  multiplication_fact_drill_1_10: MULTIPLICATION_FACT_DRILL_1_10_CONFIG,
  addition_fact_drill_within_20: ADDITION_FACT_DRILL_WITHIN_20_CONFIG,
  addition_fact_drill_within_100: ADDITION_FACT_DRILL_WITHIN_100_CONFIG,
  subtraction_fact_drill_within_20: SUBTRACTION_FACT_DRILL_WITHIN_20_CONFIG,
  subtraction_fact_drill_within_100: SUBTRACTION_FACT_DRILL_WITHIN_100_CONFIG,
  division_fact_drill_1_5: DIVISION_FACT_DRILL_1_5_CONFIG,
  division_fact_drill_1_10: DIVISION_FACT_DRILL_1_10_CONFIG,
  letter_match: LETTER_MATCH_CONFIG,
  unit_conversion: UNIT_CONVERSION_CONFIG,
  compare_sizes: COMPARE_SIZES_CONFIG,
  star_mapper: STAR_MAPPER_CONFIG,
  shape_shift: SHAPE_SHIFT_CONFIG,
  battlelearn: BATTLELEARN_CONFIG,
  battlelearn_multiplication: BATTLELEARN_MULTIPLICATION_CONFIG,
  battlelearn_multiplication_1_5: BATTLELEARN_MULTIPLICATION_1_5_CONFIG,
  shape_dash: SHAPE_DASH_CONFIG,
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
