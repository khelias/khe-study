import type { GameConfig } from '../../types/game';
import { THEME } from '../themes';

export const BATTLELEARN_CONFIG: GameConfig = {
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
};

export const BATTLELEARN_MULTIPLICATION_CONFIG: GameConfig = {
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
};

export const BATTLELEARN_MULTIPLICATION_1_5_CONFIG: GameConfig = {
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
};
