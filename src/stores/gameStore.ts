import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { APP_KEY, getMechanicIdForGame } from '../games/data';
import {
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
import type { LearnerMeta, ParentFocus, ParentPin, TodayPath } from '../meta/types';
import { completeSlot, localDay, pathForDay, pathAfterFocus, type SlotResult } from '../meta/path';
import { PATH_CANDIDATES } from '../games/pathCandidates';
import type { Stats } from '../types/stats';
import {
  applyMechanicLevelToLearner,
  commitActiveLearner,
  createActiveLearnerProfile,
  DEFAULT_FAVOURITE_GAME_IDS,
  pathLearnerOf,
  readMechanicLevelProgress,
  unlockAchievementsFor,
  withAppliedTheme,
  withLearnerMeta,
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
  soundEnabled: boolean;
  hasSeenTutorial: boolean;
  favouriteGameIds: string[]; // User-chosen games shown in Favourites section
  playedContentByPack: Record<string, string[]>; // Content-pack item ids seen on this device
  /** The shop's free stars, for showing the app without playing (ADR 0005 point 5). */
  demoStarsEnabled: boolean;
  /** The parent's PIN on this device, null until a parent sets one (ADR 0005 point 6). */
  parentPin: ParentPin | null;

  // Actions
  setFavouriteGameIds: (ids: string[]) => void;
  updateStats: (updater: (stats: Stats) => Stats) => void;
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
  /** The demo switch's free stars; refused while the switch is off. */
  buyStars: (count: number) => boolean;
  setDemoStarsEnabled: (enabled: boolean) => void;
  /** The active learner's path for today, picked and stored on a new day. */
  ensureTodayPath: (now?: number) => TodayPath;
  /** A round from slot `slot` of today's path reached its goal: its sticker, and the day's end. */
  completePathSlot: (
    slot: number,
    gameId: string,
    startedAt?: number,
    now?: number,
  ) => SlotResult | null;
  /** The active learner's focus; today's open rounds follow it at once. */
  setParentFocus: (focus: ParentFocus | null, now?: number) => void;
  setParentPin: (pin: ParentPin) => void;
  /** A forgotten PIN: the PIN and every learner's focus go, progress stays. */
  clearParentPin: () => void;
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

type LearnerState = Pick<GameStore, 'learners' | 'activeLearnerId' | 'activeLearnerProfile'>;

const withMeta = withLearnerMeta;

/** New stats (and `extra` meta) for the active learner, and the achievements they unlock. */
function withStats(
  state: LearnerState,
  stats: Stats,
  extra: Partial<LearnerMeta> = {},
  learner: LearnerProfile = state.activeLearnerProfile,
) {
  const { achievementData, unlockedAchievements } = unlockAchievementsFor(
    stats,
    learner.meta.achievements,
  );
  return {
    patch: withMeta(state, { ...extra, stats, achievements: unlockedAchievements }, learner),
    newAchievements: achievementData,
  };
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // Initial state
      learners: [initialActiveLearner],
      activeLearnerId: initialActiveLearner.id,
      activeLearnerProfile: initialActiveLearner,
      soundEnabled: true,
      hasSeenTutorial: false,
      favouriteGameIds: DEFAULT_FAVOURITE_GAME_IDS,
      playedContentByPack: {},
      demoStarsEnabled: false,
      parentPin: null,

      // Actions
      updateStats: (updater) => {
        const state = get();
        set(withMeta(state, { stats: updater(state.activeLearnerProfile.meta.stats) }));
      },

      recordAnswer: (isCorrect: boolean, points: number = 0) => {
        const state = get();
        let updatedStats = recordStatsAnswer(state.activeLearnerProfile.meta.stats, isCorrect);
        if (points > 0) {
          updatedStats = recordScore(updatedStats, points);
        }
        const { patch, newAchievements } = withStats(state, updatedStats);
        set(patch);
        return { newAchievements };
      },

      recordGameStart: (gameType: string) => {
        const state = get();
        const { patch, newAchievements } = withStats(
          state,
          recordGameStart(state.activeLearnerProfile.meta.stats, gameType),
        );
        set(patch);
        return { newAchievements };
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

        const { patch, newAchievements } = withStats(
          state,
          recordStatsLevelUp(nextLearner.meta.stats, gameType, highestLevel),
          {},
          nextLearner,
        );
        set(patch);
        return { ...outcome, newAchievements };
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
        const { achievements } = state.activeLearnerProfile.meta;
        if (!achievements.includes(id)) {
          set(withMeta(state, { achievements: [...achievements, id] }));
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
            soundEnabled: true,
            hasSeenTutorial: false,
            favouriteGameIds: DEFAULT_FAVOURITE_GAME_IDS,
            playedContentByPack: {},
            demoStarsEnabled: false,
            parentPin: null,
          });
        }
      },

      earnStars: (count: number, _reason?: string) => {
        const earned = Math.max(0, count);
        const state = get();
        const { stars, stats } = state.activeLearnerProfile.meta;
        const { patch, newAchievements } = withStats(
          state,
          { ...stats, collectedStars: Math.max(0, stats.collectedStars ?? 0) + earned },
          { stars: stars + earned },
        );
        set(patch);
        return { newAchievements };
      },

      spendStars: (count: number) => {
        if (count <= 0) return false;
        const state = get();
        const { stars } = state.activeLearnerProfile.meta;
        if (stars < count) return false;
        set(withMeta(state, { stars: stars - count }));
        return true;
      },

      buyStars: (count: number) => {
        const state = get();
        if (count <= 0 || !state.demoStarsEnabled) return false;
        set(withMeta(state, { stars: state.activeLearnerProfile.meta.stars + count }));
        return true;
      },

      setDemoStarsEnabled: (enabled: boolean) => {
        set({ demoStarsEnabled: enabled });
      },

      ensureTodayPath: (now = Date.now()) => {
        const state = get();
        const learner = state.activeLearnerProfile;
        const day = localDay(now);
        if (learner.meta.path?.day === day) return learner.meta.path;
        const path = pathForDay(learner.meta, pathLearnerOf(learner), PATH_CANDIDATES, day);
        set(withMeta(state, { path }));
        return path;
      },

      completePathSlot: (slot, gameId, startedAt, now = Date.now()) => {
        const state = get();
        const { meta } = state.activeLearnerProfile;
        if (!meta.path) return null;
        const result = completeSlot(meta, meta.path, slot, gameId, now, startedAt ?? now);
        if (result) set(withMeta(state, result.meta));
        return result;
      },

      setParentFocus: (focus, now = Date.now()) => {
        const state = get();
        const learner = state.activeLearnerProfile;
        const path = pathAfterFocus(
          learner.meta,
          { ...pathLearnerOf(learner), focus },
          PATH_CANDIDATES,
          localDay(now),
        );
        set(withMeta(state, { focus, path }));
      },

      setParentPin: (pin) => {
        set({ parentPin: pin });
      },

      clearParentPin: () => {
        const state = get();
        const day = localDay(Date.now());
        const learners = state.learners.map((l) =>
          l.meta.focus === null
            ? l
            : {
                ...l,
                meta: {
                  ...l.meta,
                  focus: null,
                  path: pathAfterFocus(
                    l.meta,
                    { ...pathLearnerOf(l), focus: null },
                    PATH_CANDIDATES,
                    day,
                  ),
                },
              },
        );
        set({
          parentPin: null,
          learners,
          activeLearnerProfile:
            learners.find((l) => l.id === state.activeLearnerId) ?? state.activeLearnerProfile,
        });
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
        const { highScores } = state.activeLearnerProfile.meta;
        if (score <= (highScores[gameType] || 0)) return false;
        set(withMeta(state, { highScores: { ...highScores, [gameType]: score } }));
        return true;
      },

      getHighScore: (gameType: string) => {
        return get().activeLearnerProfile.meta.highScores[gameType] || 0;
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
        const learner = state.activeLearnerProfile;
        const result = purchaseTheme(learner.meta, themeId);
        if (!result.ok) return false;
        const { stars, ownedThemeIds } = result;
        set(
          withMeta(
            state,
            { stars, ownedThemeIds },
            withAppliedTheme(learner, result.theme.id, Date.now()),
          ),
        );
        return true;
      },

      applyTheme: (themeId: string) => {
        const state = get();
        const learner = state.activeLearnerProfile;
        if (!canApplyTheme(themeId, learner.meta.ownedThemeIds)) return false;
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
        soundEnabled: state.soundEnabled,
        hasSeenTutorial: state.hasSeenTutorial,
        favouriteGameIds: state.favouriteGameIds,
        playedContentByPack: state.playedContentByPack,
        demoStarsEnabled: state.demoStarsEnabled,
        parentPin: state.parentPin,
      }),
      migrate: migrateGameStoreState,
    },
  ),
);
