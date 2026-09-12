import type { GameConfig } from '../../types/game';
import { THEME } from '../themes';

export const SENTENCE_LOGIC_CONFIG: GameConfig = {
  id: 'sentence_logic',
  title: 'SENTENCE DETECTIVE',
  theme: THEME.green!,
  icon: 'BookOpen',
  emoji: '🔍',
  desc: 'Where is the object?',
  difficulty: 'medium',
  category: 'language',
};
