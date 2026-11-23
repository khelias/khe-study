import { createStats } from '../engine/stats';
import { getMechanicIdForGame } from '../games/data';
import {
  applyLegacyGameLevelToLearner,
  LEGACY_GAME_SKILL_IDS,
  type LearnerProfile,
  type MechanicPreference,
} from '../learner';
import {
  createActiveLearnerProfile,
  DEFAULT_FAVOURITE_GAME_IDS,
  readMechanicLevelProgress,
} from './gameStoreHelpers';

export const GAME_STORE_VERSION = 10;

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

/**
 * v6 -> v7: seed `mechanicPreference[mechId].difficulty` from the highest
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
 * v9 -> v10: every mechanic preference gets its highest reached level
 * (`difficulty`) and zero rounds toward the next.
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
  const flatLikely = Object.values(raw).every((v) => typeof v === 'number');
  if (flatLikely) {
    const out: Record<string, number> = {};
    for (const [game, lvl] of Object.entries(raw)) {
      if (typeof lvl === 'number' && Number.isFinite(lvl)) out[game] = Math.max(1, Math.floor(lvl));
    }
    return out;
  }
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

  if ('collectedStars' in stateObj && typeof stateObj.collectedStars === 'number') {
    delete stateObj.collectedStars;
    if (typeof stateObj.stars !== 'number') {
      stateObj.stars = legacyTopLevelStars;
    }
  }

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

  // v9 -> v10: a round has lives of its own; the device's hearts go (ADR 0005 point 2).
  delete stateObj.hearts;
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
  // v8 -> v9: theme ownership. Keep every string id, even ones no longer in
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
  // v6 -> v7: seed `mechanicPreference` from highest skill level so the on-screen
  // level badge keeps its number after migration.
  stateObj.activeLearnerProfile = seedMechanicPreferenceFromSkillMastery(
    stateObj.activeLearnerProfile as LearnerProfile,
    Date.now(),
  );

  // v7 -> v8: wrap the single active learner into a learners[] list
  // so multiple kids can share the device.
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
  // v9 -> v10: levels rise by rounds; seed each mechanic's highest level.
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
