/**
 * ShapeShiftView – Geometric puzzle: drag shapes onto the board to match the target.
 *
 * Refactored to use useShapeShiftGame hook and standarized ShapeDefinitions.
 * Uses a clean "snap points" grid instead of dense mesh.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  getPieceGridDimensions,
  gridPieceToPercent,
  sortByDistanceFromCenter,
} from '../../engine/shapeShiftGrid';
import { useTranslation } from '../../i18n/useTranslation';
import { getLocale } from '../../i18n';
import { usePlaySessionStore } from '../../stores/playSessionStore';
import { GAME_CONFIG } from '../data';
import type { ShapePiece, ShapeShiftProblem } from '../../types/game';
import { useShapeShiftGame } from './useShapeShiftGame';
import { PieceSvg } from './ShapeDefinitions';
import { PaidHintButtons } from '../../components/shared';

// ─── Constants ─────────────────────────────────────────────────────────────

const OUTLINE_BASE_COST = 1;
const PLACE_PIECE_BASE_COST = 2;
const OUTLINE_DURATION_MS = 3000;
const TARGET_SLOT_OPACITY = 0.18;
const TARGET_SLOT_ACTIVE_OPACITY = 0.26;
const TARGET_SLOT_PLACED_OPACITY = 0.08;
const TRAY_PIECE_MAX_PX = 80;

// ─── Types ──────────────────────────────────────────────────────────────────

interface ShapeShiftViewProps {
  problem: ShapeShiftProblem;
  onAnswer: (isCorrect: boolean) => void;
  soundEnabled: boolean;
  level?: number;
  stars?: number;
  spendStars?: (count: number) => boolean;
}

const getBoardPieceStyle = (
  piece: Pick<ShapePiece, 'size' | 'width' | 'height'>,
  position: { x: number; y: number },
  gridSize: number,
): React.CSSProperties => {
  const { width, height } = getPieceGridDimensions(piece);
  const pct = gridPieceToPercent(position.x, position.y, width, gridSize, height);

  return {
    left: `${pct.left}%`,
    top: `${pct.top}%`,
    width: `${pct.width}%`,
    height: `${pct.height}%`,
  };
};

// ─── Component ──────────────────────────────────────────────────────────────

export const ShapeShiftView: React.FC<ShapeShiftViewProps> = ({
  problem,
  onAnswer,
  soundEnabled,
  stars = 0,
  spendStars,
}) => {
  const t = useTranslation();
  const puzzleName = getLocale() === 'en' ? problem.puzzle.nameEn : problem.puzzle.nameEt;
  const problemKey = `${problem.uid}:${problem.puzzle.id}`;
  const addNotification = usePlaySessionStore((state) => state.addNotification);

  const boardRef = useRef<HTMLDivElement>(null);
  const trayRef = useRef<HTMLDivElement>(null);
  const [boardWidthPx, setBoardWidthPx] = useState(0);

  // Visual state
  const [showOutlineOverlay, setShowOutlineOverlay] = useState(false);
  const [dragState, setDragState] = useState<{
    x: number;
    y: number;
    isoX: number; // Offset from piece center
    isoY: number;
    pieceId: string;
    dragScale: number; // Scale factor for ghost
  } | null>(null);

  // Hook for game logic
  const { pieces, status, placeHintPiece, handleStartDrag, handleDragMove, handleDragEnd } =
    useShapeShiftGame(problem, onAnswer, soundEnabled, boardWidthPx);

  // Measure board
  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;
    const update = () => setBoardWidthPx(el.getBoundingClientRect().width);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Auto-hide outline
  useEffect(() => {
    if (!showOutlineOverlay) return;
    const id = setTimeout(() => setShowOutlineOverlay(false), OUTLINE_DURATION_MS);
    return () => clearTimeout(id);
  }, [showOutlineOverlay]);

  // Use refs for drag handlers to access latest state without re-binding
  const boardRefValues = useRef<{ board: HTMLDivElement | null; tray: HTMLDivElement | null }>({
    board: null,
    tray: null,
  });
  useEffect(() => {
    boardRefValues.current = { board: boardRef.current, tray: trayRef.current };
  });

  // ─── Input Handlers ──────────────────────────────────────────────────────

  const onPointerDown = useCallback(
    (e: React.PointerEvent, pieceId: string) => {
      e.preventDefault();
      e.stopPropagation();

      // Only left click or touch
      if (e.button !== 0) return;

      const target = e.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Offset from center of the piece (unscaled initially)
      const offsetX = e.clientX - centerX;
      const offsetY = e.clientY - centerY;

      // Calculate dragScale
      const piece = pieces.find((p) => p.id === pieceId);
      let scale = 1;

      // Helper to calculate tray size logic locally if needed, or re-use function
      // We need to re-calc boardSize and traySize here to determine ratio
      if (piece && piece.currentPosition === null && boardWidthPx > 0) {
        // Re-calculate tray size for this piece
        // (Logic duplicated from below, or we could hoist getTrayPieceSize)
        const gs = problem.puzzle.gridSize;
        const { width, height } = getPieceGridDimensions(piece);
        const rawWidthPx = (boardWidthPx / gs) * width;
        const rawHeightPx = (boardWidthPx / gs) * height;
        const maxBoardSizePx = Math.max(rawWidthPx, rawHeightPx);
        const trayScale = Math.min(1, TRAY_PIECE_MAX_PX / maxBoardSizePx);

        if (trayScale > 0) {
          scale = 1 / trayScale;
        }
      }

      setDragState({
        x: e.clientX,
        y: e.clientY,
        isoX: offsetX,
        isoY: offsetY,
        pieceId,
        dragScale: scale,
      });

      handleStartDrag(pieceId, e.clientX, e.clientY, offsetX, offsetY, scale);

      // Capture pointer
      target.setPointerCapture(e.pointerId);
    },
    [handleStartDrag, pieces, boardWidthPx, problem.puzzle.gridSize],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragState) return;
      e.preventDefault();

      setDragState((prev) => (prev ? { ...prev, x: e.clientX, y: e.clientY } : null));
      handleDragMove(e.clientX, e.clientY);
    },
    [dragState, handleDragMove],
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!dragState) return;
      e.preventDefault();

      const { board, tray } = boardRefValues.current;

      const boardRect = board?.getBoundingClientRect() ?? null;
      const trayRect = tray?.getBoundingClientRect() ?? null;

      // Release capture first
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        try {
          e.currentTarget.releasePointerCapture(e.pointerId);
        } catch {
          // Ignore if already released
        }
      }

      handleDragEnd(e.clientX, e.clientY, boardRect, trayRect);
      setDragState(null);
    },
    [dragState, handleDragEnd],
  );

  useEffect(() => {
    if (!dragState) return;

    const handleWindowPointerMove = (e: PointerEvent) => {
      e.preventDefault();
      setDragState((prev) => (prev ? { ...prev, x: e.clientX, y: e.clientY } : null));
      handleDragMove(e.clientX, e.clientY);
    };

    const handleWindowPointerEnd = (e: PointerEvent) => {
      e.preventDefault();
      const { board, tray } = boardRefValues.current;
      const boardRect = board?.getBoundingClientRect() ?? null;
      const trayRect = tray?.getBoundingClientRect() ?? null;
      handleDragEnd(e.clientX, e.clientY, boardRect, trayRect);
      setDragState(null);
    };

    window.addEventListener('pointermove', handleWindowPointerMove);
    window.addEventListener('pointerup', handleWindowPointerEnd);
    window.addEventListener('pointercancel', handleWindowPointerEnd);

    return () => {
      window.removeEventListener('pointermove', handleWindowPointerMove);
      window.removeEventListener('pointerup', handleWindowPointerEnd);
      window.removeEventListener('pointercancel', handleWindowPointerEnd);
    };
  }, [dragState, handleDragMove, handleDragEnd]);

  // ─── Hints ──────────────────────────────────────────────────────────────

  const handleHintClick = (hintId: string) => {
    if (!spendStars) return;

    if (hintId === 'outline') {
      if (stars < OUTLINE_BASE_COST) {
        addNotification({ type: 'hint', message: t.shop.notEnoughStars });
        return;
      }
      if (spendStars(OUTLINE_BASE_COST)) {
        setShowOutlineOverlay(true);
      }
    } else if (hintId === 'place') {
      if (stars < PLACE_PIECE_BASE_COST) {
        addNotification({ type: 'hint', message: t.shop.notEnoughStars });
        return;
      }
      if (placeHintPiece()) {
        spendStars(PLACE_PIECE_BASE_COST);
      }
    }
  };

  // Get game config for hints
  const gameConfig = GAME_CONFIG.shape_shift;

  // ─── Rendering Helpers ──────────────────────────────────────────────────

  const gs = problem.puzzle.gridSize;

  // Sort pieces for z-index (center pieces on top)
  const placedPieces = pieces.filter((p) => p.currentPosition !== null);
  const trayPieces = pieces.filter((p) => p.currentPosition === null);
  const requiredTargets = problem.puzzle.pieces.filter((p) => !p.isDecoy);
  const placedRequiredIds = new Set(
    pieces.filter((p) => !p.isDecoy && p.currentPosition !== null).map((p) => p.id),
  );
  const placedRequiredCount = placedRequiredIds.size;
  const remainingRequiredCount = Math.max(0, requiredTargets.length - placedRequiredCount);
  const hasPlacedAnyRequired = placedRequiredCount > 0;
  const promptText =
    remainingRequiredCount === 0
      ? t.games.shape_shift.adjustPlacedPieces
      : hasPlacedAnyRequired
        ? t.games.shape_shift.remainingCount.replace('{count}', String(remainingRequiredCount))
        : t.games.shape_shift.firstMovePrompt;
  const boardShellClass = [
    'relative mb-5 rounded-2xl shadow-xl overflow-hidden border-4 transition-all duration-200',
    status === 'wrong'
      ? 'border-rose-300 bg-rose-50/40 ring-4 ring-rose-100'
      : dragState
        ? 'border-teal-300 bg-teal-50/60 ring-4 ring-teal-100'
        : 'border-slate-200 bg-slate-50',
  ].join(' ');
  const trayClass = [
    'w-full max-w-2xl rounded-xl border-2 border-dashed p-4 min-h-[100px] flex items-center justify-center flex-wrap gap-4 transition-colors duration-200',
    dragState ? 'border-teal-300 bg-teal-50/80' : 'border-slate-300 bg-slate-100/80',
  ].join(' ');

  const placedSorted = sortByDistanceFromCenter(
    placedPieces,
    gs,
    (p) => p.currentPosition!,
    (p) => getPieceGridDimensions(p).width,
    (p) => getPieceGridDimensions(p).height,
  );

  // Calculate size for tray items (limited max size)
  const getTrayPieceSize = (piece: (typeof pieces)[number]) => {
    const { width, height } = getPieceGridDimensions(piece);
    if (boardWidthPx === 0) return { width: 40, height: 40 };

    const cellSizePx = boardWidthPx / gs;
    const rawWidthPx = cellSizePx * width;
    const rawHeightPx = cellSizePx * height;
    const scale = Math.min(1, TRAY_PIECE_MAX_PX / Math.max(rawWidthPx, rawHeightPx));

    return {
      width: rawWidthPx * scale,
      height: rawHeightPx * scale,
    };
  };

  // Ghost element for dragging
  const dragPiece = pieces.find((p) => p.id === dragState?.pieceId);
  const dragPieceDimensions = dragPiece ? getPieceGridDimensions(dragPiece) : null;
  const ghostWidth = dragPieceDimensions ? (boardWidthPx / gs) * dragPieceDimensions.width : 0;
  const ghostHeight = dragPieceDimensions ? (boardWidthPx / gs) * dragPieceDimensions.height : 0;

  return (
    <div className="w-full flex flex-col items-center px-4 max-w-3xl mx-auto pt-4 animate-in fade-in duration-300 select-none">
      {/* Game Board */}
      <div
        data-testid="shape-shift-board-shell"
        className={boardShellClass}
        style={{
          width: 'min(90vw, 500px)',
          aspectRatio: '1',
        }}
      >
        <div
          ref={boardRef}
          data-testid="shape-shift-board"
          className="absolute inset-0 w-full h-full"
        >
          {/* Grid Pattern Background */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'radial-gradient(circle, #94a3b8 1px, transparent 1px)',
              backgroundSize: `${100 / 12}% ${100 / 12}%`, // 12x12 visual grid
            }}
          />

          {/* Always show neutral target slots so the first move has a clear goal. */}
          <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
            {requiredTargets.map((p) => {
              const targetOpacity = dragState
                ? TARGET_SLOT_ACTIVE_OPACITY
                : placedRequiredIds.has(p.id)
                  ? TARGET_SLOT_PLACED_OPACITY
                  : TARGET_SLOT_OPACITY;

              return (
                <div
                  key={`${problemKey}-target-${p.id}`}
                  data-testid={`shape-shift-target-${p.id}`}
                  className="absolute transition-opacity duration-200"
                  style={{
                    ...getBoardPieceStyle(p, p.correctPosition, gs),
                    opacity: targetOpacity,
                  }}
                >
                  <PieceSvg
                    type={p.type}
                    color="gray"
                    rotation={p.correctRotation}
                    variant="target"
                  />
                </div>
              );
            })}
          </div>

          {/* Paid outline hint: stronger color preview for a short burst. */}
          {showOutlineOverlay && (
            <div className="absolute inset-0 z-[5] pointer-events-none" aria-hidden="true">
              {problem.puzzle.pieces
                .filter((p) => !p.isDecoy)
                .map((p) => {
                  return (
                    <div
                      key={`${problemKey}-outline-${p.id}`}
                      className="absolute drop-shadow-sm"
                      style={{
                        ...getBoardPieceStyle(p, p.correctPosition, gs),
                        opacity: 0.34,
                      }}
                    >
                      <PieceSvg type={p.type} color={p.color} rotation={p.correctRotation} />
                    </div>
                  );
                })}
            </div>
          )}

          {status !== 'correct' && (
            <div className="absolute left-3 right-3 top-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
              <span
                data-testid="shape-shift-puzzle-name"
                className="rounded-full bg-teal-50/95 px-3 py-1.5 text-xs font-black text-teal-800 shadow-sm ring-1 ring-teal-200"
              >
                {puzzleName}
              </span>
              <span
                data-testid="shape-shift-board-prompt"
                className="max-w-full rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm ring-1 ring-slate-200"
              >
                {promptText}
              </span>
              {status === 'wrong' && (
                <span className="rounded-full bg-rose-500 px-3 py-1.5 text-xs font-black text-white shadow-sm">
                  {t.games.shape_shift.tryAgain}
                </span>
              )}
            </div>
          )}

          {/* Placed Pieces */}
          {placedSorted.map((p) => {
            const isDragging = dragState?.pieceId === p.id;

            return (
              <div
                key={`${problemKey}-board-${p.id}`}
                data-testid={`shape-shift-board-piece-${p.id}`}
                className={`absolute transition-transform ${isDragging ? 'opacity-0' : 'cursor-grab active:cursor-grabbing hover:brightness-110'}`}
                style={{
                  ...getBoardPieceStyle(p, p.currentPosition!, gs),
                  touchAction: 'none',
                }}
                onPointerDown={(e) => onPointerDown(e, p.id)}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
              >
                <PieceSvg
                  type={p.type}
                  color={p.color}
                  rotation={p.currentRotation}
                  dropShadow // Add shadow for "lifted" feel
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Drag Ghost (Floating on top of everything) */}
      {dragState && dragPiece && (
        <div
          data-testid="shape-shift-drag-ghost"
          className="fixed pointer-events-none z-[9999]"
          style={{
            left: dragState.x, // Current mouse position
            top: dragState.y,
            width: ghostWidth,
            height: ghostHeight,
            marginLeft: -ghostWidth / 2 - dragState.isoX * dragState.dragScale,
            marginTop: -ghostHeight / 2 - dragState.isoY * dragState.dragScale,
          }}
        >
          <div className="w-full h-full filter drop-shadow-2xl opacity-90">
            <PieceSvg
              type={dragPiece.type}
              color={dragPiece.color}
              rotation={dragPiece.currentRotation}
            />
          </div>
        </div>
      )}

      {/* Paid Hint Buttons */}
      {typeof spendStars === 'function' && status !== 'correct' && gameConfig?.paidHints && (
        <PaidHintButtons
          hints={gameConfig.paidHints}
          stars={stars}
          onHintClick={handleHintClick}
          disabled={status !== 'idle' || trayPieces.length === 0}
        />
      )}

      {/* Tray */}
      <div ref={trayRef} data-testid="shape-shift-tray" className={trayClass}>
        {trayPieces.length === 0 && status === 'idle' && (
          <span className="text-slate-400 italic text-sm">
            {t.games.shape_shift.allPiecesPlaced}
          </span>
        )}

        {trayPieces.map((p) => {
          const isDragging = dragState?.pieceId === p.id;
          const traySize = getTrayPieceSize(p);

          return (
            <div
              key={`${problemKey}-tray-${p.id}`}
              data-testid={`shape-shift-tray-piece-${p.id}`}
              className={`transition-all ${isDragging ? 'opacity-0 w-0 h-0 m-0 overflow-hidden' : 'cursor-grab active:cursor-grabbing hover:scale-110'}`}
              style={{
                width: traySize.width,
                height: traySize.height,
                touchAction: 'none',
              }}
              onPointerDown={(e) => onPointerDown(e, p.id)}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
            >
              <PieceSvg type={p.type} color={p.color} rotation={p.currentRotation} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
