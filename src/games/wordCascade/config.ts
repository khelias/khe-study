import type { GameConfig } from '../../types/game';

export const WORD_CASCADE_CONFIG: GameConfig = {
  id: 'word_cascade',
  title: 'WORD CASCADE: CORE',
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
