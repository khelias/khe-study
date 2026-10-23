import { describe, it, expect } from 'vitest';
import {
  calculateLevelUpRequirement,
  checkLevelUp,
  isLevelHeldByAccuracy,
  getGameBaseStarReward,
  getLevelStarMultiplier,
  calculateStarReward,
} from '../progression';

describe('Progression Engine (Phase 3)', () => {
  describe('calculateLevelUpRequirement', () => {
    it('should return correct requirements for each level', () => {
      expect(calculateLevelUpRequirement(1)).toBe(5);
      expect(calculateLevelUpRequirement(2)).toBe(7);
      expect(calculateLevelUpRequirement(3)).toBe(10);
      expect(calculateLevelUpRequirement(4)).toBe(12);
      expect(calculateLevelUpRequirement(5)).toBe(15);
      expect(calculateLevelUpRequirement(10)).toBe(18);
      expect(calculateLevelUpRequirement(15)).toBe(20);
      expect(calculateLevelUpRequirement(20)).toBe(25);
    });
  });

  describe('checkLevelUp', () => {
    it('should return true when requirements met with good accuracy', () => {
      // Level 1: 5 correct, 80%+ accuracy
      expect(checkLevelUp(1, 5, 5)).toBe(true); // 100% accuracy
      expect(checkLevelUp(1, 5, 6)).toBe(true); // 83% accuracy
      expect(checkLevelUp(1, 5, 7)).toBe(false); // 71% accuracy (below 80%)
    });

    it('should return false when not enough correct answers', () => {
      expect(checkLevelUp(1, 4, 4)).toBe(false); // Only 4 correct, need 5
      expect(checkLevelUp(2, 6, 6)).toBe(false); // Only 6 correct, need 7
    });

    it('should return false when accuracy too low', () => {
      // 5 correct but 10 total = 50% accuracy
      expect(checkLevelUp(1, 5, 10)).toBe(false);
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

  describe('isLevelHeldByAccuracy', () => {
    it('is false at 0 progress and below the target', () => {
      expect(isLevelHeldByAccuracy(1, 0, 0)).toBe(false);
      expect(isLevelHeldByAccuracy(1, 3, 10)).toBe(false);
    });

    it('is true at the target below 80% accuracy', () => {
      expect(isLevelHeldByAccuracy(1, 5, 7)).toBe(true);
      expect(isLevelHeldByAccuracy(1, 7, 10)).toBe(true);
    });

    it('is false once accuracy reaches 80%', () => {
      expect(isLevelHeldByAccuracy(1, 5, 6)).toBe(false);
    });
  });
});
