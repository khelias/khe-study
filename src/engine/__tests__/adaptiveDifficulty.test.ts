import { describe, it, expect } from 'vitest';
import {
  createAdaptiveDifficulty,
  updateAdaptiveDifficulty,
  getEffectiveLevel,
} from '../adaptiveDifficulty';
import { createTestAdaptiveDifficulty } from '../../test/utils';

describe('createAdaptiveDifficulty', () => {
  it('should create initial adaptive difficulty object', () => {
    const adaptive = createAdaptiveDifficulty();

    expect(adaptive).toEqual({
      recentAccuracy: [],
      averageResponseTime: [],
      consecutiveCorrect: 0,
      consecutiveWrong: 0,
      difficultyMultiplier: 1.0,
      levelAdjustment: 0,
    });
  });
});

describe('updateAdaptiveDifficulty', () => {
  it('should increment consecutive correct on correct answer', () => {
    const adaptive = createAdaptiveDifficulty();
    const updated = updateAdaptiveDifficulty(adaptive, true);

    expect(updated.consecutiveCorrect).toBe(1);
    expect(updated.consecutiveWrong).toBe(0);
  });

  it('should increment consecutive wrong on incorrect answer', () => {
    const adaptive = createAdaptiveDifficulty();
    const updated = updateAdaptiveDifficulty(adaptive, false);

    expect(updated.consecutiveCorrect).toBe(0);
    expect(updated.consecutiveWrong).toBe(1);
  });

  it('should reset consecutive wrong on correct answer', () => {
    const adaptive = createTestAdaptiveDifficulty({ consecutiveWrong: 3 });
    const updated = updateAdaptiveDifficulty(adaptive, true);

    expect(updated.consecutiveCorrect).toBe(1);
    expect(updated.consecutiveWrong).toBe(0);
  });

  it('should reset consecutive correct on wrong answer', () => {
    const adaptive = createTestAdaptiveDifficulty({ consecutiveCorrect: 5 });
    const updated = updateAdaptiveDifficulty(adaptive, false);

    expect(updated.consecutiveCorrect).toBe(0);
    expect(updated.consecutiveWrong).toBe(1);
  });

  it('should track recent accuracy', () => {
    const adaptive = createAdaptiveDifficulty();
    let updated = updateAdaptiveDifficulty(adaptive, true);
    updated = updateAdaptiveDifficulty(updated, true);
    updated = updateAdaptiveDifficulty(updated, false);

    expect(updated.recentAccuracy).toEqual([true, true, false]);
  });

  it('should limit recent accuracy to 10 items', () => {
    let adaptive = createAdaptiveDifficulty();

    // Add 15 answers
    for (let i = 0; i < 15; i++) {
      adaptive = updateAdaptiveDifficulty(adaptive, true);
    }

    expect(adaptive.recentAccuracy).toHaveLength(10);
  });

  it('should track response times when provided', () => {
    const adaptive = createAdaptiveDifficulty();
    let updated = updateAdaptiveDifficulty(adaptive, true, 1000);
    updated = updateAdaptiveDifficulty(updated, true, 2000);

    expect(updated.averageResponseTime).toEqual([1000, 2000]);
  });

  it('should limit response times to 10 items', () => {
    let adaptive = createAdaptiveDifficulty();

    for (let i = 0; i < 15; i++) {
      adaptive = updateAdaptiveDifficulty(adaptive, true, 1000 * i);
    }

    expect(adaptive.averageResponseTime).toHaveLength(10);
  });

  it('should increase difficulty on high accuracy and consecutive correct', () => {
    let adaptive = createAdaptiveDifficulty();

    // 10 correct answers for >80% accuracy and 3+ consecutive
    for (let i = 0; i < 10; i++) {
      adaptive = updateAdaptiveDifficulty(adaptive, true);
    }

    expect(adaptive.difficultyMultiplier).toBeGreaterThan(1.0);
    expect(adaptive.levelAdjustment).toBeGreaterThan(0);
  });

  it('should decrease difficulty on low accuracy', () => {
    let adaptive = createAdaptiveDifficulty();

    // Create low accuracy scenario: 7 wrong, 3 correct = 30% accuracy
    adaptive = updateAdaptiveDifficulty(adaptive, false);
    adaptive = updateAdaptiveDifficulty(adaptive, false);
    adaptive = updateAdaptiveDifficulty(adaptive, false);
    adaptive = updateAdaptiveDifficulty(adaptive, true);
    adaptive = updateAdaptiveDifficulty(adaptive, false);
    adaptive = updateAdaptiveDifficulty(adaptive, false);
    adaptive = updateAdaptiveDifficulty(adaptive, false);
    adaptive = updateAdaptiveDifficulty(adaptive, true);
    adaptive = updateAdaptiveDifficulty(adaptive, false);
    adaptive = updateAdaptiveDifficulty(adaptive, true);

    expect(adaptive.difficultyMultiplier).toBeLessThan(1.0);
    expect(adaptive.levelAdjustment).toBeLessThan(0);
  });

  it('should decrease difficulty on 3+ consecutive wrong', () => {
    let adaptive = createAdaptiveDifficulty();

    adaptive = updateAdaptiveDifficulty(adaptive, false);
    adaptive = updateAdaptiveDifficulty(adaptive, false);
    adaptive = updateAdaptiveDifficulty(adaptive, false);

    expect(adaptive.difficultyMultiplier).toBeLessThan(1.0);
    expect(adaptive.levelAdjustment).toBeLessThan(0);
  });

  it('should cap difficulty multiplier at 2.0', () => {
    let adaptive = createAdaptiveDifficulty();

    // Many correct answers to max out difficulty
    for (let i = 0; i < 50; i++) {
      adaptive = updateAdaptiveDifficulty(adaptive, true);
    }

    expect(adaptive.difficultyMultiplier).toBeLessThanOrEqual(2.0);
  });

  it('should cap difficulty multiplier at 0.5', () => {
    let adaptive = createAdaptiveDifficulty();

    // Many wrong answers to minimize difficulty
    for (let i = 0; i < 50; i++) {
      adaptive = updateAdaptiveDifficulty(adaptive, false);
    }

    expect(adaptive.difficultyMultiplier).toBeGreaterThanOrEqual(0.5);
  });

  it('should cap level adjustment at 2', () => {
    let adaptive = createAdaptiveDifficulty();

    for (let i = 0; i < 50; i++) {
      adaptive = updateAdaptiveDifficulty(adaptive, true);
    }

    expect(adaptive.levelAdjustment).toBeLessThanOrEqual(2);
  });

  it('should cap level adjustment at -2', () => {
    let adaptive = createAdaptiveDifficulty();

    for (let i = 0; i < 50; i++) {
      adaptive = updateAdaptiveDifficulty(adaptive, false);
    }

    expect(adaptive.levelAdjustment).toBeGreaterThanOrEqual(-2);
  });

  it('should increase difficulty on fast responses with high accuracy', () => {
    let adaptive = createAdaptiveDifficulty();

    // Fast responses (< 1000ms) with good accuracy
    for (let i = 0; i < 10; i++) {
      adaptive = updateAdaptiveDifficulty(adaptive, true, 500);
    }

    expect(adaptive.difficultyMultiplier).toBeGreaterThan(1.0);
  });

  it('should not increase difficulty on fast responses with low accuracy', () => {
    let adaptive = createAdaptiveDifficulty();

    // Fast responses but low accuracy (50%)
    for (let i = 0; i < 10; i++) {
      adaptive = updateAdaptiveDifficulty(adaptive, i % 2 === 0, 500);
    }

    // Should not increase much or at all
    expect(adaptive.difficultyMultiplier).toBeLessThanOrEqual(1.1);
  });
});

describe('getEffectiveLevel', () => {
  it('should return base level when no adjustment', () => {
    const adaptive = createAdaptiveDifficulty();
    const effective = getEffectiveLevel(5, adaptive);

    expect(effective).toBe(5);
  });

  it('should add positive level adjustment', () => {
    const adaptive = createTestAdaptiveDifficulty({ levelAdjustment: 2 });
    const effective = getEffectiveLevel(5, adaptive);

    expect(effective).toBe(7);
  });

  it('should subtract negative level adjustment', () => {
    const adaptive = createTestAdaptiveDifficulty({ levelAdjustment: -2 });
    const effective = getEffectiveLevel(5, adaptive);

    expect(effective).toBe(3);
  });

  it('should not go below level 1', () => {
    const adaptive = createTestAdaptiveDifficulty({ levelAdjustment: -10 });
    const effective = getEffectiveLevel(2, adaptive);

    expect(effective).toBe(1);
  });

  it('should round to nearest integer', () => {
    const adaptive = createTestAdaptiveDifficulty({ levelAdjustment: 0.7 });
    const effective = getEffectiveLevel(5, adaptive);

    expect(effective).toBe(6);
  });
});
