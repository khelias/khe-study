import type { GameConfig } from '../../types/game';
import { THEME } from '../themes';

/**
 * Snake-family bindings. One mechanic (MathSnakeView + mathSnake engine), six
 * skills. Each binding is a distinct menu card bound to a focused ArithmeticSpec
 * pack; adding a new operation / range is one pack + one binding, no engine code.
 */

export const ADDITION_SNAKE_CONFIG: GameConfig = {
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
};

export const ADDITION_BIG_SNAKE_CONFIG: GameConfig = {
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
};

export const SUBTRACTION_SNAKE_CONFIG: GameConfig = {
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
};

export const SUBTRACTION_BIG_SNAKE_CONFIG: GameConfig = {
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
};

export const MULTIPLICATION_SNAKE_CONFIG: GameConfig = {
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
};

export const MULTIPLICATION_BIG_SNAKE_CONFIG: GameConfig = {
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
};
