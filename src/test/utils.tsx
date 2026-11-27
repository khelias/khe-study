import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { vi } from 'vitest';
import type { Stats } from '../types/stats';
import type { LearnerMeta } from '../meta/types';
import { useGameStore } from '../stores/gameStore';
import { withLearnerMeta } from '../stores/gameStoreHelpers';

// Custom render function that includes common providers if needed
export function customRender(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { ...options });
}

// Override render with custom render
export { customRender as render };

/** Every media query matches, or none does, until `vi.unstubAllGlobals()`. */
export const mockMatchMedia = (matches: boolean) => {
  const spy = vi.fn(
    (query: string) =>
      ({
        matches,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }) as unknown as MediaQueryList,
  );
  vi.stubGlobal('matchMedia', spy);
  return spy;
};

// Test data factories
export const createTestStats = (overrides: Partial<Stats> = {}): Stats => ({
  gamesPlayed: 0,
  correctAnswers: 0,
  wrongAnswers: 0,
  totalScore: 0,
  maxStreak: 0,
  currentStreak: 0,
  maxLevels: {},
  gamesByType: {},
  totalTimePlayed: 0,
  lastPlayed: null,
  collectedStars: 0,
  maxSnakeLength: 0,
  ...overrides,
});

export const createTestAdaptiveDifficulty = (overrides = {}) => ({
  recentAccuracy: [],
  averageResponseTime: [],
  consecutiveCorrect: 0,
  consecutiveWrong: 0,
  difficultyMultiplier: 1.0,
  levelAdjustment: 0,
  ...overrides,
});

// Wait utilities
export const waitForMs = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** The active learner's stars, stats, achievements, high scores and themes. */
export const learnerMeta = (): LearnerMeta => useGameStore.getState().activeLearnerProfile.meta;

/** Sets parts of the active learner's meta, kept in step in `learners[]`. */
export const setLearnerMeta = (patch: Partial<LearnerMeta>): void => {
  useGameStore.setState(withLearnerMeta(useGameStore.getState(), patch));
};
