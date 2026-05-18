import { create } from 'zustand';
import {
  createAdaptiveDifficulty,
  updateAdaptiveDifficulty as updateDifficulty,
} from '../engine/adaptiveDifficulty';
import type { Problem, PicturePairsCard } from '../types/game';
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
 * Per-fact tracking feeds a mini-precursor to the Phase 1 mastery tracker:
 * weak facts surface in the summary so the kid sees what to practice next.
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
  // hearts removed - now using gameStore.hearts (persistent global resource)
  // stars removed - now using gameStore.stars (persistent currency)
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
  showHint: boolean;
  /** Set by route when entering a game for the first time (stats.gamesByType was 0); GameScreen auto-shows description then clears this */
  autoShowGameDescription: boolean;

  // Actions
  startGame: (gameType: string, options?: { autoShowGameDescription?: boolean }) => void;
  setAutoShowGameDescription: (value: boolean) => void;
  setProblem: (problem: Problem | null) => void;
  submitAnswer: (isCorrect: boolean) => void;
  endGame: () => void;
  resumeGame: () => void; // Back to playing without resetting problem/score (e.g. after buying hearts)
  rescueAttempt: () => void; // Revive the same attempt; rescued attempts no longer qualify for high score
  returnToMenu: () => void;

  // New notification system actions
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
  // hearts removed - now using gameStore.hearts (persistent global resource)
  // stars removed - now using gameStore.stars (persistent currency)
  currentStreak: 0,
  adaptiveDifficulty: createAdaptiveDifficulty(),
  levelProgress: null as LevelProgress | null,
  snakeSessionStats: emptySnakeSessionStats(),

  // New notification system
  notifications: [] as Notification[],

  bgClass: 'bg-slate-50',
  confetti: false,
  enhancedConfetti: false,
  particleActive: false,
  gameStartTime: null,
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
    // Clone nested arrays to ensure React detects changes
    if (problem) {
      const clonedProblem: Problem = { ...problem };

      // Clone arrays that React might compare by reference
      if (problem.type === 'word_builder' && 'shuffled' in problem) {
        (clonedProblem as typeof problem).shuffled = [...(problem.shuffled || [])];
      }
      if (problem.type === 'syllable_builder' && 'shuffled' in problem) {
        (clonedProblem as typeof problem).shuffled = [...(problem.shuffled || [])];
      }
      if (problem.type === 'memory_math' && 'cards' in problem) {
        (clonedProblem as typeof problem).cards = [...(problem.cards || [])];
      }
      if (problem.type === 'picture_pairs' && 'cards' in problem) {
        (clonedProblem as typeof problem).cards = (
          problem as { cards: PicturePairsCard[] }
        ).cards.map((c) => ({ ...c }));
      }
      if (problem.type === 'pattern' && 'sequence' in problem) {
        (clonedProblem as typeof problem).sequence = [...(problem.sequence || [])];
        (clonedProblem as typeof problem).options = [...(problem.options || [])];
      }
      if (problem.type === 'balance_scale' && 'display' in problem) {
        (clonedProblem as typeof problem).display = {
          ...problem.display,
          left: [...(problem.display.left || [])],
          right: [...(problem.display.right || [])],
        };
        (clonedProblem as typeof problem).options = [...(problem.options || [])];
      }
      if (problem.type === 'robo_path' && 'grid' in problem) {
        (clonedProblem as typeof problem).grid = problem.grid.map((row) => [...row]);
        (clonedProblem as typeof problem).obstacles = problem.obstacles.map(
          (obs) => [...obs] as [number, number],
        );
      }
      if (problem.type === 'math_snake' && 'snake' in problem) {
        (clonedProblem as typeof problem).snake = problem.snake.map(
          (pos) => [...pos] as [number, number],
        );
      }
      if (problem.type === 'battlelearn' && 'ships' in problem) {
        // Clone BattleLearn-specific arrays and cell grid
        (clonedProblem as typeof problem).cellGrid = problem.cellGrid.map((row) => [...row]);
        (clonedProblem as typeof problem).revealed = problem.revealed.map(
          (pos) => [...pos] as [number, number],
        );
        (clonedProblem as typeof problem).hits = problem.hits.map(
          (pos) => [...pos] as [number, number],
        );
        (clonedProblem as typeof problem).sunkShips = [...problem.sunkShips];
        (clonedProblem as typeof problem).ships = problem.ships.map((ship) => ({
          ...ship,
          positions: ship.positions.map((pos) => [...pos] as [number, number]),
        }));
      }

      set({ problem: clonedProblem });
    } else {
      set({ problem: null });
    }
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

  // New notification system actions
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
