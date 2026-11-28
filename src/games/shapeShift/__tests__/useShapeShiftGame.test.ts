import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useShapeShiftGame } from '../useShapeShiftGame';
import { ShapeShiftProblem } from '../../../types/game';

// Mock dependencies
vi.mock('../../../engine/audio', () => ({
  playSound: vi.fn(),
  playMoment: vi.fn(),
}));

// Mock pure functions if needed, but they are logic so we might want to keep them real.
// However, boardPxToGridTopLeft is used inside handleDragEnd for board drops.

describe('useShapeShiftGame', () => {
  const mockProblem: ShapeShiftProblem = {
    type: 'shape_shift',
    uid: 'test-uid',
    mode: 'match',
    puzzle: {
      id: 'test-puzzle',
      nameEt: 'Test',
      nameEn: 'Test',
      category: 'shapes',
      difficulty: 'easy',
      gridSize: 10,
      pieces: [
        {
          id: 'p1',
          type: 'square',
          color: 'red',
          correctPosition: { x: 0, y: 0 },
          correctRotation: 0,
          size: 2,
        },
      ],
    },
    pieces: [
      {
        id: 'p1',
        type: 'square',
        color: 'red',
        correctPosition: { x: 0, y: 0 },
        correctRotation: 0,
        isDecoy: false,
        currentPosition: null,
        currentRotation: 0,
        size: 2,
      },
    ],
    showHints: true,
  };

  const mockOnAnswer = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with correct pieces state', () => {
    const { result } = renderHook(() => useShapeShiftGame(mockProblem, mockOnAnswer, true, 500));

    expect(result.current.pieces).toHaveLength(1);
    expect(result.current.pieces[0]!.currentPosition).toBeNull();
    expect(result.current.status).toBe('idle');
  });

  it('should handle start drag', () => {
    const { result } = renderHook(() => useShapeShiftGame(mockProblem, mockOnAnswer, true, 500));

    act(() => {
      result.current.handleStartDrag('p1', 100, 100, 0, 0);
    });

    expect(result.current.isDragging).toBe(true);
  });

  it('should rotate piece on tap (drag without move)', () => {
    const { result } = renderHook(() => useShapeShiftGame(mockProblem, mockOnAnswer, true, 500));

    act(() => {
      // Start drag
      result.current.handleStartDrag('p1', 100, 100, 0, 0);
    });

    act(() => {
      // End drag immediately (tap)
      result.current.handleDragEnd(100, 100, null, null);
    });

    expect(result.current.pieces[0]!.currentRotation).toBe(90); // 0 + 90
    expect(result.current.isDragging).toBe(false);
  });

  it('should drop the board-sized ghost centered under the pointer', () => {
    const { result } = renderHook(() => useShapeShiftGame(mockProblem, mockOnAnswer, true, 500));
    const boardRect = {
      left: 100,
      top: 100,
      width: 500,
      height: 500,
    } as DOMRect;

    act(() => {
      result.current.handleStartDrag('p1', 300, 300, 0, 0, 1);
      result.current.handleDragMove(350, 350);
      result.current.handleDragEnd(350, 350, boardRect, null);
    });

    expect(result.current.pieces[0]!.currentPosition).toEqual({ x: 4, y: 4 });
    expect(result.current.isDragging).toBe(false);
  });

  it('should snap a near-correct drop onto the target position', () => {
    const snapProblem: ShapeShiftProblem = {
      ...mockProblem,
      puzzle: {
        ...mockProblem.puzzle,
        gridSize: 100,
        pieces: [
          {
            id: 'p1',
            type: 'square',
            color: 'red',
            correctPosition: { x: 30, y: 30 },
            correctRotation: 0,
            size: 40,
          },
        ],
      },
      pieces: [
        {
          ...mockProblem.pieces[0]!,
          correctPosition: { x: 30, y: 30 },
          size: 40,
        },
      ],
    };
    const { result } = renderHook(() => useShapeShiftGame(snapProblem, mockOnAnswer, true, 500));
    const boardRect = {
      left: 100,
      top: 100,
      width: 500,
      height: 500,
    } as DOMRect;

    act(() => {
      result.current.handleStartDrag('p1', 300, 300, 0, 0, 1);
      result.current.handleDragMove(380, 380);
      result.current.handleDragEnd(380, 380, boardRect, null);
    });

    expect(result.current.pieces[0]!.currentPosition).toEqual({ x: 30, y: 30 });
  });

  it('should place hint piece correctly', () => {
    const { result } = renderHook(() => useShapeShiftGame(mockProblem, mockOnAnswer, true, 500));

    act(() => {
      const placed = result.current.placeHintPiece();
      expect(placed).toBe(true);
    });

    expect(result.current.pieces[0]!.currentPosition).toEqual({ x: 0, y: 0 });
    // Should trigger completion logic if it was the last piece, but that involves timeouts
  });

  it('should clear placed pieces when a new puzzle problem arrives', () => {
    const nextProblem: ShapeShiftProblem = {
      ...mockProblem,
      uid: mockProblem.uid,
      puzzle: {
        ...mockProblem.puzzle,
        id: 'next-puzzle',
        pieces: [
          {
            id: 'p2',
            type: 'triangle',
            color: 'blue',
            correctPosition: { x: 4, y: 4 },
            correctRotation: 0,
            size: 2,
          },
        ],
      },
      pieces: [
        {
          id: 'p2',
          type: 'triangle',
          color: 'blue',
          correctPosition: { x: 4, y: 4 },
          correctRotation: 0,
          isDecoy: false,
          currentPosition: null,
          currentRotation: 0,
          size: 2,
        },
      ],
    };
    const { result, rerender } = renderHook(
      ({ problem }) => useShapeShiftGame(problem, mockOnAnswer, true, 500),
      { initialProps: { problem: mockProblem } },
    );

    act(() => {
      expect(result.current.placeHintPiece()).toBe(true);
    });
    expect(result.current.pieces[0]!.currentPosition).toEqual({ x: 0, y: 0 });

    rerender({ problem: nextProblem });

    expect(result.current.status).toBe('idle');
    expect(result.current.pieces).toHaveLength(1);
    expect(result.current.pieces[0]!.id).toBe('p2');
    expect(result.current.pieces[0]!.currentPosition).toBeNull();
  });
});
