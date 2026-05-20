import type { GameConfig } from '../../types/game';
import { THEME } from '../themes';

export const PATTERN_CONFIG: GameConfig = {
  id: 'pattern',
  title: 'PATTERN TRAIN',
  theme: THEME.teal!,
  icon: 'TrainFront',
  emoji: '🚂',
  desc: 'Continue the pattern',
  difficulty: 'easy',
  category: 'logic',
  paidHints: [
    { id: 'eliminate', icon: '❌', cost: 1, labelKey: 'games.pattern.hintEliminateCost' },
  ],
};
