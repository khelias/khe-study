import type { GameConfig } from '../../types/game';

export const SHAPE_DASH_CONFIG: GameConfig = {
  id: 'shape_dash',
  title: 'SHAPE DASH',
  icon: 'Gamepad2',
  emoji: '🏃',
  desc: 'Jump, dodge, and answer geometry',
  difficulty: 'medium',
  category: 'logic',
  tipPlacement: 'inline',
  paidHints: [
    { id: 'reveal_gate', icon: '🎯', cost: 2, labelKey: 'games.shape_dash.hintRevealGateCost' },
    { id: 'slow_time', icon: '⏱️', cost: 3, labelKey: 'games.shape_dash.hintSlowTimeCost' },
  ],
};
