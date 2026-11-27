import type { GameConfig } from '../../types/game';

export const STAR_MAPPER_CONFIG: GameConfig = {
  id: 'star_mapper',
  title: 'TÄHISTAEVAS',
  icon: 'Star',
  emoji: '⭐',
  desc: 'Learn the constellations of the Estonian sky',
  difficulty: 'medium',
  category: 'logic',
  stage: 'immersive',
  paidHints: [
    { id: 'shape', icon: '', cost: 1, labelKey: 'starMapper.hints.shape' },
    { id: 'nextLine', icon: '', cost: 2, labelKey: 'starMapper.hints.nextLine' },
    { id: 'hop', icon: '', cost: 2, labelKey: 'starMapper.hints.hop' },
  ],
};
