import type { GameConfig } from '../../types/game';
import { THEME } from '../themes';

export const COMPARE_SIZES_CONFIG: GameConfig = {
  id: 'compare_sizes',
  title: 'NUMBER COMPARE',
  theme: THEME.indigo!,
  icon: 'Hash',
  emoji: '⚖️',
  desc: 'Compare numbers',
  difficulty: 'easy',
  category: 'math',
  paidHints: [
    { id: 'eliminate', icon: '❌', cost: 1, labelKey: 'games.compare_sizes.hintEliminateCost' },
  ],
};
