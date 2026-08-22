import type { GameConfig } from '../../types/game';
import { THEME } from '../themes';

export const SHAPE_SHIFT_CONFIG: GameConfig = {
  id: 'shape_shift',
  title: 'SHAPE SHIFT',
  theme: THEME.teal!,
  icon: 'Shapes',
  emoji: '🧩',
  desc: 'Build shapes from pieces',
  difficulty: 'easy',
  category: 'logic',
  paidHints: [
    { id: 'outline', icon: '👁️', cost: 1, labelKey: 'games.shape_shift.hintOutlineCost' },
    { id: 'place', icon: '🧩', cost: 2, labelKey: 'games.shape_shift.hintPlacePieceCost' },
  ],
};
