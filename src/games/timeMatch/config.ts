import type { GameConfig } from '../../types/game';
import { THEME } from '../themes';

export const TIME_MATCH_CONFIG: GameConfig = {
  id: 'time_match',
  title: 'CLOCK GAME',
  theme: THEME.blue!,
  icon: 'Clock3',
  emoji: '🕐',
  desc: 'Set the time',
  difficulty: 'hard',
  category: 'math',
  paidHints: [
    { id: 'eliminate', icon: '❌', cost: 1, labelKey: 'games.time_match.hintEliminateCost' },
  ],
};
