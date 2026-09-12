import type { GameConfig } from '../../types/game';
import { THEME } from '../themes';

export const WORD_CASCADE_CONFIG: GameConfig = {
  id: 'word_cascade',
  title: 'WORD CASCADE: CORE',
  theme: THEME.pink!,
  icon: 'Layers',
  emoji: '🌊',
  desc: 'Short and familiar words',
  difficulty: 'medium',
  category: 'language',
  mechanic: 'word_cascade',
  paidHints: [
    { id: 'reveal_next', icon: '🔤', cost: 1, labelKey: 'games.word_cascade.hintRevealNextCost' },
  ],
};

export const WORD_CASCADE_LONG_CONFIG: GameConfig = {
  id: 'word_cascade_long',
  title: 'WORD CASCADE: LONG',
  theme: THEME.indigo!,
  icon: 'Layers',
  emoji: '🌊',
  desc: 'Longer word challenge',
  difficulty: 'hard',
  category: 'language',
  mechanic: 'word_cascade',
  paidHints: [
    { id: 'reveal_next', icon: '🔤', cost: 1, labelKey: 'games.word_cascade.hintRevealNextCost' },
  ],
};
