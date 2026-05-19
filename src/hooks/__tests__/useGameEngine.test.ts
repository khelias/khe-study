import { beforeEach, describe, it, expect } from 'vitest';
import { useGameEngine } from '../useGameEngine';
import { renderHook } from '@testing-library/react';
import { SHAPE_SHIFT_PUZZLES_PACK } from '../../curriculum/packs/geometry/shapeShiftPuzzles';
import { MATH_GEOMETRY_SHAPES_PACK } from '../../curriculum/packs/math/geometry_shapes';
import { useGameStore } from '../../stores/gameStore';

// Import game registrations to ensure games are registered
import '../../games/registrations';

describe('useGameEngine - Problem UID Uniqueness', () => {
  beforeEach(() => {
    // @ts-expect-error -- Shape Shift keeps a session-level repeat buffer on globalThis
    delete globalThis._shapeShiftHistory;
  });

  it('generates unique problem UIDs on consecutive calls', () => {
    const { result } = renderHook(() => useGameEngine());

    const adaptiveDifficulty = {
      recentAccuracy: [],
      averageResponseTime: [],
      consecutiveCorrect: 0,
      consecutiveWrong: 0,
      difficultyMultiplier: 1,
      levelAdjustment: 0,
    };

    // Generate multiple problems for word_builder
    const problem1 = result.current.generateUniqueProblemForGame(
      'word_builder',
      1,
      adaptiveDifficulty,
    );
    const problem2 = result.current.generateUniqueProblemForGame(
      'word_builder',
      1,
      adaptiveDifficulty,
    );
    const problem3 = result.current.generateUniqueProblemForGame(
      'word_builder',
      1,
      adaptiveDifficulty,
    );

    // All problems should have unique UIDs
    expect(problem1?.uid).toBeDefined();
    expect(problem2?.uid).toBeDefined();
    expect(problem3?.uid).toBeDefined();

    if (problem1 && problem2 && problem3) {
      expect(problem1.uid).not.toBe(problem2.uid);
      expect(problem2.uid).not.toBe(problem3.uid);
      expect(problem1.uid).not.toBe(problem3.uid);
    }
  });

  it('generates unique UIDs for word_cascade problems', () => {
    const { result } = renderHook(() => useGameEngine());

    const adaptiveDifficulty = {
      recentAccuracy: [],
      averageResponseTime: [],
      consecutiveCorrect: 0,
      consecutiveWrong: 0,
      difficultyMultiplier: 1,
      levelAdjustment: 0,
    };

    // Generate multiple problems for word_cascade
    const problem1 = result.current.generateUniqueProblemForGame(
      'word_cascade',
      1,
      adaptiveDifficulty,
    );
    const problem2 = result.current.generateUniqueProblemForGame(
      'word_cascade',
      1,
      adaptiveDifficulty,
    );
    const problem3 = result.current.generateUniqueProblemForGame(
      'word_cascade',
      1,
      adaptiveDifficulty,
    );

    // All problems should have unique UIDs
    expect(problem1?.uid).toBeDefined();
    expect(problem2?.uid).toBeDefined();
    expect(problem3?.uid).toBeDefined();

    if (problem1 && problem2 && problem3) {
      expect(problem1.uid).not.toBe(problem2.uid);
      expect(problem2.uid).not.toBe(problem3.uid);
      expect(problem1.uid).not.toBe(problem3.uid);
    }
  });

  it('generates unique UIDs across rapid successive calls', () => {
    const { result } = renderHook(() => useGameEngine());

    const adaptiveDifficulty = {
      recentAccuracy: [],
      averageResponseTime: [],
      consecutiveCorrect: 0,
      consecutiveWrong: 0,
      difficultyMultiplier: 1,
      levelAdjustment: 0,
    };

    // Generate 10 problems rapidly
    const problems = [];
    for (let i = 0; i < 10; i++) {
      const problem = result.current.generateUniqueProblemForGame(
        'word_builder',
        1,
        adaptiveDifficulty,
      );
      if (problem) {
        problems.push(problem);
      }
    }

    // Extract all UIDs
    const uids = problems.map((p) => p.uid);

    // All UIDs should be unique (no duplicates)
    const uniqueUids = new Set(uids);
    expect(uniqueUids.size).toBe(uids.length);
  });

  it('avoids generating the same word consecutively for word games', () => {
    const { result } = renderHook(() => useGameEngine());

    const adaptiveDifficulty = {
      recentAccuracy: [],
      averageResponseTime: [],
      consecutiveCorrect: 0,
      consecutiveWrong: 0,
      difficultyMultiplier: 1,
      levelAdjustment: 0,
    };

    // Use level 3 for a larger word pool (level 1 pool is too small for guaranteed dedup)
    const problems = [];
    for (let i = 0; i < 4; i++) {
      const problem = result.current.generateUniqueProblemForGame(
        'word_builder',
        3,
        adaptiveDifficulty,
      );
      if (problem && problem.type === 'word_builder') {
        problems.push(problem);
      }
    }

    // Count consecutive duplicates — at most 1 allowed (small pool fallback)
    let consecutiveRepeats = 0;
    for (let i = 0; i < problems.length - 1; i++) {
      const current = problems[i];
      const next = problems[i + 1];
      if (current && next && current.target === next.target) {
        consecutiveRepeats++;
      }
    }
    expect(consecutiveRepeats).toBeLessThanOrEqual(1);
  });

  it('records generated Shape Shift puzzle ids in content-pack history', () => {
    useGameStore.setState({ playedContentByPack: {} });
    const { result } = renderHook(() => useGameEngine());
    const adaptiveDifficulty = {
      recentAccuracy: [],
      averageResponseTime: [],
      consecutiveCorrect: 0,
      consecutiveWrong: 0,
      difficultyMultiplier: 1,
      levelAdjustment: 0,
    };

    const problem = result.current.generateUniqueProblemForGame(
      'shape_shift',
      1,
      adaptiveDifficulty,
    );

    expect(problem?.type).toBe('shape_shift');
    if (problem?.type === 'shape_shift') {
      expect(useGameStore.getState().getPlayedContent(SHAPE_SHIFT_PUZZLES_PACK.id)).toContain(
        problem.puzzle.id,
      );
    }
  });

  it('records generated Shape Dash curriculum item ids in content-pack history', () => {
    useGameStore.setState({ playedContentByPack: {} });
    const { result } = renderHook(() => useGameEngine());
    const adaptiveDifficulty = {
      recentAccuracy: [],
      averageResponseTime: [],
      consecutiveCorrect: 0,
      consecutiveWrong: 0,
      difficultyMultiplier: 1,
      levelAdjustment: 0,
    };

    const problem = result.current.generateUniqueProblemForGame(
      'shape_dash',
      1,
      adaptiveDifficulty,
    );

    expect(problem?.type).toBe('shape_dash');
    if (problem?.type === 'shape_dash') {
      expect(problem.contentItemIds?.length).toBeGreaterThan(0);
      const playedIds = useGameStore.getState().getPlayedContent(MATH_GEOMETRY_SHAPES_PACK.id);
      for (const contentItemId of problem.contentItemIds ?? []) {
        expect(playedIds).toContain(contentItemId);
      }
    }
  });

  it('avoids persisted Shape Shift puzzle ids while the difficulty tier has fresh content', () => {
    const easyPuzzleIds = SHAPE_SHIFT_PUZZLES_PACK.items
      .filter((puzzle) => puzzle.difficulty === 'easy')
      .map((puzzle) => puzzle.id);
    const allowedPuzzleId = easyPuzzleIds[0]!;
    useGameStore.setState({
      playedContentByPack: {
        [SHAPE_SHIFT_PUZZLES_PACK.id]: easyPuzzleIds.filter((id) => id !== allowedPuzzleId),
      },
    });
    const { result } = renderHook(() => useGameEngine());
    const adaptiveDifficulty = {
      recentAccuracy: [],
      averageResponseTime: [],
      consecutiveCorrect: 0,
      consecutiveWrong: 0,
      difficultyMultiplier: 1,
      levelAdjustment: 0,
    };

    const problem = result.current.generateUniqueProblemForGame(
      'shape_shift',
      1,
      adaptiveDifficulty,
    );

    expect(problem?.type).toBe('shape_shift');
    if (problem?.type === 'shape_shift') {
      expect(problem.puzzle.id).toBe(allowedPuzzleId);
    }
  });
});
