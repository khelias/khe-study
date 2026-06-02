import type { GameConfig } from '../../types/game';
import { THEME } from '../themes';

export const STAR_MAPPER_CONFIG: GameConfig = {
  id: 'star_mapper',
  title: 'STAR MAPPER',
  theme: THEME.indigo!,
  icon: 'Star',
  emoji: '⭐',
  desc: 'Learn the constellations',
  difficulty: 'medium',
  category: 'logic',
  paidHints: [
    { id: 'guide', icon: '💡', cost: 1, labelKey: 'games.star_mapper.hintGuideCost' },
    { id: 'connect', icon: '✨', cost: 2, labelKey: 'games.star_mapper.hintConnectCost' },
  ],
};
