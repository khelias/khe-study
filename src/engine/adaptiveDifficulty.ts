import type { AdaptiveDifficulty } from '../types/achievement';

/**
 * Creates a new adaptive difficulty state
 * @returns Fresh adaptive difficulty object
 */
export const createAdaptiveDifficulty = (): AdaptiveDifficulty => ({
  // Player performance metrics
  recentAccuracy: [], // Last 10 answers (true/false)
  averageResponseTime: [], // Last 10 response times (ms)
  consecutiveCorrect: 0, // Consecutive correct answers
  consecutiveWrong: 0, // Consecutive wrong answers

  // Difficulty parameters
  difficultyMultiplier: 1.0, // 0.5 (easy) to 2.0 (hard)
  levelAdjustment: 0, // -2 to +2 level adjustment
});

/**
 * Updates adaptive difficulty based on a new answer
 * @param adaptive - Current adaptive difficulty state
 * @param isCorrect - Whether the answer was correct
 * @param responseTime - Time taken to answer in milliseconds (optional)
 * @returns Updated adaptive difficulty state
 */
export const updateAdaptiveDifficulty = (
  adaptive: AdaptiveDifficulty,
  isCorrect: boolean,
  responseTime: number | null = null,
): AdaptiveDifficulty => {
  const updated = { ...adaptive };

  // Update recent answers
  updated.recentAccuracy = [...updated.recentAccuracy, isCorrect].slice(-10);
  if (responseTime !== null) {
    updated.averageResponseTime = [...updated.averageResponseTime, responseTime].slice(-10);
  }

  // Update consecutive answer counters
  if (isCorrect) {
    updated.consecutiveCorrect += 1;
    updated.consecutiveWrong = 0;
  } else {
    updated.consecutiveWrong += 1;
    updated.consecutiveCorrect = 0;
  }

  // Calculate accuracy
  const accuracy =
    updated.recentAccuracy.length > 0
      ? updated.recentAccuracy.filter((a) => a).length / updated.recentAccuracy.length
      : 0.5;

  // Calculate average response time (if data available)
  const avgResponseTime =
    updated.averageResponseTime.length > 0
      ? updated.averageResponseTime.reduce((a, b) => a + b, 0) / updated.averageResponseTime.length
      : null;

  // Adaptive difficulty logic
  // If accuracy > 80% and 3+ consecutive correct answers -> increase difficulty
  if (accuracy > 0.8 && updated.consecutiveCorrect >= 3) {
    updated.difficultyMultiplier = Math.min(updated.difficultyMultiplier + 0.1, 2.0);
    updated.levelAdjustment = Math.min(updated.levelAdjustment + 0.5, 2);
  }
  // If accuracy < 50% or 3+ consecutive wrong answers -> decrease difficulty
  else if (accuracy < 0.5 || updated.consecutiveWrong >= 3) {
    updated.difficultyMultiplier = Math.max(updated.difficultyMultiplier - 0.1, 0.5);
    updated.levelAdjustment = Math.max(updated.levelAdjustment - 0.5, -2);
  }
  // If answering too quickly (possibly randomly) -> increase difficulty
  else if (avgResponseTime !== null && avgResponseTime < 1000 && accuracy > 0.7) {
    updated.difficultyMultiplier = Math.min(updated.difficultyMultiplier + 0.05, 2.0);
  }

  return updated;
};

/**
 * Calculates the effective level with adaptive difficulty
 * @param baseLevel - Base level
 * @param adaptive - Adaptive difficulty state
 * @returns Effective level after adjustment
 */
export const getEffectiveLevel = (baseLevel: number, adaptive: AdaptiveDifficulty): number => {
  const adjusted = Math.max(1, Math.round(baseLevel + adaptive.levelAdjustment));
  return adjusted;
};
