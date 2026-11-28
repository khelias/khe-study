import { describe, expect, it } from 'vitest';
import { createStats } from '../../engine/stats';
import { createLearnerMeta, mergeLearnerMeta, normalizeLearnerMeta } from '../learnerMeta';

describe('normalizeLearnerMeta', () => {
  it('starts a missing meta empty', () => {
    expect(normalizeLearnerMeta(undefined)).toEqual(createLearnerMeta());
    expect(normalizeLearnerMeta([])).toEqual(createLearnerMeta());
  });

  it('keeps valid parts and drops malformed ones', () => {
    const meta = normalizeLearnerMeta({
      stars: -4,
      stats: { gamesPlayed: 3 },
      achievements: ['first_game', 5, 'first_game'],
      highScores: { word_builder: 40, broken: 'x' },
      ownedThemeIds: ['sea', null, 'retired'],
    });

    expect(meta).toEqual({
      ...createLearnerMeta(),
      stars: 0,
      stats: { ...createStats(), gamesPlayed: 3 },
      achievements: ['first_game'],
      highScores: { word_builder: 40 },
      ownedThemeIds: ['sea', 'retired'],
    });
  });
});

describe('mergeLearnerMeta', () => {
  it('adds stars, keeps the busier stats, unites ids and keeps each better score', () => {
    const a = {
      ...createLearnerMeta(),
      stars: 5,
      stats: { ...createStats(), gamesPlayed: 1 },
      achievements: ['first_game'],
      highScores: { x: 10, y: 3 },
    };
    const b = {
      ...createLearnerMeta(),
      stars: 2,
      stats: { ...createStats(), gamesPlayed: 4 },
      achievements: ['first_game', 'streak_5'],
      highScores: { x: 7, z: 1 },
      ownedThemeIds: ['sea'],
    };

    expect(mergeLearnerMeta(a, b)).toEqual({
      ...createLearnerMeta(),
      stars: 7,
      stats: b.stats,
      achievements: ['first_game', 'streak_5'],
      highScores: { x: 10, y: 3, z: 1 },
      ownedThemeIds: ['sea'],
    });
  });
});
