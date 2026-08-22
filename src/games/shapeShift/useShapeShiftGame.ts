import { useState, useRef, useEffect, useCallback } from 'react';
import { playSound } from '../../engine/audio';
import {
  boardPxToGridTopLeft,
  getPieceGridDimensions,
  snapGridTopLeftToTarget,
} from '../../engine/shapeShiftGrid';
import { validateShapeShift } from './validator';
import type { ShapeShiftProblem, PieceState } from '../../types/game';

// Constants for interaction
const TAP_THRESHOLD_PX = 10;

const getInitialPieces = (problem: ShapeShiftProblem): PieceState[] =>
  problem.pieces.map((p) => ({
    ...p,
    currentPosition: null,
    currentRotation: p.currentRotation ?? p.correctRotation,
  }));

export function useShapeShiftGame(
  problem: ShapeShiftProblem,
  onAnswer: (isCorrect: boolean) => void,
  soundEnabled: boolean,
  boardWidthPx: number,
) {
  const problemKey = `${problem.uid}:${problem.puzzle.id}`;
  const [pieces, setPieces] = useState<PieceState[]>(() => getInitialPieces(problem));
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [isDragging, setIsDragging] = useState(false);

  // Drag state refs to avoid re-renders during high-frequency moves
  const dragRef = useRef<{
    pieceId: string;
    startX: number;
    startY: number;
    pointerOffsetX: number;
    pointerOffsetY: number;
    hasMoved: boolean;
    dragScale: number; // Scale factor for ghost adjustments
  } | null>(null);

  const lastCheckedHash = useRef<string>('');

  // Reset state when problem changes. React allows this previous-prop pattern
  // during render, and it avoids showing stale pieces for a paint.
  const [prevProblemKey, setPrevProblemKey] = useState(problemKey);
  if (prevProblemKey !== problemKey) {
    setPrevProblemKey(problemKey);
    setPieces(getInitialPieces(problem));
    setStatus('idle');
    setIsDragging(false);
  }
  // Ref updates must happen outside render; reset the hash when uid changes.
  useEffect(() => {
    lastCheckedHash.current = '';
  }, [problemKey]);

  // Check for completion
  useEffect(() => {
    if (status !== 'idle') return;

    // Valid logic check
    const required = pieces.filter((p) => !p.isDecoy);
    const allPlaced = required.every((p) => p.currentPosition !== null);

    if (allPlaced) {
      // Create a simple hash of positions to prevent re-checking the same failed state endlessly
      // Only if ALL placements are "frozen" do we check.
      // If user moves something, this hash changes.
      const currentHash = pieces
        .filter((p) => !p.isDecoy)
        .map((p) => `${p.id}:${p.currentPosition?.x},${p.currentPosition?.y}:${p.currentRotation}`)
        .sort()
        .join('|');

      if (currentHash === lastCheckedHash.current) {
        // Already checked this config, don't spam flashing
        return;
      }

      // Quick validation (minimal delay)
      const checkTimeout = setTimeout(() => {
        lastCheckedHash.current = currentHash;
        const isCorrect = validateShapeShift(problem, pieces);

        if (isCorrect) {
          setStatus('correct');
          playSound('correct', soundEnabled);
          onAnswer(true); // Immediate, global feedback handles display
        } else {
          setStatus('wrong');
          playSound('wrong', soundEnabled);
          setTimeout(() => {
            setStatus('idle');
          }, 800);
        }
      }, 100);

      return () => clearTimeout(checkTimeout);
    }
    return undefined;
  }, [pieces, status, problem, onAnswer, soundEnabled]);

  const handleStartDrag = useCallback(
    (
      pieceId: string,
      clientX: number,
      clientY: number,
      offsetX: number,
      offsetY: number,
      dragScale: number = 1,
    ) => {
      if (status === 'correct') return; // Only block if correct, allow fixing mistakes

      setIsDragging(true);
      dragRef.current = {
        pieceId,
        startX: clientX,
        startY: clientY,
        pointerOffsetX: offsetX,
        pointerOffsetY: offsetY,
        hasMoved: false,
        dragScale,
      };
    },
    [status],
  );

  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    if (!dragRef.current) return;

    const dist = Math.hypot(clientX - dragRef.current.startX, clientY - dragRef.current.startY);
    if (dist > 5) {
      dragRef.current.hasMoved = true;
    }

    return {
      x: clientX - dragRef.current.pointerOffsetX * dragRef.current.dragScale,
      y: clientY - dragRef.current.pointerOffsetY * dragRef.current.dragScale,
    };
  }, []);

  const rotatePiece = useCallback(
    (pieceId: string) => {
      setPieces((prev) =>
        prev.map((p) => {
          if (p.id !== pieceId) return p;
          const nextRot = (p.currentRotation + 90) % 360;
          return { ...p, currentRotation: nextRot };
        }),
      );
      playSound('tap', soundEnabled);
    },
    [soundEnabled],
  );

  const updatePiecePosition = useCallback(
    (pieceId: string, pos: { x: number; y: number } | null) => {
      setPieces((prev) => prev.map((p) => (p.id === pieceId ? { ...p, currentPosition: pos } : p)));
    },
    [],
  );

  const handleDragEnd = useCallback(
    (clientX: number, clientY: number, boardRect: DOMRect | null, trayRect: DOMRect | null) => {
      if (!dragRef.current) return;

      const { pieceId, startX, startY, pointerOffsetX, pointerOffsetY, hasMoved, dragScale } =
        dragRef.current;
      setIsDragging(false);
      dragRef.current = null;

      const moveDist = Math.hypot(clientX - startX, clientY - startY);
      const piece = pieces.find((p) => p.id === pieceId);
      if (!piece) return;

      // Handle Tap to Rotate
      const isTap = !hasMoved || moveDist < TAP_THRESHOLD_PX;
      if (isTap) {
        rotatePiece(pieceId);
        return;
      }

      // Handle Drop
      const { width, height } = getPieceGridDimensions(piece);
      const cellSizePx = boardWidthPx / problem.puzzle.gridSize;
      const ghostWidthPx = cellSizePx * width;
      const ghostHeightPx = cellSizePx * height;
      const ghostTopLeftX = clientX - ghostWidthPx / 2 - pointerOffsetX * dragScale;
      const ghostTopLeftY = clientY - ghostHeightPx / 2 - pointerOffsetY * dragScale;

      const ghostCenterX = ghostTopLeftX + ghostWidthPx / 2;
      const ghostCenterY = ghostTopLeftY + ghostHeightPx / 2;

      // Check Board Drop
      if (boardRect) {
        // Leeway: accept drop if center is near or inside board (margin 70% of piece size)
        const margin = Math.max(ghostWidthPx, ghostHeightPx) * 0.7;
        const relX = ghostCenterX - boardRect.left;
        const relY = ghostCenterY - boardRect.top;

        // Check if center is within board (plus margin)
        if (
          relX > -margin &&
          relX < boardRect.width + margin &&
          relY > -margin &&
          relY < boardRect.height + margin
        ) {
          // Snap using Center coordinates
          const rawGridPos = boardPxToGridTopLeft(
            relX, // Pass center relative to board
            relY,
            boardRect.width,
            problem.puzzle.gridSize,
            width,
            height,
          );
          const gridPos = snapGridTopLeftToTarget(rawGridPos, piece, problem.puzzle.pieces);

          updatePiecePosition(pieceId, gridPos);
          playSound('tap', soundEnabled);
          return;
        }
      }

      // Check Tray Drop (or fallback if outside board)
      if (trayRect) {
        updatePiecePosition(pieceId, null); // return to tray
        playSound('tap', soundEnabled);
      } else {
        updatePiecePosition(pieceId, null);
      }
    },
    [
      pieces,
      problem.puzzle.gridSize,
      problem.puzzle.pieces,
      soundEnabled,
      boardWidthPx,
      rotatePiece,
      updatePiecePosition,
    ],
  );

  const placeHintPiece = useCallback(() => {
    const unplaced = pieces.filter((p) => !p.isDecoy && p.currentPosition === null);
    const target = unplaced[0];
    if (!target) return false;

    const template = problem.puzzle.pieces.find((p) => p.id === target.id);

    if (template) {
      setPieces((prev) =>
        prev.map((p) =>
          p.id === target.id
            ? {
                ...p,
                currentPosition: template.correctPosition,
                currentRotation: template.correctRotation,
              }
            : p,
        ),
      );
      return true;
    }
    return false;
  }, [pieces, problem.puzzle.pieces]);

  return {
    pieces,
    status,
    isDragging,
    handleStartDrag,
    handleDragMove,
    handleDragEnd,
    rotatePiece,
    placeHintPiece,
  };
}
