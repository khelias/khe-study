import type { GameConfig } from '../../types/game';

export const WORD_BUILDER_CONFIG: GameConfig = {
  id: 'word_builder',
  title: 'WORD MASTER',
  icon: 'FileText',
  emoji: '📝',
  desc: 'Build a word from letters',
  difficulty: 'easy',
  category: 'language',
  paidHints: [
    { id: 'reveal_next', icon: '🔤', cost: 1, labelKey: 'games.word_builder.hintRevealNextCost' },
    { id: 'eliminate', icon: '❌', cost: 1, labelKey: 'games.word_builder.hintEliminateCost' },
  ],
};
