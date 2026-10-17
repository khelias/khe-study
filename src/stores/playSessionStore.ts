import { create } from 'zustand';
import {
  createAdaptiveDifficulty,
  updateAdaptiveDifficulty as updateDifficulty,
} from '../engine/adaptiveDifficulty';
import { gameRegistry } from '../games/registry';
import type { Problem } from '../types/game';
import type { Notification, NotificationInput } from '../types/notification';

type GameState = 'menu' | 'playing' | 'game_over';

interface AdaptiveDifficulty {
  recentAccuracy: boolean[];
  averageResponseTime: number[];
  consecutiveCorrect: number;
  consecutiveWrong: number;
  difficultyMultiplier: number;
  levelAdjustment: number;
}

export interface LevelProgress {
  correctAnswers: number;
  totalAnswers: number;
  levelStartedAt: number; // Timestamp when level started
}

/**
 * Session-scoped metrics for the snake family, rebuilt on every startGame.
 * Drives the end-of-session summary (max length, accuracy, hardest facts).
 * Weak facts surface in the summary so the kid sees what to practice next.
 */
export interface SnakeSessionStats {
  factsAttempted: number;
  factsCorrect: number;
  maxStreak: number;
  maxSnakeLength: number;
  /** Equation string → attempts + correct count for this session. */
  factHistory: Record<string, { attempts: number; correct: number }>;
}

const emptySnakeSessionStats = (): SnakeSessionStats => ({
  factsAttempted: 0,
  factsCorrect: 0,
  maxStreak: 0,
  maxSnakeLength: 0,
  factHistory: {},
});

export interface PlaySessionStore {
  // State
  gameState: GameState;
  gameType: string | null;
  problem: Problem | null;
  score: number;
  highScoreEligible: boolean;
  currentStreak: number;
  adaptiveDifficulty: AdaptiveDifficulty;
  levelProgress: LevelProgress | null; // Tracks progress toward next level
  snakeSessionStats: SnakeSessionStats;

  // New unified notification system
  notifications: Notification[];

  bgClass: string;
  confetti: boolean;
  enhancedConfetti: boolean;
  particleActive: boolean;
  gameStartTime: number | null;
  /** Set whenever a new question is shown; used to measure per-answer response time. */
  problemStartedAt: number | null;
  showHint: boolean;
  /** Set by route when entering a game for the first time (stats.gamesByType was 0); GameScreen auto-shows description then clears this */
  autoShowGameDescription: boolean;

  // Actions
  startGame: (gameType: string, options?: { autoShowGameDescription?: boolean }) => void;
  setAutoShowGameDescription: (value: boolean) => void;
  setProblem: (problem: Problem | null) => void;
  /** For a question shown later than its problem, e.g. BattleLearn's question modal. */
  restartProblemTimer: () => void;
  submitAnswer: (isCorrect: boolean) => void;
  endGame: () => void;
  resumeGame: () => void; // Back to playing without resetting problem/score (e.g. after buying hearts)
  rescueAttempt: () => void; // Revive the same attempt; a rescued attempt does not qualify for a high score
  returnToMenu: () => void;

  // Notification actions
  addNotification: (notification: NotificationInput) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;

  setBgClass: (bgClass: string) => void;
  setConfetti: (confetti: boolean) => void;
  setEnhancedConfetti: (enhanced: boolean) => void;
  setParticleActive: (active: boolean) => void;
  setShowHint: (show: boolean) => void;
  updateAdaptiveDifficulty: (isCorrect: boolean, responseTime?: number) => void;
  setScore: (score: number) => void;
  addScore: (points: number) => void;
  resetSessionState: () => void;
  recordLevelAnswer: (isCorrect: boolean) => void; // Track answer for level progress
  resetLevelProgress: () => void; // Reset when level changes
  recordSnakeFact: (equation: string, isCorrect: boolean) => void;
  trackSnakeLength: (length: number) => void;
  trackSnakeStreak: (streak: number) => void;
}

const initialState = {
  gameState: 'menu' as GameState,
  gameType: null,
  problem: null,
  score: 0,
  highScoreEligible: true,
  currentStreak: 0,
  adaptiveDifficulty: createAdaptiveDifficulty(),
  levelProgress: null as LevelProgress | null,
  snakeSessionStats: emptySnakeSessionStats(),

  // Notifications
  notifications: [] as Notification[],

  bgClass: 'bg-slate-50',
  confetti: false,
  enhancedConfetti: false,
  particleActive: false,
  gameStartTime: null,
  problemStartedAt: null,
  showHint: false,
  autoShowGameDescription: false,
};

export const usePlaySessionStore = create<PlaySessionStore>((set, get) => ({
  ...initialState,

  // Actions
  startGame: (gameType: string, options?: { autoShowGameDescription?: boolean }) => {
    set({
      gameType,
      gameState: 'playing',
      problem: null, // Reset problem so new one gets generated
      score: 0, // Reset session score
      highScoreEligible: true,
      bgClass: 'bg-slate-50',
      notifications: [],
      showHint: false,
      currentStreak: 0,
      gameStartTime: Date.now(),
      adaptiveDifficulty: createAdaptiveDifficulty(),
      levelProgress: {
        correctAnswers: 0,
        totalAnswers: 0,
        levelStartedAt: Date.now(),
      },
      snakeSessionStats: emptySnakeSessionStats(),
      confetti: false,
      enhancedConfetti: false,
      particleActive: false,
      autoShowGameDescription: options?.autoShowGameDescription ?? false,
    });
  },
  setAutoShowGameDescription: (value: boolean) => {
    set({ autoShowGameDescription: value });
  },

  setProblem: (problem: Problem | null) => {
    if (problem) {
      const gameType = get().gameType;
      const entry = gameType ? gameRegistry.get(gameType) : undefined;
      const clonedProblem: Problem = entry?.cloneProblem?.(problem) ?? { ...problem };
      const questionKey = (p: Problem) => entry?.questionKey?.(p) ?? null;

      const prev = get().problem;
      const isSameQuestion =
        prev != null &&
        prev.uid === clonedProblem.uid &&
        questionKey(prev) === questionKey(clonedProblem);
      set({
        problem: clonedProblem,
        problemStartedAt: isSameQuestion ? get().problemStartedAt : Date.now(),
      });
    } else {
      set({ problem: null, problemStartedAt: null });
    }
  },

  restartProblemTimer: () => {
    if (get().problem) set({ problemStartedAt: Date.now() });
  },

  submitAnswer: (isCorrect: boolean) => {
    const state = get();
    const newStreak = isCorrect ? state.currentStreak + 1 : 0;

    set({ currentStreak: newStreak });
  },

  endGame: () => {
    set({ gameState: 'game_over' });
  },

  resumeGame: () => {
    set({ gameState: 'playing' });
  },

  rescueAttempt: () => {
    set({ gameState: 'playing', highScoreEligible: false });
  },

  returnToMenu: () => {
    set({
      gameState: 'menu',
      gameType: null,
      problem: null,
      bgClass: 'bg-slate-50',
      notifications: [],
    });
  },

  setBgClass: (bgClass: string) => {
    set({ bgClass });
  },

  setConfetti: (confetti: boolean) => {
    set({ confetti });
  },

  setEnhancedConfetti: (enhanced: boolean) => {
    set({ enhancedConfetti: enhanced });
  },

  setParticleActive: (active: boolean) => {
    set({ particleActive: active });
  },

  setShowHint: (show: boolean) => {
    set({ showHint: show });
  },

  updateAdaptiveDifficulty: (isCorrect: boolean, responseTime?: number) => {
    const state = get();
    const updated = updateDifficulty(state.adaptiveDifficulty, isCorrect, responseTime || null);
    set({ adaptiveDifficulty: updated });
  },

  recordLevelAnswer: (isCorrect: boolean) => {
    const state = get();
    if (!state.levelProgress) {
      // Initialize if not set
      set({
        levelProgress: {
          correctAnswers: isCorrect ? 1 : 0,
          totalAnswers: 1,
          levelStartedAt: Date.now(),
        },
      });
      return;
    }

    set({
      levelProgress: {
        ...state.levelProgress,
        correctAnswers: state.levelProgress.correctAnswers + (isCorrect ? 1 : 0),
        totalAnswers: state.levelProgress.totalAnswers + 1,
      },
    });
  },

  resetLevelProgress: () => {
    set({
      levelProgress: {
        correctAnswers: 0,
        totalAnswers: 0,
        levelStartedAt: Date.now(),
      },
    });
  },

  recordSnakeFact: (equation: string, isCorrect: boolean) => {
    set((state) => {
      const prev = state.snakeSessionStats.factHistory[equation] ?? {
        attempts: 0,
        correct: 0,
      };
      return {
        snakeSessionStats: {
          ...state.snakeSessionStats,
          factsAttempted: state.snakeSessionStats.factsAttempted + 1,
          factsCorrect: state.snakeSessionStats.factsCorrect + (isCorrect ? 1 : 0),
          factHistory: {
            ...state.snakeSessionStats.factHistory,
            [equation]: {
              attempts: prev.attempts + 1,
              correct: prev.correct + (isCorrect ? 1 : 0),
            },
          },
        },
      };
    });
  },

  trackSnakeLength: (length: number) => {
    set((state) => {
      if (length <= state.snakeSessionStats.maxSnakeLength) return state;
      return {
        snakeSessionStats: {
          ...state.snakeSessionStats,
          maxSnakeLength: length,
        },
      };
    });
  },

  trackSnakeStreak: (streak: number) => {
    set((state) => {
      if (streak <= state.snakeSessionStats.maxStreak) return state;
      return {
        snakeSessionStats: {
          ...state.snakeSessionStats,
          maxStreak: streak,
        },
      };
    });
  },

  setScore: (score: number) => {
    set({ score });
  },

  addScore: (points: number) => {
    set((state) => ({ score: state.score + points }));
  },

  resetSessionState: () => {
    set(initialState);
  },

  // Notification actions
  addNotification: (notification: NotificationInput) => {
    const createdAt = Date.now();
    const id = `notification-${createdAt}-${Math.random()}`;
    set((state) => ({
      notifications: [...state.notifications, { ...notification, id, createdAt }],
    }));
  },

  removeNotification: (id: string) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },
}));
