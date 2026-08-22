import type { GameConfig } from '../../types/game';
import { THEME } from '../themes';

/**
 * Fact Drill family — timed single-operator sprints. One mechanic (FactDrillView
 * + factDrill engine), eight bindings. Each binding carries
 * `sessionMode: 'continuous'`, which keeps the play-session store from
 * auto-generating the next problem or triggering mid-session level-ups.
 */

export const MULTIPLICATION_FACT_DRILL_1_5_CONFIG: GameConfig = {
  id: 'multiplication_fact_drill_1_5',
  title: 'KORRUTUSSPRINT 1–5',
  theme: THEME.amber!,
  icon: 'Zap',
  emoji: '⚡',
  desc: 'Korrutustabel 1–5 kiires tempos',
  difficulty: 'medium',
  category: 'math',
  mechanic: 'fact_drill',
  sessionMode: 'continuous',
  timerDuration: 60,
};

export const MULTIPLICATION_FACT_DRILL_1_10_CONFIG: GameConfig = {
  id: 'multiplication_fact_drill_1_10',
  title: 'KORRUTUSSPRINT 1–10',
  theme: THEME.indigo!,
  icon: 'Zap',
  emoji: '⚡',
  desc: 'Korrutustabel 1–10 kiires tempos',
  difficulty: 'hard',
  category: 'math',
  mechanic: 'fact_drill',
  sessionMode: 'continuous',
  timerDuration: 60,
};

export const ADDITION_FACT_DRILL_WITHIN_20_CONFIG: GameConfig = {
  id: 'addition_fact_drill_within_20',
  title: 'LIITMISSPRINT 20',
  theme: THEME.green!,
  icon: 'Zap',
  emoji: '⚡',
  desc: 'Liitmine kuni 20 kiires tempos',
  difficulty: 'easy',
  category: 'math',
  mechanic: 'fact_drill',
  sessionMode: 'continuous',
  timerDuration: 60,
};

export const ADDITION_FACT_DRILL_WITHIN_100_CONFIG: GameConfig = {
  id: 'addition_fact_drill_within_100',
  title: 'LIITMISSPRINT 100',
  theme: THEME.teal!,
  icon: 'Zap',
  emoji: '⚡',
  desc: 'Liitmine kuni 100 kiires tempos',
  difficulty: 'medium',
  category: 'math',
  mechanic: 'fact_drill',
  sessionMode: 'continuous',
  timerDuration: 60,
};

export const SUBTRACTION_FACT_DRILL_WITHIN_20_CONFIG: GameConfig = {
  id: 'subtraction_fact_drill_within_20',
  title: 'LAHUTUSSPRINT 20',
  theme: THEME.orange!,
  icon: 'Zap',
  emoji: '⚡',
  desc: 'Lahutamine kuni 20 kiires tempos',
  difficulty: 'easy',
  category: 'math',
  mechanic: 'fact_drill',
  sessionMode: 'continuous',
  timerDuration: 60,
};

export const SUBTRACTION_FACT_DRILL_WITHIN_100_CONFIG: GameConfig = {
  id: 'subtraction_fact_drill_within_100',
  title: 'LAHUTUSSPRINT 100',
  theme: THEME.pink!,
  icon: 'Zap',
  emoji: '⚡',
  desc: 'Lahutamine kuni 100 kiires tempos',
  difficulty: 'medium',
  category: 'math',
  mechanic: 'fact_drill',
  sessionMode: 'continuous',
  timerDuration: 60,
};

export const DIVISION_FACT_DRILL_1_5_CONFIG: GameConfig = {
  id: 'division_fact_drill_1_5',
  title: 'JAGAMISSPRINT 1–5',
  theme: THEME.purple!,
  icon: 'Zap',
  emoji: '⚡',
  desc: 'Jagamine 1–5 kiires tempos',
  difficulty: 'medium',
  category: 'math',
  mechanic: 'fact_drill',
  sessionMode: 'continuous',
  timerDuration: 60,
};

export const DIVISION_FACT_DRILL_1_10_CONFIG: GameConfig = {
  id: 'division_fact_drill_1_10',
  title: 'JAGAMISSPRINT 1–10',
  theme: THEME.blue!,
  icon: 'Zap',
  emoji: '⚡',
  desc: 'Jagamine 1–10 kiires tempos',
  difficulty: 'hard',
  category: 'math',
  mechanic: 'fact_drill',
  sessionMode: 'continuous',
  timerDuration: 60,
};
