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
import { mergeLearnerMeta, normalizeLearnerMeta } from '../meta/learnerMeta';

export const GAME_STORE_VERSION = 11;

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

export function migrateGameStoreState(persistedState: unknown, version = 0): unknown {
  if (!persistedState || typeof persistedState !== 'object') {
    return persistedState;
  }

  const stateObj = { ...(persistedState as Record<string, unknown>) };
  const defaultLearner = createActiveLearnerProfile();
  const defaults = {
    learners: [defaultLearner],
    activeLearnerId: defaultLearner.id,
    activeLearnerProfile: defaultLearner,
    soundEnabled: true,
    hasSeenTutorial: false,
    favouriteGameIds: DEFAULT_FAVOURITE_GAME_IDS,
    playedContentByPack: {},
    demoStarsEnabled: false,
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
  // v10 -> v11: stars, stats, achievements, high scores and owned themes move
  // from the device to the learner active now; the others start empty
  // (ADR 0005 point 4). Owned theme ids no longer in the catalog are kept, so
  // a theme that returns later is still owned. The global score goes.
  const deviceMeta = normalizeLearnerMeta({
    stars: stateObj.stars,
    stats: stateObj.stats,
    achievements: stateObj.unlockedAchievements,
    highScores: stateObj.highScores,
    ownedThemeIds: stateObj.ownedThemeIds,
  });
  for (const field of [
    'stars',
    'stats',
    'unlockedAchievements',
    'highScores',
    'ownedThemeIds',
    'score',
  ]) {
    delete stateObj[field];
  }
  // A learner that already has a meta (a store written back by an older
  // build) keeps it, joined with the device's. A sibling keeps the theme it
  // shows, if the device owned it, so it does not fall back unasked.
  const attachMeta = (learner: LearnerProfile): LearnerProfile => {
    const own = normalizeLearnerMeta(learner.meta);
    if (version >= 11) return { ...learner, meta: own };
    if (learner.id === activeLearner.id) {
      return { ...learner, meta: mergeLearnerMeta(own, deviceMeta) };
    }
    const shown = learner.preferences?.theme;
    const kept = shown && deviceMeta.ownedThemeIds.includes(shown) ? [shown] : [];
    return {
      ...learner,
      meta: { ...own, ownedThemeIds: [...new Set([...own.ownedThemeIds, ...kept])] },
    };
  };

  // v9 -> v10: levels rise by rounds; seed each mechanic's highest level.
  stateObj.activeLearnerProfile = attachMeta(seedRoundProgress(activeLearner));
  stateObj.learners = (stateObj.learners as LearnerProfile[]).map((l) =>
    l.id === activeLearner.id
      ? (stateObj.activeLearnerProfile as LearnerProfile)
      : attachMeta(seedRoundProgress(l)),
  );
  if (
    typeof stateObj.activeLearnerId !== 'string' ||
    !(stateObj.learners as LearnerProfile[]).some((l) => l.id === stateObj.activeLearnerId)
  ) {
    stateObj.activeLearnerId = activeLearner.id;
  }

  if (typeof stateObj.demoStarsEnabled !== 'boolean') delete stateObj.demoStarsEnabled;

  return { ...defaults, ...stateObj };
}
