import { describe, it, expect } from 'vitest';
import {
  applyRoundToLevel,
  ROUNDS_PER_LEVEL,
  getGameBaseStarReward,
  getLevelStarMultiplier,
  calculateStarReward,
} from '../progression';

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
    it('should return 1 for easy games', () => {
      expect(getGameBaseStarReward('word_builder')).toBe(1);
      expect(getGameBaseStarReward('letter_match')).toBe(1);
      expect(getGameBaseStarReward('compare_sizes')).toBe(1);
    });

    it('should return 2 for medium games', () => {
      expect(getGameBaseStarReward('memory_math')).toBe(2);
      expect(getGameBaseStarReward('robo_path')).toBe(2);
      expect(getGameBaseStarReward('multiplication_snake')).toBe(2);
    });

    it('should return 3 for hard games', () => {
      expect(getGameBaseStarReward('balance_scale')).toBe(3);
      expect(getGameBaseStarReward('time_match')).toBe(3);
      expect(getGameBaseStarReward('multiplication_big_snake')).toBe(3);
    });

    it('should handle game types for star reward', () => {
      expect(getGameBaseStarReward('addition_snake')).toBe(1);
      expect(getGameBaseStarReward('balance_scale')).toBe(3);
    });
  });

  describe('getLevelStarMultiplier', () => {
    it('should return correct multipliers', () => {
      expect(getLevelStarMultiplier(1)).toBe(1.0);
      expect(getLevelStarMultiplier(5)).toBe(1.0);
      expect(getLevelStarMultiplier(6)).toBe(1.5);
      expect(getLevelStarMultiplier(10)).toBe(1.5);
      expect(getLevelStarMultiplier(11)).toBe(2.0);
      expect(getLevelStarMultiplier(15)).toBe(2.0);
      expect(getLevelStarMultiplier(16)).toBe(2.5);
      expect(getLevelStarMultiplier(20)).toBe(2.5);
    });
  });

  describe('calculateStarReward', () => {
    it('should calculate correct rewards for easy games', () => {
      // Easy game, level 1-5: 1 base × 1.0 = 1 star
      expect(calculateStarReward('word_builder', 1, false)).toBe(1);
      expect(calculateStarReward('word_builder', 1, true)).toBe(2); // +1 perfect bonus

      // Easy game, level 6: 1 base × 1.5 = 1-2 stars (rounded)
      expect(calculateStarReward('word_builder', 6, false)).toBe(2);
      expect(calculateStarReward('word_builder', 6, true)).toBe(3);
    });

    it('should calculate correct rewards for medium games', () => {
      // Medium game, level 1: 2 base × 1.0 = 2 stars
      expect(calculateStarReward('memory_math', 1, false)).toBe(2);
      expect(calculateStarReward('memory_math', 1, true)).toBe(3);

      // Medium game, level 11: 2 base × 2.0 = 4 stars
      expect(calculateStarReward('memory_math', 11, false)).toBe(4);
      expect(calculateStarReward('memory_math', 11, true)).toBe(5);
    });

    it('should calculate correct rewards for hard games', () => {
      // Hard game, level 1: 3 base × 1.0 = 3 stars
      expect(calculateStarReward('balance_scale', 1, false)).toBe(3);
      expect(calculateStarReward('balance_scale', 1, true)).toBe(4);

      // Hard game, level 16: 3 base × 2.5 = 7-8 stars (rounded)
      expect(calculateStarReward('balance_scale', 16, false)).toBe(8);
      expect(calculateStarReward('balance_scale', 16, true)).toBe(9);
    });
  });
});
