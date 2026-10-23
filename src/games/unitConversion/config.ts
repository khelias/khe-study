import type { GameConfig } from '../../types/game';

export const UNIT_CONVERSION_CONFIG: GameConfig = {
  id: 'unit_conversion',
  title: 'UNITS',
  icon: 'Ruler',
  emoji: '📐',
  desc: 'Convert units',
  difficulty: 'medium',
  category: 'math',
  paidHints: [
    { id: 'eliminate', icon: '❌', cost: 1, labelKey: 'games.unit_conversion.hintEliminateCost' },
  ],
};
