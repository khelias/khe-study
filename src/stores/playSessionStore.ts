import { create } from 'zustand';
import {
  createAdaptiveDifficulty,
  updateAdaptiveDifficulty as updateDifficulty,
} from '../engine/adaptiveDifficulty';
import * as rounds from '../engine/round';
import type { RoundState } from '../engine/round';
import { gameRegistry } from '../games/registry';
import type { AchievementUnlock } from '../types/achievement';
import type { Problem } from '../types/game';
import type { Notification, NotificationInput } from '../types/notification';

type GameState = 'menu' | 'playing' | 'round_over';

/**
 * What a finished round earned, for its end screen; whether it reached its
 * goal, and its answers, stay on `round`.
 */
export interface RoundResult {
  starsEarned: number;
  /** The level the round was played at. */
  level: number;
  leveledUp: boolean;
  highestLevel: number;
  /** Rounds reached toward the next level, after this one. */
  roundsReached: number;
  achievements: AchievementUnlock[];
}

interface AdaptiveDifficulty {
  recentAccuracy: boolean[];
  averageResponseTime: number[];
  consecutiveCorrect: number;
  consecutiveWrong: number;
  difficultyMultiplier: number;
  levelAdjustment: number;
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
  currentStreak: number;
  /** Longest run of right answers in this round. */
  bestStreak: number;
  adaptiveDifficulty: AdaptiveDifficulty;
  /** The round being played (ADR 0005 point 1). */
  round: RoundState | null;
  /** Set when a round ends; its end screen reads it. */
  roundResult: RoundResult | null;
  /** Achievements this round's answers unlocked, for its end screen. */
  roundAchievements: AchievementUnlock[];
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
  /** Set by route when entering a game for the first time (stats.gamesByType was 0); GameScreen auto-shows description then clears this */
  autoShowGameDescription: boolean;

  // Actions
  startGame: (gameType: string, options?: { autoShowGameDescription?: boolean }) => void;
  /** The next round of the same game: lives full, a new task, the score from 0. */
  startNextRound: () => void;
  setAutoShowGameDescription: (value: boolean) => void;
  setProblem: (problem: Problem | null) => void;
  /** For a question shown later than its problem, e.g. BattleLearn's question modal. */
  restartProblemTimer: () => void;
  submitAnswer: (isCorrect: boolean) => void;
  /** Counts an answer toward the round's goal; returns the round after it. */
  recordRoundAnswer: (isCorrect: boolean, options?: { confirmsWin?: boolean }) => RoundState | null;
  /** A wrong answer or a game's own failure; returns the round after it. */
  loseRoundLife: () => RoundState | null;
  /** A life back, up to three; returns the round after it. */
  gainRoundLife: () => RoundState | null;
  /** The clock of a timed round stopped; returns the judged round. */
  finishTimedRound: () => RoundState | null;
  endRound: (result: RoundResult) => void;
  noteRoundAchievements: (unlocks: AchievementUnlock[]) => void;
  returnToMenu: () => void;

  // Notification actions
  addNotification: (notification: NotificationInput) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;

  setBgClass: (bgClass: string) => void;
  setConfetti: (confetti: boolean) => void;
  setEnhancedConfetti: (enhanced: boolean) => void;
  setParticleActive: (active: boolean) => void;
  updateAdaptiveDifficulty: (isCorrect: boolean, responseTime?: number) => void;
  setScore: (score: number) => void;
  addScore: (points: number) => void;
  resetSessionState: () => void;
  recordSnakeFact: (equation: string, isCorrect: boolean) => void;
  trackSnakeLength: (length: number) => void;
  trackSnakeStreak: (streak: number) => void;
}

const initialState = {
  gameState: 'menu' as GameState,
  gameType: null,
  problem: null,
  score: 0,
  currentStreak: 0,
  bestStreak: 0,
  adaptiveDifficulty: createAdaptiveDifficulty(),
  round: null as RoundState | null,
  roundResult: null as RoundResult | null,
  roundAchievements: [] as AchievementUnlock[],
  snakeSessionStats: emptySnakeSessionStats(),

  // Notifications
  notifications: [] as Notification[],

  bgClass: '',
  confetti: false,
  enhancedConfetti: false,
  particleActive: false,
  gameStartTime: null,
  problemStartedAt: null,
  autoShowGameDescription: false,
};

/** Everything a new round starts from; an unregistered game has no round. */
const freshRound = (gameType: string) => {
  const spec = gameRegistry.get(gameType)?.round;
  return {
    gameState: 'playing' as GameState,
    problem: null, // A new problem gets generated
    score: 0,
    bgClass: '',
    notifications: [] as Notification[],
    currentStreak: 0,
    bestStreak: 0,
    gameStartTime: Date.now(),
    round: spec ? rounds.createRound(spec) : null,
    roundResult: null,
    roundAchievements: [] as AchievementUnlock[],
    snakeSessionStats: emptySnakeSessionStats(),
    confetti: false,
    enhancedConfetti: false,
    particleActive: false,
  };
};

export const usePlaySessionStore = create<PlaySessionStore>((set, get) => {
  /** Applies a pure round rule to the round being played and returns the result. */
  const updateRound = (rule: (round: RoundState) => RoundState): RoundState | null => {
    const { round } = get();
    if (!round) return null;
    const next = rule(round);
    set({ round: next });
    return next;
  };

  return {
    ...initialState,

    // Actions
    startGame: (gameType: string, options?: { autoShowGameDescription?: boolean }) => {
      set({
        ...freshRound(gameType),
        gameType,
        adaptiveDifficulty: createAdaptiveDifficulty(),
        autoShowGameDescription: options?.autoShowGameDescription ?? false,
      });
    },

    startNextRound: () => {
      const { gameType } = get();
      if (gameType) set(freshRound(gameType));
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

      set({ currentStreak: newStreak, bestStreak: Math.max(state.bestStreak, newStreak) });
    },

    recordRoundAnswer: (isCorrect, options) =>
      updateRound((round) => rounds.recordRoundAnswer(round, isCorrect, options)),

    loseRoundLife: () => updateRound(rounds.loseRoundLife),

    gainRoundLife: () => updateRound(rounds.gainRoundLife),

    finishTimedRound: () => updateRound(rounds.finishTimedRound),

    endRound: (result: RoundResult) => {
      set({ gameState: 'round_over', roundResult: result });
    },

    noteRoundAchievements: (unlocks: AchievementUnlock[]) => {
      if (unlocks.length === 0) return;
      set((state) => ({ roundAchievements: [...state.roundAchievements, ...unlocks] }));
    },

    returnToMenu: () => {
      set({
        gameState: 'menu',
        gameType: null,
        problem: null,
        bgClass: '',
        notifications: [],
        round: null,
        roundResult: null,
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

    updateAdaptiveDifficulty: (isCorrect: boolean, responseTime?: number) => {
      const state = get();
      const updated = updateDifficulty(state.adaptiveDifficulty, isCorrect, responseTime || null);
      set({ adaptiveDifficulty: updated });
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
  };
});
