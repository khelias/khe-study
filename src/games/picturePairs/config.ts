import type { GameConfig } from '../../types/game';

export const PICTURE_PAIRS_CONFIG: GameConfig = {
  id: 'picture_pairs',
  title: 'PICTURE PAIRS',
  icon: 'Layers',
  emoji: '🖼️',
  desc: 'Match pictures and words',
  difficulty: 'easy',
  category: 'memory',
  paidHints: [
    {
      id: 'reveal_pair',
      icon: '👁️',
      cost: 1,
      labelKey: 'games.picture_pairs.hintRevealPairCost',
    },
  ],
};
