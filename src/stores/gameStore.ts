import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { APP_KEY, getMechanicIdForGame } from '../games/data';
import {
  createStats,
  recordGameStart,
  recordAnswer as recordStatsAnswer,
  recordLevelUp as recordStatsLevelUp,
  recordScore,
} from '../engine/stats';
import {
  applyRoundToLevel,
  type MechanicLevelProgress,
  type RoundLevelOutcome,
} from '../engine/progression';
import { getTranslations } from '../i18n';
import { applyAttemptToLearner, type LearnerProfile } from '../learner';
import { purchaseTheme, canApplyTheme } from '../meta/inventory';
import {
  applyMechanicLevelToLearner,
  commitActiveLearner,
  createActiveLearnerProfile,
  DEFAULT_FAVOURITE_GAME_IDS,
  readMechanicLevelProgress,
  unlockAchievementsFor,
  withAppliedTheme,
  writeMechanicLevel,
  type AchievementData,
} from './gameStoreHelpers';
import { GAME_STORE_VERSION, migrateGameStoreState } from './gameStoreMigration';

export { GAME_STORE_VERSION };

export type RoundRecord = RoundLevelOutcome & { newAchievements: AchievementData[] };

export const STAR_PURCHASE_AMOUNT = 50;

const MAX_PLAYED_CONTENT_IDS_PER_PACK = 100;

export interface GameStore {
  // State
  // Several learners per device. `learners` is the canonical list,
  // `activeLearnerId` selects which one is currently playing, and
  // `activeLearnerProfile` is a kept-in-sync alias for the active entry.
  learners: LearnerProfile[];
  activeLearnerId: string;
  activeLearnerProfile: LearnerProfile;
  stats: ReturnType<typeof createStats>;
  unlockedAchievements: string[];
  soundEnabled: boolean;
  score: number;
  stars: number; // Spendable star balance
  hasSeenTutorial: boolean;
  highScores: Record<string, number>; // High score per game type
  favouriteGameIds: string[]; // User-chosen games shown in Favourites section
  playedContentByPack: Record<string, string[]>; // Content-pack item ids seen by this learner
  // Device-scoped like `stars`; the applied theme is per learner in
  // `preferences.theme`. Ids no longer in the catalog are kept and ignored.
  ownedThemeIds: string[];

  // Actions
  setFavouriteGameIds: (ids: string[]) => void;
  updateStats: (
    updater: (stats: ReturnType<typeof createStats>) => ReturnType<typeof createStats>,
  ) => void;
  recordAnswer: (isCorrect: boolean, points?: number) => { newAchievements: AchievementData[] };
  recordGameStart: (gameType: string) => { newAchievements: AchievementData[] };
  /**
   * Records a finished round at `level`: a reached round at the highest
   * reached level counts toward the next, and the third raises it.
   */
  recordRoundResult: (gameType: string, level: number, reached: boolean) => RoundRecord;
  /** The level the learner plays at, the highest reached and the rounds toward the next. */
  getLevelProgress: (gameType: string) => { level: number } & MechanicLevelProgress;
  recordMechanicLevelUp: (mechanicId: string, newLevel: number) => void;
  setMechanicVariant: (mechanicId: string, variant: string | null) => void;
  /** Switch the active learner. No-op if id does not exist. */
  setActiveLearner: (id: string) => void;
  /** Create a new learner and append to the list. Returns the new id. */
  addLearner: (params: {
    displayName: string;
    persona?: 'kid' | 'adult';
    ageHint?: number;
  }) => string;
  /** Remove a learner by id. Switches to the first remaining if the
   *  active one is removed; refuses to remove the last learner. */
  removeLearner: (id: string) => void;
  recordSkillAttempt: (
    gameType: string,
    isCorrect: boolean,
    responseTimeMs: number,
    factKey?: string,
  ) => void;
  getLevelForGame: (gameType: string) => number;
  unlockAchievement: (id: string) => void;
  toggleSound: () => void;
  resetGame: () => void;
  earnStars: (count: number, reason?: string) => { newAchievements: AchievementData[] };
  spendStars: (count: number) => boolean;
  buyStars: (count: number) => boolean; // Temporary top-up until real purchases exist
  setScore: (score: number) => void;
  addScore: (points: number) => void;
  markTutorialSeen: () => void;
  /** Play at a level from 1 to the highest reached; a higher one is refused. */
  setLevel: (gameType: string, level: number) => void;
  updateHighScore: (gameType: string, score: number) => boolean; // Update high score, returns true if new record
  getHighScore: (gameType: string) => number; // Get high score for a game type
  recordPlayedContent: (packId: string, itemId: string) => void;
  getPlayedContent: (packId: string) => string[];
  /** Spend stars on a theme, grant it and apply it to the active learner. */
  buyTheme: (themeId: string) => boolean;
  /** Apply an owned (or the default) theme to the active learner. */
  applyTheme: (themeId: string) => boolean;
}

const initialActiveLearner = createActiveLearnerProfile();

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // Initial state
      learners: [initialActiveLearner],
      activeLearnerId: initialActiveLearner.id,
      activeLearnerProfile: initialActiveLearner,
      stats: createStats(),
      unlockedAchievements: [],
      soundEnabled: true,
      score: 0,
      stars: 0, // Spendable star balance
      hasSeenTutorial: false,
      highScores: {},
      favouriteGameIds: DEFAULT_FAVOURITE_GAME_IDS,
      playedContentByPack: {},
      ownedThemeIds: [],

      // Actions
      updateStats: (updater) => {
        const currentStats = get().stats;
        const newStats = updater(currentStats);
        set({ stats: newStats });
      },

      recordAnswer: (isCorrect: boolean, points: number = 0) => {
        const state = get();
        let updatedStats = recordStatsAnswer(state.stats, isCorrect);

        if (points > 0) {
          updatedStats = recordScore(updatedStats, points);
        }

        const { achievementData, unlockedAchievements } = unlockAchievementsFor(
          updatedStats,
          state.unlockedAchievements,
        );

        set({
          stats: updatedStats,
          unlockedAchievements,
        });

        return { newAchievements: achievementData };
      },

      recordGameStart: (gameType: string) => {
        const state = get();
        const updatedStats = recordGameStart(state.stats, gameType);

        const { achievementData, unlockedAchievements } = unlockAchievementsFor(
          updatedStats,
          state.unlockedAchievements,
        );

        set({
          stats: updatedStats,
          unlockedAchievements,
        });

        return { newAchievements: achievementData };
      },

      recordRoundResult: (gameType: string, level: number, reached: boolean) => {
        const state = get();
        const mechanicId = getMechanicIdForGame(gameType);
        const pref = state.activeLearnerProfile.mechanicPreference?.[mechanicId];
        const outcome = applyRoundToLevel(readMechanicLevelProgress(pref), level, reached);
        const { leveledUp, counted, highestLevel, roundsReached } = outcome;
        if (!counted) return { ...outcome, newAchievements: [] };

        const nextLearner = writeMechanicLevel(state.activeLearnerProfile, mechanicId, Date.now(), {
          difficulty: leveledUp ? highestLevel : level,
          highestLevel,
          roundsReached,
        });
        if (!leveledUp) {
          set(commitActiveLearner(state, nextLearner));
          return { ...outcome, newAchievements: [] };
        }

        const updatedStats = recordStatsLevelUp(state.stats, gameType, highestLevel);
        const { achievementData, unlockedAchievements } = unlockAchievementsFor(
          updatedStats,
          state.unlockedAchievements,
        );
        set({
          ...commitActiveLearner(state, nextLearner),
          stats: updatedStats,
          unlockedAchievements,
        });
        return { ...outcome, newAchievements: achievementData };
      },

      getLevelProgress: (gameType: string) => {
        const mechanicId = getMechanicIdForGame(gameType);
        const pref = get().activeLearnerProfile.mechanicPreference?.[mechanicId];
        return { level: get().getLevelForGame(gameType), ...readMechanicLevelProgress(pref) };
      },

      recordMechanicLevelUp: (mechanicId: string, newLevel: number) => {
        const state = get();
        const sanitized = Math.max(1, Math.floor(newLevel));
        const nextLearner = applyMechanicLevelToLearner(
          state.activeLearnerProfile,
          mechanicId,
          sanitized,
          Date.now(),
        );
        if (nextLearner !== state.activeLearnerProfile) {
          set(commitActiveLearner(state, nextLearner));
        }
      },

      setMechanicVariant: (mechanicId: string, variant: string | null) => {
        const state = get();
        const learner = state.activeLearnerProfile;
        const existing = learner.mechanicPreference?.[mechanicId];
        if (!existing && variant === null) return;
        const now = Date.now();
        const mechanicPreference = { ...(learner.mechanicPreference ?? {}) };
        if (variant === null) {
          const next = { ...(existing ?? { mechanicId, difficulty: 1, lastUpdatedAt: now }) };
          delete next.variant;
          mechanicPreference[mechanicId] = { ...next, mechanicId, lastUpdatedAt: now };
        } else {
          mechanicPreference[mechanicId] = {
            ...(existing ?? { mechanicId, difficulty: 1 }),
            mechanicId,
            variant,
            lastUpdatedAt: now,
          };
        }
        set(commitActiveLearner(state, { ...learner, mechanicPreference, updatedAt: now }));
      },

      recordSkillAttempt: (
        gameType: string,
        isCorrect: boolean,
        responseTimeMs: number,
        factKey?: string,
      ) => {
        const state = get();
        const updatedLearner = applyAttemptToLearner(
          state.activeLearnerProfile,
          gameType,
          isCorrect,
          responseTimeMs,
          Date.now(),
          factKey,
        );
        if (updatedLearner !== state.activeLearnerProfile) {
          set(commitActiveLearner(state, updatedLearner));
        }
      },

      unlockAchievement: (id: string) => {
        const state = get();
        if (!state.unlockedAchievements.includes(id)) {
          set({ unlockedAchievements: [...state.unlockedAchievements, id] });
        }
      },

      getLevelForGame: (gameType: string) => {
        // Single source of truth is mechanicPreference. Cold-start
        // learners and bindings with no recorded preference default to 1.
        const learner = get().activeLearnerProfile;
        const mechanicId = getMechanicIdForGame(gameType);
        const pref = learner.mechanicPreference?.[mechanicId];
        return pref && pref.difficulty > 0 ? pref.difficulty : 1;
      },

      toggleSound: () => {
        set((state) => ({ soundEnabled: !state.soundEnabled }));
      },

      resetGame: () => {
        const t = getTranslations();
        const confirmed = confirm(t.errors.confirmReset);
        if (confirmed) {
          const fresh = createActiveLearnerProfile();
          set({
            learners: [fresh],
            activeLearnerId: fresh.id,
            activeLearnerProfile: fresh,
            stats: createStats(),
            unlockedAchievements: [],
            soundEnabled: true,
            score: 0,
            stars: 0,
            hasSeenTutorial: false,
            highScores: {},
            favouriteGameIds: DEFAULT_FAVOURITE_GAME_IDS,
            playedContentByPack: {},
            ownedThemeIds: [],
          });
        }
      },

      earnStars: (count: number, _reason?: string) => {
        const earned = Math.max(0, count);
        const state = get();
        const newStars = state.stars + earned;
        const lifetimeStars = Math.max(0, state.stats.collectedStars ?? 0) + earned;

        const updatedStats = {
          ...state.stats,
          collectedStars: lifetimeStars,
        };

        const { achievementData, unlockedAchievements } = unlockAchievementsFor(
          updatedStats,
          state.unlockedAchievements,
        );

        set({
          stars: newStars,
          stats: updatedStats,
          unlockedAchievements,
        });

        return { newAchievements: achievementData };
      },

      spendStars: (count: number) => {
        if (count <= 0) return false;
        const state = get();
        if (state.stars >= count) {
          set({ stars: state.stars - count });
          return true;
        }
        return false;
      },

      buyStars: (count: number) => {
        if (count <= 0) return false;
        const state = get();
        set({ stars: state.stars + count });
        return true;
      },

      setScore: (score: number) => {
        set({ score });
      },

      addScore: (points: number) => {
        set((state) => ({ score: state.score + points }));
      },

      markTutorialSeen: () => {
        set({ hasSeenTutorial: true });
      },

      setLevel: (gameType: string, level: number) => {
        const state = get();
        const mechanicId = getMechanicIdForGame(gameType);
        const { highestLevel } = readMechanicLevelProgress(
          state.activeLearnerProfile.mechanicPreference?.[mechanicId],
        );
        if (level > highestLevel) return;
        const newLevel = Math.max(1, Math.floor(level));
        // Mechanic preference only; skill mastery does not drive the level badge.
        const now = Date.now();
        const nextLearner = applyMechanicLevelToLearner(
          state.activeLearnerProfile,
          mechanicId,
          newLevel,
          now,
        );
        set(commitActiveLearner(state, nextLearner));
      },

      updateHighScore: (gameType: string, score: number) => {
        const state = get();
        const currentHighScore = state.highScores[gameType] || 0;

        if (score > currentHighScore) {
          set({
            highScores: {
              ...state.highScores,
              [gameType]: score,
            },
          });
          return true;
        }
        return false;
      },

      getHighScore: (gameType: string) => {
        const state = get();
        return state.highScores[gameType] || 0;
      },

      recordPlayedContent: (packId: string, itemId: string) => {
        if (!packId || !itemId) return;
        const state = get();
        const current = state.playedContentByPack[packId] ?? [];
        const next = [itemId, ...current.filter((id) => id !== itemId)].slice(
          0,
          MAX_PLAYED_CONTENT_IDS_PER_PACK,
        );

        set({
          playedContentByPack: {
            ...state.playedContentByPack,
            [packId]: next,
          },
        });
      },

      getPlayedContent: (packId: string) => {
        const state = get();
        return state.playedContentByPack[packId] ?? [];
      },

      setFavouriteGameIds: (ids: string[]) => {
        set({ favouriteGameIds: ids });
      },

      setActiveLearner: (id: string) => {
        const state = get();
        const target = state.learners.find((l) => l.id === id);
        if (!target || id === state.activeLearnerId) return;
        set({ activeLearnerId: id, activeLearnerProfile: target });
      },

      addLearner: ({ displayName, persona = 'kid', ageHint }) => {
        const state = get();
        const base = createActiveLearnerProfile(displayName);
        const newLearner: LearnerProfile = {
          ...base,
          persona,
          ageHint,
          updatedAt: Date.now(),
        };
        set({
          learners: [...state.learners, newLearner],
        });
        return newLearner.id;
      },

      buyTheme: (themeId: string) => {
        const state = get();
        const result = purchaseTheme(state, themeId);
        if (!result.ok) return false;
        set({
          stars: result.stars,
          ownedThemeIds: result.ownedThemeIds,
          ...commitActiveLearner(
            state,
            withAppliedTheme(state.activeLearnerProfile, result.theme.id, Date.now()),
          ),
        });
        return true;
      },

      applyTheme: (themeId: string) => {
        const state = get();
        if (!canApplyTheme(themeId, state.ownedThemeIds)) return false;
        const learner = state.activeLearnerProfile;
        if (learner.preferences?.theme === themeId) return true;
        set(commitActiveLearner(state, withAppliedTheme(learner, themeId, Date.now())));
        return true;
      },

      removeLearner: (id: string) => {
        const state = get();
        if (state.learners.length <= 1) return;
        const remaining = state.learners.filter((l) => l.id !== id);
        if (remaining.length === state.learners.length) return;
        if (state.activeLearnerId === id) {
          const fallback = remaining[0]!;
          set({
            learners: remaining,
            activeLearnerId: fallback.id,
            activeLearnerProfile: fallback,
          });
        } else {
          set({ learners: remaining });
        }
      },
    }),
    {
      name: APP_KEY,
      version: GAME_STORE_VERSION,
      partialize: (state) => ({
        learners: state.learners,
        activeLearnerId: state.activeLearnerId,
        activeLearnerProfile: state.activeLearnerProfile,
        stats: state.stats,
        unlockedAchievements: state.unlockedAchievements,
        soundEnabled: state.soundEnabled,
        score: state.score,
        stars: state.stars,
        hasSeenTutorial: state.hasSeenTutorial,
        highScores: state.highScores,
        favouriteGameIds: state.favouriteGameIds,
        playedContentByPack: state.playedContentByPack,
        ownedThemeIds: state.ownedThemeIds,
      }),
      migrate: migrateGameStoreState,
    },
  ),
);
