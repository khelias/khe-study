import { useState, useCallback } from 'react';
import { gameRegistry } from '../games/registry';
import { getEffectiveLevel } from '../engine/adaptiveDifficulty';
import { createRng } from '../engine/rng';
import { getMechanicIdForGame } from '../games/data';
import { LEGACY_GAME_SKILL_IDS } from '../learner';
import { useGameStore } from '../stores/gameStore';
import type { Problem } from '../types/game';

// Import registrations to ensure games are registered
import '../games/registrations';

interface AdaptiveDifficulty {
  recentAccuracy: boolean[];
  averageResponseTime: number[];
  consecutiveCorrect: number;
  consecutiveWrong: number;
  difficultyMultiplier: number;
  levelAdjustment: number;
}

// Shared buffers across all hook instances to prevent duplicate problems
// Module-level to ensure useAnswerHandler and GameScreen share the same state
const sharedLastKeys: Record<string, string[]> = {};
const sharedLastWords: Record<string, string[]> = {};

export function useGameEngine() {
  const [rng] = useState(() => {
    if (typeof window === 'undefined') {
      return createRng(Date.now());
    }
    const params = new URLSearchParams(window.location.search);
    const seedParam = params.get('seed');
    const parsed = seedParam ? parseInt(seedParam, 10) : null;
    return createRng(Number.isFinite(parsed) && parsed !== null ? parsed : Date.now());
  });

  const getRng = useCallback(() => rng, [rng]);

  const generateUniqueProblem = useCallback(
    (type: string, level: number): Problem | null => {
      const buffer = sharedLastKeys[type] || [];
      // Normalize wordBuffer to lowercase for case-insensitive comparison
      const wordBuffer = (sharedLastWords[type] || []).map((w) => w.toLowerCase());
      let attempt = 0;
      let prob: Problem;
      let key: string;

      // Get generator from registry
      const gameEntry = gameRegistry.get(type);
      if (!gameEntry) {
        console.error(`Game not found in registry: ${type}`);
        return null;
      }

      const generator = gameEntry.generator;
      const contentPackId = gameEntry.contentPackId;
      const playedContentIds = contentPackId
        ? useGameStore.getState().getPlayedContent(contentPackId)
        : [];

      // Per-learner mechanic variant and ageHint let the generator pick its UX
      // register (only picture_pairs reads them).
      const learner = useGameStore.getState().activeLearnerProfile;
      const mechanicId = getMechanicIdForGame(type);
      const variant = learner.mechanicPreference?.[mechanicId]?.variant;
      const ageHint = learner.ageHint;
      // Per-skill state lets closed-set generators use spaced repetition. The
      // binding's primary skill is the first entry in LEGACY_GAME_SKILL_IDS;
      // open-set generators ignore it.
      const skillId = LEGACY_GAME_SKILL_IDS[type]?.[0];
      const factsKnown = skillId ? learner.skillMastery[skillId]?.factsKnown : undefined;
      const skillChallenge = factsKnown ? { factsKnown } : undefined;

      const keyOf = (problem: Problem): string =>
        gameEntry.problemKey?.(problem) ?? `${problem.type}:${problem.uid}`;
      // Words compare case-insensitively since applyLetterCase changes case by level.
      const wordOf = (problem: Problem): string =>
        gameEntry.dedupeWord?.(problem).toLowerCase() ?? '';

      do {
        prob = generator(level, rng, {
          avoidContentIds: playedContentIds,
          contentPackId,
          variant,
          ageHint,
          skillChallenge,
        });
        key = keyOf(prob);
        attempt++;
        const word = wordOf(prob);
        const isDuplicateWord = word !== '' && wordBuffer.includes(word);
        if (!isDuplicateWord && !buffer.includes(key)) break;
      } while (attempt < 50);

      if (attempt >= 50) {
        console.warn(
          `generateUniqueProblem: Hit max attempts (50) for type ${type}, level ${level}`,
        );
      }

      sharedLastKeys[type] = [key, ...buffer].slice(0, 50);

      const word = wordOf(prob);
      if (word) {
        const filtered = wordBuffer.filter((w) => w !== word);
        sharedLastWords[type] = [word, ...filtered].slice(0, 25);
      }

      const contentItemIds = gameEntry.contentItemIds?.(prob) ?? [];
      if (contentPackId && contentItemIds.length > 0) {
        for (const contentItemId of contentItemIds) {
          useGameStore.getState().recordPlayedContent(contentPackId, contentItemId);
        }
      }

      return prob;
    },
    [rng],
  );

  const generateUniqueProblemForGame = useCallback(
    (gameType: string, level: number, adaptiveDifficulty: AdaptiveDifficulty): Problem | null => {
      try {
        const effectiveLevel = getEffectiveLevel(level, adaptiveDifficulty);
        return generateUniqueProblem(gameType, effectiveLevel);
      } catch (error) {
        console.error('Error generating problem:', error);
        return null;
      }
    },
    [generateUniqueProblem],
  );

  const validateAnswer = useCallback((problem: Problem, userAnswer: unknown): boolean => {
    if (!problem) return false;

    // Get validator from registry
    const gameEntry = gameRegistry.get(problem.type);
    if (!gameEntry) {
      console.warn(`Game not found in registry for validation: ${problem.type}`);
      return false;
    }

    // Use the registered validator
    return gameEntry.validator(problem, userAnswer);
  }, []);

  return {
    generateUniqueProblemForGame,
    validateAnswer,
    getRng,
  };
}
