import type { GameConfig } from '../../types/game';
import { THEME } from '../themes';

export const LETTER_MATCH_CONFIG: GameConfig = {
  id: 'letter_match',
  title: 'LETTER DETECTIVE',
  theme: THEME.pink!,
  icon: 'Search',
  emoji: '🔤',
  desc: 'Find the correct letter',
  difficulty: 'easy',
  category: 'language',
};
