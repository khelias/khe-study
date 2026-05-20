import type { GameConfig } from '../../types/game';
import { THEME } from '../themes';

export const BALANCE_SCALE_CONFIG: GameConfig = {
  id: 'balance_scale',
  title: 'SCALES',
  theme: THEME.blue!,
  icon: 'Scale',
  emoji: '⚖️',
  desc: 'Balance the scales',
  difficulty: 'hard',
  category: 'math',
  paidHints: [
    { id: 'eliminate', icon: '❌', cost: 1, labelKey: 'games.balance_scale.hintEliminateCost' },
  ],
};
