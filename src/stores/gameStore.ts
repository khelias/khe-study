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
import { checkAchievements } from '../engine/achievements';
import { getTranslations } from '../i18n';
import { getAchievementCopy } from '../utils/achievementCopy';
import {
  applyAttemptToLearner,
  applyLegacyGameLevelToLearner,
  createLearnerProfileFromLegacyProgress,
  LEGACY_GAME_SKILL_IDS,
  type LearnerProfile,
  type MechanicPreference,
} from '../learner';

interface AchievementData {
  id: string;
  title: string;
  desc: string;
  icon: string;
}

export const MAX_HEARTS = 5;
export const DEFAULT_HEARTS = 3;
export const HEART_COST_STARS = 10;
export const STAR_PURCHASE_AMOUNT = 50;

const DEFAULT_FAVOURITE_GAME_IDS = ['battlelearn', 'word_cascade', 'addition_snake'];
const MAX_PLAYED_CONTENT_IDS_PER_PACK = 100;
export const GAME_STORE_VERSION = 8;
const DEFAULT_LOCALE = 'en';
const DEFAULT_LEARNER_NAME = 'Learner';

export interface GameStore {
  // State
  // Phase 6: multi-learner per device. `learners` is the canonical list,
  // `activeLearnerId` selects which one is currently playing, and
  // `activeLearnerProfile` is a kept-in-sync alias for the active entry so
  // existing consumers reading `state.activeLearnerProfile` keep working.
  learners: LearnerProfile[];
  activeLearnerId: string;
  activeLearnerProfile: LearnerProfile;
  stats: ReturnType<typeof createStats>;
  unlockedAchievements: string[];
  soundEnabled: boolean;
  score: number;
  stars: number; // Spendable star balance
  hearts: number; // Persistent global resource (replaces session hearts)
  hasSeenTutorial: boolean;
  highScores: Record<string, number>; // High score per game type
  favouriteGameIds: string[]; // User-chosen games shown in Favourites section
  playedContentByPack: Record<string, string[]>; // Content-pack item ids seen by this learner

  // Actions
  setFavouriteGameIds: (ids: string[]) => void;
  updateStats: (
    updater: (stats: ReturnType<typeof createStats>) => ReturnType<typeof createStats>,
  ) => void;
  recordAnswer: (isCorrect: boolean, points?: number) => { newAchievements: AchievementData[] };
  recordGameStart: (gameType: string) => { newAchievements: AchievementData[] };
  recordLevelUp: (gameType: string, newLevel: number) => { newAchievements: AchievementData[] };
  recordMechanicLevelUp: (mechanicId: string, newLevel: number) => void;
  setMechanicVariant: (mechanicId: string, variant: string | null) => void;
  /** Phase 6: switch the active learner. No-op if id does not exist. */
  setActiveLearner: (id: string) => void;
  /** Phase 6: create a new learner and append to the list. Returns the new id. */
  addLearner: (params: {
    displayName: string;
    persona?: 'kid' | 'adult';
    ageHint?: number;
  }) => string;
  /** Phase 6: remove a learner by id. Switches to the first remaining if the
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
  spendHeart: () => boolean; // Returns true if heart was spent, false if no hearts available
  addHeart: (count?: number) => void; // Adds hearts up to MAX_HEARTS
  buyHeartsWithStars: (count: number) => boolean; // Buy hearts with stars, returns true if successful
  buyStars: (count: number) => boolean; // Temporary top-up until real purchases exist
  setScore: (score: number) => void;
  addScore: (points: number) => void;
  markTutorialSeen: () => void;
  setLevel: (gameType: string, level: number) => void; // Manually set level for a game
  updateHighScore: (gameType: string, score: number) => boolean; // Update high score, returns true if new record
  getHighScore: (gameType: string) => number; // Get high score for a game type
  recordPlayedContent: (packId: string, itemId: string) => void;
  getPlayedContent: (packId: string) => string[];
}

function isLearnerProfile(value: unknown): value is LearnerProfile {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<LearnerProfile>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.displayName === 'string' &&
    typeof candidate.skillMastery === 'object' &&
    candidate.skillMastery !== null
  );
}

/** Fresh learner profile with no recorded mastery. */
function createActiveLearnerProfile(displayName: string = DEFAULT_LEARNER_NAME): LearnerProfile {
  return createLearnerProfileFromLegacyProgress({
    displayName,
    legacyProfileId: '__active__',
    levelsByProfile: { __active__: {} },
    locale: DEFAULT_LOCALE,
    now: Date.now(),
  });
}

/**
 * Phase 6: write helpers that keep `learners[]` and `activeLearnerProfile`
 * in lockstep. Every action that mutates the active learner routes through
 * `commitActiveLearner`; the returned partial can be spread into `set(...)`.
 */
function commitActiveLearner(
  state: { learners: LearnerProfile[]; activeLearnerId: string },
  next: LearnerProfile,
): { learners: LearnerProfile[]; activeLearnerProfile: LearnerProfile } {
  return {
    learners: state.learners.map((l) => (l.id === state.activeLearnerId ? next : l)),
    activeLearnerProfile: next,
  };
}

/**
 * v6 → v7: seed `mechanicPreference[mechId].difficulty` from the highest
 * skill-mastery level across all gameTypes mapped to that mechanic, so a
 * player who reached level N before Phase 5 does not restart from 1 on the
 * new axis.
 */
function seedMechanicPreferenceFromSkillMastery(
  learner: LearnerProfile,
  now: number,
): LearnerProfile {
  // Tolerate v6 learners without the field; seed only if nothing is set yet.
  const existing = learner.mechanicPreference ?? {};
  if (Object.keys(existing).length > 0) {
    return learner.mechanicPreference ? learner : { ...learner, mechanicPreference: existing };
  }

  const byMechanic = new Map<string, number>();
  for (const gameType of Object.keys(LEGACY_GAME_SKILL_IDS)) {
    const skillIds = LEGACY_GAME_SKILL_IDS[gameType];
    if (!skillIds || skillIds.length === 0) continue;
    let maxLevel = 0;
    for (const skillId of skillIds) {
      const mastery = learner.skillMastery[skillId];
      if (mastery && mastery.level > maxLevel) maxLevel = mastery.level;
    }
    if (maxLevel <= 0) continue;
    const mechanicId = getMechanicIdForGame(gameType);
    const current = byMechanic.get(mechanicId) ?? 0;
    if (maxLevel > current) byMechanic.set(mechanicId, maxLevel);
  }

  if (byMechanic.size === 0) {
    // No skill mastery to seed from; still guarantee the field exists.
    return learner.mechanicPreference ? learner : { ...learner, mechanicPreference: {} };
  }
  const mechanicPreference: Record<string, MechanicPreference> = {};
  for (const [mechanicId, difficulty] of byMechanic) {
    mechanicPreference[mechanicId] = {
      mechanicId,
      difficulty,
      lastUpdatedAt: now,
    };
  }
  return { ...learner, mechanicPreference, updatedAt: now };
}

/**
 * Phase 5b: write helper for the mechanic axis. Stores the new level under
 * `mechanicPreference[mechanicId]` and stamps `lastUpdatedAt`. Does not touch
 * `skillMastery` — that progression lives on the other axis.
 */
function applyMechanicLevelToLearner(
  learner: LearnerProfile,
  mechanicId: string,
  newLevel: number,
  now: number,
): LearnerProfile {
  const existing = learner.mechanicPreference?.[mechanicId];
  if (existing && existing.difficulty === newLevel) return learner;
  const mechanicPreference = {
    ...(learner.mechanicPreference ?? {}),
    [mechanicId]: {
      ...(existing ?? { mechanicId }),
      mechanicId,
      difficulty: newLevel,
      lastUpdatedAt: now,
    },
  };
  return { ...learner, mechanicPreference, updatedAt: now };
}

/**
 * Fold a flat `levels[gameType]` map (v5 mirror) into an existing learner so
 * the v6 store keeps the highest level the player ever reached.
 */
function mergeLegacyLevelsIntoLearner(
  learner: LearnerProfile,
  levels: Record<string, number>,
  now: number,
): LearnerProfile {
  // Apply ascending so when several gameTypes map to the same skill, the
  // highest level wins (applyLegacyGameLevelToLearner overwrites, not merges).
  const ordered = Object.entries(levels)
    .filter(([, lvl]) => typeof lvl === 'number' && lvl > 0)
    .sort(([, a], [, b]) => a - b);
  let next = learner;
  for (const [gameType, lvl] of ordered) {
    next = applyLegacyGameLevelToLearner(next, gameType, lvl, now);
  }
  return next;
}

/**
 * Collapse legacy v4 `levels[profileId][gameType]` into the flat
 * `levels[gameType]` shape, picking the highest level recorded across both
 * starter and advanced profiles so a player who advanced under either does
 * not lose ground after the migration.
 */
function flattenLegacyLevels(input: unknown): Record<string, number> | null {
  if (!input || typeof input !== 'object') return null;
  const raw = input as Record<string, unknown>;
  // Already flat? Heuristic: all values are numbers.
  const flatLikely = Object.values(raw).every((v) => typeof v === 'number');
  if (flatLikely) {
    const out: Record<string, number> = {};
    for (const [game, lvl] of Object.entries(raw)) {
      if (typeof lvl === 'number' && Number.isFinite(lvl)) out[game] = Math.max(1, Math.floor(lvl));
    }
    return out;
  }
  // Legacy nested shape.
  const merged: Record<string, number> = {};
  for (const inner of Object.values(raw)) {
    if (!inner || typeof inner !== 'object') continue;
    for (const [game, lvl] of Object.entries(inner as Record<string, unknown>)) {
      if (typeof lvl !== 'number' || !Number.isFinite(lvl)) continue;
      const v = Math.max(1, Math.floor(lvl));
      if (!(game in merged) || merged[game]! < v) merged[game] = v;
    }
  }
  return merged;
}

export function migrateGameStoreState(persistedState: unknown): unknown {
  if (!persistedState || typeof persistedState !== 'object') {
    return persistedState;
  }

  const stateObj = { ...(persistedState as Record<string, unknown>) };
  const defaultLearner = createActiveLearnerProfile();
  const defaults = {
    learners: [defaultLearner],
    activeLearnerId: defaultLearner.id,
    activeLearnerProfile: defaultLearner,
    stats: createStats(),
    unlockedAchievements: [],
    soundEnabled: true,
    score: 0,
    stars: 0,
    hearts: DEFAULT_HEARTS,
    hasSeenTutorial: false,
    highScores: {},
    favouriteGameIds: DEFAULT_FAVOURITE_GAME_IDS,
    playedContentByPack: {},
  };

  // `profile` field no longer exists; remove if present.
  delete stateObj.profile;
  // Legacy `levels` (v4 nested or v5 flat) is folded into the learner's
  // skillMastery so a player who advanced before v6 does not lose ground.
  const flatLevels = flattenLegacyLevels(stateObj.levels);
  delete stateObj.levels;

  const legacyTopLevelStars =
    'collectedStars' in stateObj && typeof stateObj.collectedStars === 'number'
      ? Math.max(0, stateObj.collectedStars)
      : undefined;

  // Migrate old top-level collectedStars to the spendable star balance if needed.
  if ('collectedStars' in stateObj && typeof stateObj.collectedStars === 'number') {
    delete stateObj.collectedStars;
    if (typeof stateObj.stars !== 'number') {
      stateObj.stars = legacyTopLevelStars;
    }
  }

  // Keep stars as current spendable balance and stats.collectedStars as lifetime
  // earned stars for stats + achievement thresholds.
  if (typeof stateObj.stars === 'number') {
    stateObj.stars = Math.max(0, stateObj.stars);
  }

  const statsObj =
    stateObj.stats && typeof stateObj.stats === 'object'
      ? (stateObj.stats as Record<string, unknown>)
      : undefined;
  if (statsObj) {
    const statsLifetime =
      typeof statsObj.collectedStars === 'number' ? Math.max(0, statsObj.collectedStars) : 0;
    if (typeof stateObj.stars !== 'number') {
      stateObj.stars = statsLifetime;
    }
    statsObj.collectedStars = Math.max(statsLifetime, legacyTopLevelStars ?? 0);
  } else {
    stateObj.stats = {
      ...createStats(),
      collectedStars: Math.max(
        typeof stateObj.stars === 'number' ? stateObj.stars : 0,
        legacyTopLevelStars ?? 0,
      ),
    };
  }

  // Migrate hearts: if hearts don't exist, set to default
  if (!('hearts' in stateObj) || typeof stateObj.hearts !== 'number') {
    stateObj.hearts = DEFAULT_HEARTS;
  }
  // Ensure hearts stay within the supported global-resource range
  if (typeof stateObj.hearts === 'number') {
    stateObj.hearts = Math.min(MAX_HEARTS, Math.max(0, stateObj.hearts));
  }
  // Migrate featuredGameIds -> favouriteGameIds; default if missing
  if (Array.isArray(stateObj.featuredGameIds)) {
    stateObj.favouriteGameIds = stateObj.featuredGameIds.filter((id) => typeof id === 'string');
    delete stateObj.featuredGameIds;
  }
  if (!Array.isArray(stateObj.favouriteGameIds)) {
    stateObj.favouriteGameIds = DEFAULT_FAVOURITE_GAME_IDS;
  }
  if (!stateObj.playedContentByPack || typeof stateObj.playedContentByPack !== 'object') {
    stateObj.playedContentByPack = {};
  }

  if (!isLearnerProfile(stateObj.activeLearnerProfile)) {
    stateObj.activeLearnerProfile = createActiveLearnerProfile();
  }
  if (flatLevels) {
    stateObj.activeLearnerProfile = mergeLegacyLevelsIntoLearner(
      stateObj.activeLearnerProfile as LearnerProfile,
      flatLevels,
      Date.now(),
    );
  }
  // v6 → v7: seed `mechanicPreference` from highest skill level so the on-screen
  // TASE badge keeps its number after migration.
  stateObj.activeLearnerProfile = seedMechanicPreferenceFromSkillMastery(
    stateObj.activeLearnerProfile as LearnerProfile,
    Date.now(),
  );

  // v7 → v8 (Phase 6): wrap the single active learner into a learners[] list
  // so multiple kids can share the device. Pre-existing top-level fields
  // (achievements, stats, stars, hearts) stay device-scoped for now.
  const activeLearner = stateObj.activeLearnerProfile as LearnerProfile;
  if (!Array.isArray(stateObj.learners) || stateObj.learners.length === 0) {
    stateObj.learners = [activeLearner];
  } else {
    // Ensure the active learner is present in the persisted list; replace stale
    // entries with the same id (the canonical copy is `activeLearnerProfile`).
    const existing = stateObj.learners as LearnerProfile[];
    const replaced = existing.map((l) => (l.id === activeLearner.id ? activeLearner : l));
    const includesActive = replaced.some((l) => l.id === activeLearner.id);
    stateObj.learners = includesActive ? replaced : [...replaced, activeLearner];
  }
  if (
    typeof stateObj.activeLearnerId !== 'string' ||
    !(stateObj.learners as LearnerProfile[]).some((l) => l.id === stateObj.activeLearnerId)
  ) {
    stateObj.activeLearnerId = activeLearner.id;
  }

  return { ...defaults, ...stateObj };
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
      hearts: DEFAULT_HEARTS, // Persistent global resource
      hasSeenTutorial: false,
      highScores: {},
      favouriteGameIds: DEFAULT_FAVOURITE_GAME_IDS,
      playedContentByPack: {},

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

        // Check for new achievements
        const newAchievements = checkAchievements(updatedStats, state.unlockedAchievements);
        const t = getTranslations();
        const achievementData: AchievementData[] = newAchievements.map((a) => {
          const copy = getAchievementCopy(t, a.id);
          return {
            id: a.id,
            title: copy.title,
            desc: copy.desc,
            icon: a.icon,
          };
        });

        set({
          stats: updatedStats,
          unlockedAchievements:
            newAchievements.length > 0
              ? [...state.unlockedAchievements, ...newAchievements.map((a) => a.id)]
              : state.unlockedAchievements,
        });

        return { newAchievements: achievementData };
      },

      recordGameStart: (gameType: string) => {
        const state = get();
        const updatedStats = recordGameStart(state.stats, gameType);

        // Check for new achievements
        const newAchievements = checkAchievements(updatedStats, state.unlockedAchievements);
        const t = getTranslations();
        const achievementData: AchievementData[] = newAchievements.map((a) => {
          const copy = getAchievementCopy(t, a.id);
          return {
            id: a.id,
            title: copy.title,
            desc: copy.desc,
            icon: a.icon,
          };
        });

        set({
          stats: updatedStats,
          unlockedAchievements:
            newAchievements.length > 0
              ? [...state.unlockedAchievements, ...newAchievements.map((a) => a.id)]
              : state.unlockedAchievements,
        });

        return { newAchievements: achievementData };
      },

      recordLevelUp: (gameType: string, newLevel: number) => {
        const state = get();

        // Update stats
        const updatedStats = recordStatsLevelUp(state.stats, gameType, newLevel);

        // Check for new achievements
        const newAchievements = checkAchievements(updatedStats, state.unlockedAchievements);
        const t = getTranslations();
        const achievementData: AchievementData[] = newAchievements.map((a) => {
          const copy = getAchievementCopy(t, a.id);
          return {
            id: a.id,
            title: copy.title,
            desc: copy.desc,
            icon: a.icon,
          };
        });

        // Phase 5f: mechanic preference is the single TASE axis. Skill
        // mastery level is no longer written here; per-skill progress lives
        // entirely in rolling stats / factsKnown via `recordSkillAttempt`.
        const now = Date.now();
        const mechanicId = getMechanicIdForGame(gameType);
        const nextLearner = applyMechanicLevelToLearner(
          state.activeLearnerProfile,
          mechanicId,
          newLevel,
          now,
        );

        set({
          ...commitActiveLearner(state, nextLearner),
          stats: updatedStats,
          unlockedAchievements:
            newAchievements.length > 0
              ? [...state.unlockedAchievements, ...newAchievements.map((a) => a.id)]
              : state.unlockedAchievements,
        });

        return { newAchievements: achievementData };
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
        // Phase 5f: single source of truth is mechanicPreference. Cold-start
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
            hearts: DEFAULT_HEARTS,
            hasSeenTutorial: false,
            highScores: {},
            favouriteGameIds: DEFAULT_FAVOURITE_GAME_IDS,
            playedContentByPack: {},
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

        // Check for new achievements
        const newAchievements = checkAchievements(updatedStats, state.unlockedAchievements);
        const t = getTranslations();
        const achievementData: AchievementData[] = newAchievements.map((a) => {
          const copy = getAchievementCopy(t, a.id);
          return {
            id: a.id,
            title: copy.title,
            desc: copy.desc,
            icon: a.icon,
          };
        });

        set({
          stars: newStars,
          stats: updatedStats,
          unlockedAchievements:
            newAchievements.length > 0
              ? [...state.unlockedAchievements, ...newAchievements.map((a) => a.id)]
              : state.unlockedAchievements,
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

      spendHeart: () => {
        const state = get();
        if (state.hearts > 0) {
          set({ hearts: state.hearts - 1 });
          return true;
        }
        return false;
      },

      addHeart: (count: number = 1) => {
        const state = get();
        const newHearts = Math.min(state.hearts + count, MAX_HEARTS);
        set({ hearts: newHearts });
      },

      buyHeartsWithStars: (count: number) => {
        if (count <= 0) return false;
        const state = get();
        const heartsCanAdd = Math.min(count, MAX_HEARTS - state.hearts);
        const totalCost = HEART_COST_STARS * heartsCanAdd;

        if (state.stars >= totalCost && heartsCanAdd > 0) {
          set({
            stars: state.stars - totalCost,
            hearts: Math.min(state.hearts + heartsCanAdd, MAX_HEARTS),
          });
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
        // Ensure level is at least 1
        const newLevel = Math.max(1, level);
        // Phase 5f: mechanic preference only. Skill mastery level is no
        // longer the source of truth for the TASE badge.
        const now = Date.now();
        const mechanicId = getMechanicIdForGame(gameType);
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
        const baseType = gameType.replace('_adv', '');
        const currentHighScore = state.highScores[baseType] || 0;

        if (score > currentHighScore) {
          set({
            highScores: {
              ...state.highScores,
              [baseType]: score,
            },
          });
          return true; // New record
        }
        return false; // No new record
      },

      getHighScore: (gameType: string) => {
        const state = get();
        const baseType = gameType.replace('_adv', '');
        return state.highScores[baseType] || 0;
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

      removeLearner: (id: string) => {
        const state = get();
        if (state.learners.length <= 1) return; // refuse to delete the last
        const remaining = state.learners.filter((l) => l.id !== id);
        if (remaining.length === state.learners.length) return; // id not found
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
        hearts: state.hearts,
        hasSeenTutorial: state.hasSeenTutorial,
        highScores: state.highScores,
        favouriteGameIds: state.favouriteGameIds,
        playedContentByPack: state.playedContentByPack,
      }),
      // Handle migration from old localStorage format
      migrate: migrateGameStoreState,
    },
  ),
);
