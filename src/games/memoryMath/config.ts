import type { GameConfig } from '../../types/game';
import { THEME } from '../themes';

export const MEMORY_MATH_CONFIG: GameConfig = {
  id: 'memory_math',
  title: 'MATH MEMORY',
  theme: THEME.green!,
  icon: 'Brain',
  emoji: '🧠',
  desc: 'Find the equation and answer',
  difficulty: 'medium',
  category: 'memory',
  paidHints: [
    { id: 'reveal_pair', icon: '👁️', cost: 1, labelKey: 'games.memory_math.hintRevealPairCost' },
  ],
};
