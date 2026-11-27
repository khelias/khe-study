import { checkAchievements } from '../engine/achievements';
import type { MechanicLevelProgress } from '../engine/progression';
import { DEFAULT_LOCALE, getTranslations } from '../i18n';
import {
  createLearnerProfileFromLegacyProgress,
  type LearnerProfile,
  type MechanicPreference,
} from '../learner';
import type { Stats } from '../types/stats';
import { getAchievementCopy } from '../utils/achievementCopy';

export interface AchievementData {
  id: string;
  title: string;
  desc: string;
  icon: string;
}

export const DEFAULT_FAVOURITE_GAME_IDS: string[] = [];
const DEFAULT_LEARNER_NAME = 'Learner';

/** Fresh learner profile with no recorded mastery. */
export function createActiveLearnerProfile(
  displayName: string = DEFAULT_LEARNER_NAME,
): LearnerProfile {
  return createLearnerProfileFromLegacyProgress({
    displayName,
    legacyProfileId: '__active__',
    levelsByProfile: { __active__: {} },
    locale: DEFAULT_LOCALE,
    now: Date.now(),
  });
}

/**
 * Write helper that keeps `learners[]` and `activeLearnerProfile` in lockstep.
 * Every action that mutates the active learner routes through this helper.
 */
export function commitActiveLearner(
  state: { learners: LearnerProfile[]; activeLearnerId: string },
  next: LearnerProfile,
): { learners: LearnerProfile[]; activeLearnerProfile: LearnerProfile } {
  return {
    learners: state.learners.map((l) => (l.id === state.activeLearnerId ? next : l)),
    activeLearnerProfile: next,
  };
}

export function withAppliedTheme(
  learner: LearnerProfile,
  themeId: string,
  now: number,
): LearnerProfile {
  // Persisted learners validated by `isLearnerProfile` may lack `preferences`.
  const preferences = learner.preferences ?? { locale: DEFAULT_LOCALE };
  return { ...learner, preferences: { ...preferences, theme: themeId }, updatedAt: now };
}

/** A preference stored before v10 has only `difficulty`, which is then the highest level. */
export function readMechanicLevelProgress(
  pref: MechanicPreference | undefined,
): MechanicLevelProgress {
  const difficulty = pref && pref.difficulty > 0 ? pref.difficulty : 1;
  return {
    highestLevel: Math.max(difficulty, pref?.highestLevel ?? difficulty),
    roundsReached: Math.max(0, pref?.roundsReached ?? 0),
  };
}

/** The one writer of a mechanic's level: the level played, the highest reached and rounds toward the next. */
export function writeMechanicLevel(
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

/**
 * Write helper for the mechanic axis. Stores the new level under
 * `mechanicPreference[mechanicId]` and stamps `lastUpdatedAt` without touching `skillMastery`.
 */
export function applyMechanicLevelToLearner(
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

/** The achievements the new stats unlock, with their copy, and the unlocked ids after them. */
export function unlockAchievementsFor(
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
