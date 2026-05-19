/**
 * Game Registry Tests
 *
 * Tests for the game registry system to ensure games are properly registered
 * and can be retrieved.
 */

import { describe, it, expect } from 'vitest';
import { gameRegistry } from '../registry';
import {
  MATH_GEOMETRY_SHAPES_SPATIAL_SKILL,
  MATH_GEOMETRY_SHAPES_VERBAL_SKILL,
  MATH_PATTERN_SEQUENCES_SKILL,
  MATH_UNIT_CONVERSIONS_SKILL,
  MATH_COMPARE_NUMBERS_SKILL,
  MATH_TIME_READING_SKILL,
  MATH_BALANCE_EQUATIONS_SKILL,
  MATH_ADDITION_MEMORY_SKILL,
  MATH_GRID_NAVIGATION_SKILL,
  MATH_MIXED_PROBLEM_SOLVING_SKILL,
  MATH_MULTIPLICATION_1_TO_5_SKILL,
  MATH_MULTIPLICATION_1_TO_10_SKILL,
} from '../../curriculum/skills/math';
import {
  LANGUAGE_LONG_VOCABULARY_SKILL,
  LANGUAGE_SPATIAL_SENTENCES_SKILL,
  LANGUAGE_VOCABULARY_SKILL,
} from '../../curriculum/skills/language';
import { LANGUAGE_SPATIAL_SENTENCES_PACK } from '../../curriculum/packs/language/spatialSentences';
import { MATH_GEOMETRY_SHAPES_PACK } from '../../curriculum/packs/math/geometry_shapes';
import { MATH_PATTERN_SEQUENCES_PACK } from '../../curriculum/packs/math/pattern_sequences';
import { MATH_UNIT_CONVERSIONS_PACK } from '../../curriculum/packs/math/unit_conversions';
import { MATH_COMPARE_NUMBERS_PACK } from '../../curriculum/packs/math/compare_numbers';
import { MATH_TIME_READING_PACK } from '../../curriculum/packs/math/time_reading';
import { MATH_BALANCE_EQUATIONS_PACK } from '../../curriculum/packs/math/balance_equations';
import { MATH_ADDITION_MEMORY_PACK } from '../../curriculum/packs/math/addition_memory';
import { MATH_GRID_NAVIGATION_PACK } from '../../curriculum/packs/math/grid_navigation';
import {
  MATH_BATTLELEARN_MULTIPLICATION_1_5_PACK,
  MATH_BATTLELEARN_MULTIPLICATION_PACK,
  MATH_BATTLELEARN_PACK,
} from '../../curriculum/packs/math/battlelearn';
import { SHAPE_SHIFT_PUZZLES_PACK } from '../../curriculum/packs/geometry/shapeShiftPuzzles';

// Import registrations to ensure games are registered
import '../registrations';

describe('GameRegistry', () => {
  it('should have registered games', () => {
    const count = gameRegistry.getCount();
    expect(count).toBeGreaterThan(0);
  });

  it('should retrieve word_builder game', () => {
    const game = gameRegistry.get('word_builder');
    expect(game).toBeDefined();
    expect(game?.id).toBe('word_builder');
    expect(game?.component).toBeDefined();
    expect(game?.generator).toBeDefined();
    expect(game?.validator).toBeDefined();
    expect(game?.config).toBeDefined();
  });

  it('should retrieve balance_scale game', () => {
    const game = gameRegistry.get('balance_scale');
    expect(game).toBeDefined();
    expect(game?.id).toBe('balance_scale');
  });

  it('should bind shape_dash to the verbal-geometry skill', () => {
    const game = gameRegistry.get('shape_dash');
    expect(game).toBeDefined();
    expect(game?.skillIds).toEqual([MATH_GEOMETRY_SHAPES_VERBAL_SKILL.id]);
    expect(game?.contentPackId).toBe(MATH_GEOMETRY_SHAPES_PACK.id);
  });

  it('should bind pattern to the pattern sequence curriculum pack', () => {
    const game = gameRegistry.get('pattern');
    expect(game).toBeDefined();
    expect(game?.skillIds).toEqual([MATH_PATTERN_SEQUENCES_SKILL.id]);
    expect(game?.contentPackId).toBe(MATH_PATTERN_SEQUENCES_PACK.id);
  });

  it('should bind unit_conversion to the unit conversion curriculum pack', () => {
    const game = gameRegistry.get('unit_conversion');
    expect(game).toBeDefined();
    expect(game?.skillIds).toEqual([MATH_UNIT_CONVERSIONS_SKILL.id]);
    expect(game?.contentPackId).toBe(MATH_UNIT_CONVERSIONS_PACK.id);
  });

  it('should bind compare_sizes to the number comparison curriculum pack', () => {
    const game = gameRegistry.get('compare_sizes');
    expect(game).toBeDefined();
    expect(game?.skillIds).toEqual([MATH_COMPARE_NUMBERS_SKILL.id]);
    expect(game?.contentPackId).toBe(MATH_COMPARE_NUMBERS_PACK.id);
  });

  it('should bind time_match to the time reading curriculum pack', () => {
    const game = gameRegistry.get('time_match');
    expect(game).toBeDefined();
    expect(game?.skillIds).toEqual([MATH_TIME_READING_SKILL.id]);
    expect(game?.contentPackId).toBe(MATH_TIME_READING_PACK.id);
  });

  it('should bind balance_scale to the balance equation curriculum pack', () => {
    const game = gameRegistry.get('balance_scale');
    expect(game).toBeDefined();
    expect(game?.skillIds).toEqual([MATH_BALANCE_EQUATIONS_SKILL.id]);
    expect(game?.contentPackId).toBe(MATH_BALANCE_EQUATIONS_PACK.id);
  });

  it('should bind memory_math to the addition memory curriculum pack', () => {
    const game = gameRegistry.get('memory_math');
    expect(game).toBeDefined();
    expect(game?.skillIds).toEqual([MATH_ADDITION_MEMORY_SKILL.id]);
    expect(game?.contentPackId).toBe(MATH_ADDITION_MEMORY_PACK.id);
  });

  it('should bind robo_path to the grid navigation curriculum pack', () => {
    const game = gameRegistry.get('robo_path');
    expect(game).toBeDefined();
    expect(game?.skillIds).toEqual([MATH_GRID_NAVIGATION_SKILL.id]);
    expect(game?.contentPackId).toBe(MATH_GRID_NAVIGATION_PACK.id);
  });

  it('should bind battlelearn to the mixed problem solving curriculum pack', () => {
    const game = gameRegistry.get('battlelearn');
    expect(game).toBeDefined();
    expect(game?.skillIds).toEqual([MATH_MIXED_PROBLEM_SOLVING_SKILL.id]);
    expect(game?.contentPackId).toBe(MATH_BATTLELEARN_PACK.id);
  });

  it('should bind battlelearn_multiplication to the multiplication curriculum pack', () => {
    const game = gameRegistry.get('battlelearn_multiplication');
    expect(game).toBeDefined();
    expect(game?.skillIds).toEqual([MATH_MULTIPLICATION_1_TO_10_SKILL.id]);
    expect(game?.contentPackId).toBe(MATH_BATTLELEARN_MULTIPLICATION_PACK.id);
  });

  it('should bind battlelearn_multiplication_1_5 to the 1-5 multiplication curriculum pack', () => {
    const game = gameRegistry.get('battlelearn_multiplication_1_5');
    expect(game).toBeDefined();
    expect(game?.skillIds).toEqual([MATH_MULTIPLICATION_1_TO_5_SKILL.id]);
    expect(game?.contentPackId).toBe(MATH_BATTLELEARN_MULTIPLICATION_1_5_PACK.id);
  });

  it('should bind shape_shift to the spatial-geometry skill', () => {
    const game = gameRegistry.get('shape_shift');
    expect(game).toBeDefined();
    expect(game?.skillIds).toEqual([MATH_GEOMETRY_SHAPES_SPATIAL_SKILL.id]);
    expect(game?.contentPackId).toBe(SHAPE_SHIFT_PUZZLES_PACK.id);
  });

  it('should bind sentence_logic to the spatial sentence curriculum pack', () => {
    const game = gameRegistry.get('sentence_logic');
    expect(game).toBeDefined();
    expect(game?.skillIds).toEqual([LANGUAGE_SPATIAL_SENTENCES_SKILL.id]);
    expect(game?.contentPackId).toBe(LANGUAGE_SPATIAL_SENTENCES_PACK.id);
  });

  it('should bind word vocabulary games to the vocabulary skill', () => {
    for (const id of ['word_builder', 'word_cascade', 'picture_pairs', 'letter_match']) {
      const game = gameRegistry.get(id);
      expect(game).toBeDefined();
      expect(game?.skillIds).toEqual([LANGUAGE_VOCABULARY_SKILL.id]);
    }
  });

  it('should bind the long word cascade pack to the long vocabulary skill', () => {
    const game = gameRegistry.get('word_cascade_long');
    expect(game).toBeDefined();
    expect(game?.skillIds).toEqual([LANGUAGE_LONG_VOCABULARY_SKILL.id]);
  });

  it('should return undefined for unknown game', () => {
    const game = gameRegistry.get('unknown_game');
    expect(game).toBeUndefined();
  });

  it('should get all games', () => {
    const allGames = gameRegistry.getAll();
    expect(allGames.length).toBeGreaterThan(0);
    expect(allGames.every((game) => game.id !== undefined)).toBe(true);
  });

  it('should have all required game properties', () => {
    const allGames = gameRegistry.getAll();

    allGames.forEach((game) => {
      expect(game.id).toBeDefined();
      expect(game.component).toBeDefined();
      expect(game.generator).toBeDefined();
      expect(game.config).toBeDefined();
      expect(game.validator).toBeDefined();
    });
  });

  it('should check if game exists', () => {
    expect(gameRegistry.has('word_builder')).toBe(true);
    expect(gameRegistry.has('balance_scale')).toBe(true);
    expect(gameRegistry.has('unknown_game')).toBe(false);
  });

  it('should get all game IDs', () => {
    const ids = gameRegistry.getIds();
    expect(ids.length).toBeGreaterThan(0);
    expect(ids).toContain('word_builder');
    expect(ids).toContain('balance_scale');
  });
});
