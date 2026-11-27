import { describe, it, expect } from 'vitest';
import {
  applyRoundToLevel,
  ROUNDS_PER_LEVEL,
  getGameBaseStarReward,
  getLevelStarBonus,
  calculateStarReward,
} from '../progression';
import { THEME_CATALOG } from '../../meta/themeCatalog';

describe('Progression Engine (Phase 3)', () => {
  describe('applyRoundToLevel', () => {
    const start = { highestLevel: 1, roundsReached: 0 };

    it('raises the level on the third round that reaches its goal', () => {
      let progress = start;
      for (let i = 0; i < ROUNDS_PER_LEVEL - 1; i++) {
        const outcome = applyRoundToLevel(progress, progress.highestLevel, true);
        expect(outcome.leveledUp).toBe(false);
        expect(outcome.counted).toBe(true);
        progress = outcome;
      }
      const third = applyRoundToLevel(progress, 1, true);
      expect(third).toEqual({ highestLevel: 2, roundsReached: 0, leveledUp: true, counted: true });
    });

    it('does not count a lost round', () => {
      const outcome = applyRoundToLevel({ highestLevel: 3, roundsReached: 2 }, 3, false);
      expect(outcome).toEqual({
        highestLevel: 3,
        roundsReached: 2,
        leveledUp: false,
        counted: false,
      });
    });

    it('counts nothing for a round below the highest level', () => {
      const outcome = applyRoundToLevel({ highestLevel: 4, roundsReached: 1 }, 2, true);
      expect(outcome.counted).toBe(false);
      expect(outcome.roundsReached).toBe(1);
      expect(outcome.highestLevel).toBe(4);
    });
  });

  describe('getGameBaseStarReward', () => {
    it('gives five stars for an easy game, six for a medium and seven for a hard one', () => {
      expect(getGameBaseStarReward('word_builder')).toBe(5);
      expect(getGameBaseStarReward('letter_match')).toBe(5);
      expect(getGameBaseStarReward('memory_math')).toBe(6);
      expect(getGameBaseStarReward('robo_path')).toBe(6);
      expect(getGameBaseStarReward('balance_scale')).toBe(7);
      expect(getGameBaseStarReward('multiplication_big_snake')).toBe(7);
    });
  });

  describe('getLevelStarBonus', () => {
    it('adds a star for every five levels above the first five', () => {
      expect(getLevelStarBonus(1)).toBe(0);
      expect(getLevelStarBonus(5)).toBe(0);
      expect(getLevelStarBonus(6)).toBe(1);
      expect(getLevelStarBonus(10)).toBe(1);
      expect(getLevelStarBonus(11)).toBe(2);
      expect(getLevelStarBonus(15)).toBe(2);
      expect(getLevelStarBonus(16)).toBe(3);
    });
  });

  describe('calculateStarReward', () => {
    it('adds the game, the level and one star for a round without a lost life', () => {
      expect(calculateStarReward('word_builder', 1, false)).toBe(5);
      expect(calculateStarReward('word_builder', 1, true)).toBe(6);
      expect(calculateStarReward('memory_math', 11, false)).toBe(8);
      expect(calculateStarReward('balance_scale', 16, true)).toBe(11);
    });

    it('prices the shop at about five rounds for the cheapest theme and fifteen for the dearest', () => {
      const costs = THEME_CATALOG.filter((t) => !t.isDefault).map((t) => t.cost);
      const typicalRound = calculateStarReward('memory_math', 1, false);
      expect(Math.min(...costs) / typicalRound).toBeCloseTo(5, 0);
      expect(Math.max(...costs) / typicalRound).toBeCloseTo(15, 0);
    });
  });
});
