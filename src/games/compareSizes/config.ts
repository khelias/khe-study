import type { GameConfig } from '../../types/game';

export const COMPARE_SIZES_CONFIG: GameConfig = {
  id: 'compare_sizes',
  title: 'NUMBER COMPARE',
  icon: 'Hash',
  emoji: '⚖️',
  desc: 'Compare numbers',
  difficulty: 'easy',
  category: 'math',
  paidHints: [
    { id: 'eliminate', icon: '❌', cost: 1, labelKey: 'games.compare_sizes.hintEliminateCost' },
  ],
};
