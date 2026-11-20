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
import type { Stats } from '../types/stats';
import {
  applyRoundToLevel,
  type MechanicLevelProgress,
  type RoundLevelOutcome,
} from '../engine/progression';
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
import { purchaseTheme, canApplyTheme } from '../meta/inventory';

interface AchievementData {
  id: string;
  title: string;
  desc: string;
  icon: string;
}

export type RoundRecord = RoundLevelOutcome & { newAchievements: AchievementData[] };

export const STAR_PURCHASE_AMOUNT = 50;

const DEFAULT_FAVOURITE_GAME_IDS = ['battlelearn', 'word_cascade', 'addition_snake'];
const MAX_PLAYED_CONTENT_IDS_PER_PACK = 100;
export const GAME_STORE_VERSION = 10;
const DEFAULT_LOCALE = 'en' as const;
const DEFAULT_LEARNER_NAME = 'Learner';

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
 * Write helpers that keep `learners[]` and `activeLearnerProfile`
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

function withAppliedTheme(learner: LearnerProfile, themeId: string, now: number): LearnerProfile {
  // `isLearnerProfile` does not check `preferences`, so a persisted learner
  // may lack it.
  const preferences = learner.preferences ?? { locale: DEFAULT_LOCALE };
  return { ...learner, preferences: { ...preferences, theme: themeId }, updatedAt: now };
}

/**
 * v6 → v7: seed `mechanicPreference[mechId].difficulty` from the highest
 * skill-mastery level across all gameTypes mapped to that mechanic, so a
 * player who reached level N on the skill axis does not restart from 1 on
 * the mechanic axis.
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
 * Write helper for the mechanic axis. Stores the new level under
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
  const progress = readMechanicLevelProgress(existing);
  const highestLevel = Math.max(progress.highestLevel, newLevel);
  if (existing && existing.difficulty === newLevel && existing.highestLevel === highestLevel) {
    return learner;
  }
  return writeMechanicLevel(learner, mechanicId, now, {
    difficulty: newLevel,
    highestLevel,
    roundsReached: highestLevel > progress.highestLevel ? 0 : progress.roundsReached,
  });
}

/** The one writer of a mechanic's level: the level played, the highest reached and rounds toward the next. */
function writeMechanicLevel(
  learner: LearnerProfile,
  mechanicId: string,
  now: number,
  level: { difficulty: number } & MechanicLevelProgress,
): LearnerProfile {
  const existing = learner.mechanicPreference?.[mechanicId];
  return {
    ...learner,
    mechanicPreference: {
      ...(learner.mechanicPreference ?? {}),
      [mechanicId]: { ...(existing ?? { mechanicId }), mechanicId, ...level, lastUpdatedAt: now },
    },
    updatedAt: now,
  };
}

/** The achievements the new stats unlock, with their copy, and the unlocked ids after them. */
function unlockAchievementsFor(
  stats: Stats,
  unlocked: string[],
): { achievementData: AchievementData[]; unlockedAchievements: string[] } {
  const newAchievements = checkAchievements(stats, unlocked);
  if (newAchievements.length === 0) return { achievementData: [], unlockedAchievements: unlocked };
  const t = getTranslations();
  return {
    achievementData: newAchievements.map((a) => {
      const copy = getAchievementCopy(t, a.id);
      return { id: a.id, title: copy.title, desc: copy.desc, icon: a.icon };
    }),
    unlockedAchievements: [...unlocked, ...newAchievements.map((a) => a.id)],
  };
}

/** A preference stored before v10 has only `difficulty`, which is then the highest level. */
function readMechanicLevelProgress(pref: MechanicPreference | undefined): MechanicLevelProgress {
  const difficulty = pref && pref.difficulty > 0 ? pref.difficulty : 1;
  return {
    highestLevel: Math.max(difficulty, pref?.highestLevel ?? difficulty),
    roundsReached: Math.max(0, pref?.roundsReached ?? 0),
  };
}

/**
 * v9 → v10: every mechanic preference gets its highest reached level
 * (today's `difficulty`) and no rounds toward the next.
 */
function seedRoundProgress(learner: LearnerProfile): LearnerProfile {
  const prefs = learner.mechanicPreference;
  if (!prefs) return learner;
  const mechanicPreference: Record<string, MechanicPreference> = {};
  for (const [id, pref] of Object.entries(prefs)) {
    mechanicPreference[id] = { ...pref, ...readMechanicLevelProgress(pref) };
  }
  return { ...learner, mechanicPreference };
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
    hasSeenTutorial: false,
    highScores: {},
    favouriteGameIds: DEFAULT_FAVOURITE_GAME_IDS,
    playedContentByPack: {},
    ownedThemeIds: [],
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

  // v9 → v10: a round has lives of its own; the device's hearts go (ADR 0005 point 2).
  delete stateObj.hearts;
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
  // v8 → v9: theme ownership. Keep every string id, even ones no longer in
  // the catalog, so a theme that returns later is still owned.
  stateObj.ownedThemeIds = Array.isArray(stateObj.ownedThemeIds)
    ? [...new Set(stateObj.ownedThemeIds.filter((id): id is string => typeof id === 'string'))]
    : [];

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

  // v7 → v8: wrap the single active learner into a learners[] list
  // so multiple kids can share the device. Pre-existing top-level fields
  // (achievements, stats, stars) stay device-scoped for now.
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
  // v9 → v10: levels rise by rounds; seed each mechanic's highest level.
  stateObj.activeLearnerProfile = seedRoundProgress(activeLearner);
  stateObj.learners = (stateObj.learners as LearnerProfile[]).map((l) =>
    l.id === activeLearner.id
      ? (stateObj.activeLearnerProfile as LearnerProfile)
      : seedRoundProgress(l),
  );
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
        // Mechanic preference only; skill mastery does not drive the TASE badge.
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
          return true; // New record
        }
        return false; // No new record
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
        hasSeenTutorial: state.hasSeenTutorial,
        highScores: state.highScores,
        favouriteGameIds: state.favouriteGameIds,
        playedContentByPack: state.playedContentByPack,
        ownedThemeIds: state.ownedThemeIds,
      }),
      // Handle migration from old localStorage format
      migrate: migrateGameStoreState,
    },
  ),
);
