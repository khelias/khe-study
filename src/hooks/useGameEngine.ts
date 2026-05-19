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

const makeKey = (prob: Problem | null): string => {
  if (!prob) return '';
  switch (prob.type) {
    case 'word_builder':
      return `word:${prob.target}`;
    case 'syllable_builder':
      return `syll:${prob.target}`;
    case 'letter_match':
      return `letter:${prob.word}`;
    case 'sentence_logic':
      return `sent:${prob.sentence}`;
    case 'balance_scale':
      return `bal:${prob.display.left.join(',')}|${prob.display.right.join(',')}`;
    case 'pattern':
      return `pat:${prob.sequence.join('')}:${prob.answer}`;
    case 'memory_math':
      return `mem:${prob.cards.map((c) => c.content).join('|')}`;
    case 'picture_pairs':
      return `pairs:${prob.cards.map((c) => c.content).join('|')}`;
    case 'robo_path':
      return `robo:${prob.grid.length}:${prob.goal[0]},${prob.goal[1]}:${prob.obstacles.map((o) => `${o[0]},${o[1]}`).join(';')}`;
    case 'math_snake': {
      const apple = prob.apple;
      const mathKey = prob.math ? prob.math.equation : 'none';
      return `snake:${prob.gridSize}:${apple?.kind ?? 'none'}:${apple ? apple.pos.join(',') : 'none'}:${mathKey}`;
    }
    case 'time_match':
      return `time:${prob.answer}`;
    case 'unit_conversion':
      return `unit:${prob.value}${prob.fromUnit}=${prob.answer}${prob.toUnit}`;
    case 'star_mapper':
      return `star:${prob.constellation.id}`;
    case 'shape_dash':
      return `shapedash:${prob.runLength}:${prob.obstacles.map((o) => `${o.x}-${o.type}`).join(';')}`;
    case 'shape_shift':
      return `shapeshift:${prob.puzzle.id}`;
    default: {
      // TypeScript narrowing - this should never happen but satisfies type checker
      return `${String((prob as Problem).type)}:${(prob as Problem).uid}`;
    }
  }
};

const getContentItemIds = (prob: Problem): string[] => {
  switch (prob.type) {
    case 'shape_shift':
      return [prob.puzzle.id];
    case 'star_mapper':
      return [prob.constellation.id];
    case 'shape_dash':
      return prob.contentItemIds ?? [];
    default:
      return [];
  }
};

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

      // Phase 5d: resolve per-learner mechanic variant + ageHint so the
      // generator can pick the right UX register (currently consumed only by
      // picture_pairs).
      const learner = useGameStore.getState().activeLearnerProfile;
      const mechanicId = getMechanicIdForGame(type);
      const variant = learner.mechanicPreference?.[mechanicId]?.variant;
      const ageHint = learner.ageHint;
      // Phase 5e: pull per-skill state so closed-set generators can use
      // spaced-repetition. Picks the binding's primary skill (the first
      // entry in LEGACY_GAME_SKILL_IDS); open-set generators ignore it.
      const skillId = LEGACY_GAME_SKILL_IDS[type]?.[0];
      const factsKnown = skillId ? learner.skillMastery[skillId]?.factsKnown : undefined;
      const skillChallenge = factsKnown ? { factsKnown } : undefined;

      // Try up to 50 times to generate a unique problem (increased from 30)
      do {
        prob = generator(level, rng, {
          avoidContentIds: playedContentIds,
          contentPackId,
          variant,
          ageHint,
          skillChallenge,
        });
        key = makeKey(prob);
        attempt++;

        // For word-based games, check both the word and the key
        const isWordGame =
          prob.type === 'word_builder' ||
          prob.type === 'word_cascade' ||
          prob.type === 'syllable_builder';
        if (isWordGame) {
          const word = 'target' in prob ? prob.target : '';
          // Compare words case-insensitively since applyLetterCase changes case by level
          const wordLower = word ? word.toLowerCase() : '';
          const isDuplicateWord = wordLower && wordBuffer.includes(wordLower);
          const isDuplicateKey = buffer.includes(key);

          if (isDuplicateWord || isDuplicateKey) {
            continue; // Try again with a different problem
          }
          // Found a unique word and unique problem - exit loop
          break;
        }

        // For non-word games, just check the key
        if (!buffer.includes(key)) {
          break;
        }
      } while (attempt < 50);

      if (attempt >= 50) {
        console.warn(
          `generateUniqueProblem: Hit max attempts (50) for type ${type}, level ${level}`,
        );
      }

      // Update shared buffers
      const nextBuffer = [key, ...buffer].slice(0, 50);
      sharedLastKeys[type] = nextBuffer;

      // For word-based games, track words case-insensitively
      const isWordGame =
        prob.type === 'word_builder' ||
        prob.type === 'word_cascade' ||
        prob.type === 'syllable_builder';
      if (isWordGame) {
        const word = 'target' in prob ? prob.target : '';
        if (word) {
          const wordLower = word.toLowerCase();
          const filtered = wordBuffer.filter((w) => w !== wordLower);
          const nextWordBuffer = [wordLower, ...filtered].slice(0, 25);
          sharedLastWords[type] = nextWordBuffer;
        }
      }

      const contentItemIds = getContentItemIds(prob);
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
