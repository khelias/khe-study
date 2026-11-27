import { describe, it, expect } from 'vitest';
import { validateShapeDash } from '../shapeDash/validator';
import { validateStarMapper } from '../starMapper/validator';
import { validateShapeShift } from '../shapeShift/validator';
import { validateBattleLearn } from '../battlelearn/validator';
import type {
  Constellation,
  StarMapperProblem,
  BattleLearnProblem,
  ShapeShiftProblem,
} from '../../types/game';

describe('validateStarMapper', () => {
  const test_constellation: Constellation = {
    id: 'test_constellation',
    iau: 'Tst',
    difficulty: 'easy',
    lines: [
      [1, 2],
      [2, 3],
    ],
    centre: { ra: 10, dec: 50 },
    bestEvening: { month: 1, hour: 21 },
    season: 'winter',
    circumpolar: false,
  };
  const problem = (mode: StarMapperProblem['mode']): StarMapperProblem => ({
    type: 'star_mapper',
    uid: 'test-1',
    mode,
    level: 1,
    constellation: test_constellation,
    stars: [],
    showGuide: mode === 'draw',
    correctAnswer: 'test_constellation',
    sceneUtc: 0,
    cameraStart: { yaw: 0, pitch: 30 },
    figureRadius: 5,
    tracedIds: [],
  });

  it('accepts the right name in the naming step', () => {
    expect(validateStarMapper(problem('draw_name'), 'test_constellation')).toBe(true);
    expect(validateStarMapper(problem('draw_name'), 'other')).toBe(false);
  });

  it('accepts every figure line, in either direction', () => {
    expect(
      validateStarMapper(problem('draw'), [
        [1, 2],
        [2, 3],
      ]),
    ).toBe(true);
    expect(
      validateStarMapper(problem('memory'), [
        [3, 2],
        [2, 1],
      ]),
    ).toBe(true);
  });

  it('accepts extra lines once every figure line is there', () => {
    expect(
      validateStarMapper(problem('find'), [
        [1, 2],
        [5, 6],
        [2, 3],
      ]),
    ).toBe(true);
  });

  it('rejects a missing line', () => {
    expect(validateStarMapper(problem('draw'), [[1, 2]])).toBe(false);
    expect(validateStarMapper(problem('draw'), [])).toBe(false);
  });

  it('rejects an answer that is neither a name nor lines', () => {
    expect(validateStarMapper(problem('draw'), 42)).toBe(false);
  });

  it('should return false for non-star_mapper problems', () => {
    const wrongProblem = { type: 'word_builder', uid: 'test-9' } as unknown as StarMapperProblem;
    expect(validateStarMapper(wrongProblem, [])).toBe(false);
  });
});

describe('validateBattleLearn', () => {
  it('should return true for correct answer index', () => {
    const problem: BattleLearnProblem = {
      type: 'battlelearn',
      uid: 'test-1',
      gridSize: 5,
      cellGrid: [],
      ships: [],
      revealed: [],
      hits: [],
      sunkShips: [],
      shotAvailable: false,
      question: {
        prompt: 'What is 2 + 3?',
        options: ['4', '5', '6', '7'],
        correctIndex: 1,
      },
      gameWon: false,
    };

    expect(validateBattleLearn(problem, 1)).toBe(true);
  });

  it('should return false for incorrect answer index', () => {
    const problem: BattleLearnProblem = {
      type: 'battlelearn',
      uid: 'test-2',
      gridSize: 5,
      cellGrid: [],
      ships: [],
      revealed: [],
      hits: [],
      sunkShips: [],
      shotAvailable: false,
      question: {
        prompt: 'What is 2 + 3?',
        options: ['4', '5', '6', '7'],
        correctIndex: 1,
      },
      gameWon: false,
    };

    expect(validateBattleLearn(problem, 0)).toBe(false);
    expect(validateBattleLearn(problem, 2)).toBe(false);
    expect(validateBattleLearn(problem, 3)).toBe(false);
  });

  it('should return false for non-number answer', () => {
    const problem: BattleLearnProblem = {
      type: 'battlelearn',
      uid: 'test-3',
      gridSize: 5,
      cellGrid: [],
      ships: [],
      revealed: [],
      hits: [],
      sunkShips: [],
      shotAvailable: false,
      question: {
        prompt: 'What is 2 + 3?',
        options: ['4', '5', '6', '7'],
        correctIndex: 1,
      },
      gameWon: false,
    };

    expect(validateBattleLearn(problem, '1')).toBe(false);
    expect(validateBattleLearn(problem, null)).toBe(false);
    expect(validateBattleLearn(problem, undefined)).toBe(false);
    expect(validateBattleLearn(problem, {})).toBe(false);
  });

  it('should return false for wrong problem type', () => {
    const problem = {
      type: 'word_builder' as const,
      uid: 'test-4',
      target: 'test',
      emoji: '🎯',
      shuffled: [],
    };

    expect(validateBattleLearn(problem, 1)).toBe(false);
  });
});

describe('validateShapeDash', () => {
  const shapeDashProblem = {
    type: 'shape_dash' as const,
    uid: 'test-1',
    obstacles: [{ id: 'o1', x: 100, type: 'spike' as const }],
    checkpoints: [
      {
        id: 'c1',
        x: 500,
        question: { prompt: '?', options: ['3', '4'], correctIndex: 0 },
      },
    ],
    scrollSpeed: 150,
    runLength: 3000,
  };

  it('should return true when userAnswer is true (run completed)', () => {
    expect(validateShapeDash(shapeDashProblem, true)).toBe(true);
  });

  it('should return false when userAnswer is false (crashed or wrong checkpoint)', () => {
    expect(validateShapeDash(shapeDashProblem, false)).toBe(false);
  });

  it('should return false for wrong problem type', () => {
    expect(
      validateShapeDash(
        { type: 'word_builder', uid: 'x', target: 'x', emoji: 'x', shuffled: [] },
        true,
      ),
    ).toBe(false);
  });
});

describe('validateShapeShift', () => {
  const sunRaysProblem: ShapeShiftProblem = {
    type: 'shape_shift',
    uid: 'sun-rays',
    mode: 'match',
    showHints: true,
    puzzle: {
      id: 'sun-test',
      nameEt: 'Päike',
      nameEn: 'Sun',
      category: 'objects',
      difficulty: 'easy',
      gridSize: 100,
      pieces: [
        {
          id: 'r_top',
          type: 'triangle',
          color: 'orange',
          correctPosition: { x: 40, y: 10 },
          correctRotation: 0,
          size: 20,
        },
        {
          id: 'r_bottom',
          type: 'triangle',
          color: 'orange',
          correctPosition: { x: 40, y: 70 },
          correctRotation: 180,
          size: 20,
        },
      ],
    },
    pieces: [],
  };

  it('accepts interchangeable same-shape pieces when they occupy matching targets', () => {
    const answer = [
      {
        ...sunRaysProblem.puzzle.pieces[0]!,
        currentPosition: { x: 40, y: 70 },
        currentRotation: 180,
      },
      {
        ...sunRaysProblem.puzzle.pieces[1]!,
        currentPosition: { x: 40, y: 10 },
        currentRotation: 0,
      },
    ];

    expect(validateShapeShift(sunRaysProblem, answer)).toBe(true);
  });

  it('rejects interchangeable pieces when the rotation does not match the target', () => {
    const answer = [
      {
        ...sunRaysProblem.puzzle.pieces[0]!,
        currentPosition: { x: 40, y: 70 },
        currentRotation: 0,
      },
      {
        ...sunRaysProblem.puzzle.pieces[1]!,
        currentPosition: { x: 40, y: 10 },
        currentRotation: 180,
      },
    ];

    expect(validateShapeShift(sunRaysProblem, answer)).toBe(false);
  });
});
