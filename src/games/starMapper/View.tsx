/**
 * StarMapperView Component
 *
 * Interactive constellation learning game view.
 * Supports multiple game modes: trace, build, identify, expert.
 */

import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { playSound } from '../../engine/audio';
import { useTranslation } from '../../i18n/useTranslation';
import { getPackItems } from '../../curriculum';
import {
  ASTRONOMY_VISIBLE_FROM_ESTONIA_PACK,
  getConstellationById,
} from '../../curriculum/packs/astronomy/visibleFromEstonia';
import { GAME_CONFIG } from '../data';
import { usePlaySessionStore } from '../../stores/playSessionStore';
import { PaidHintButtons } from '../../components/shared';
import type { StarMapperProblem, Star, ConstellationLine } from '../../types/game';

/** Viewport width below which we use larger touch targets and star visuals (small screens only). */
const SMALL_SCREEN_BREAKPOINT_PX = 520;
/** Touch target radius in viewBox (0–100): comfortable on small screens (~44px min), smaller on desktop. */
const TOUCH_TARGET_R_SMALL = 10; // ~56px diameter on 280px SVG
const TOUCH_TARGET_R_DEFAULT = 6;
/** Min visible star radius in viewBox on small screen (smaller than before; touch target stays large). */
const MIN_STAR_VISUAL_R_SMALL = 3.5;

/** Returns true if the connection (from↔to) is already in the lines list (order-independent). */
function lineExists(line: { from: string; to: string }, lines: ConstellationLine[]): boolean {
  return lines.some(
    (l) => (l.from === line.from && l.to === line.to) || (l.from === line.to && l.to === line.from),
  );
}

type AnswerHandler = (answer: boolean) => void;

interface StarMapperViewProps {
  problem: StarMapperProblem;
  onAnswer: AnswerHandler;
  soundEnabled: boolean;
  level?: number;
  stars?: number;
  spendStars?: (count: number) => boolean;
}

export const StarMapperView: React.FC<StarMapperViewProps> = ({
  problem,
  onAnswer,
  soundEnabled,
  stars = 0,
  spendStars,
}) => {
  const t = useTranslation();
  const addNotification = usePlaySessionStore((state) => state.addNotification);
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedStar, setSelectedStar] = useState<string | null>(null);
  const [drawnLines, setDrawnLines] = useState<ConstellationLine[]>([]);
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [dragStartStarId, setDragStartStarId] = useState<string | null>(null);
  const [showHintGuide, setShowHintGuide] = useState(false);
  const identifyHandlingRef = useRef(false);
  const wrongAnswerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Responsive: larger touch targets and star visuals only on very small viewports
  const [isSmallScreen, setIsSmallScreen] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia(`(max-width: ${SMALL_SCREEN_BREAKPOINT_PX}px)`).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${SMALL_SCREEN_BREAKPOINT_PX}px)`);
    const handler = () => setIsSmallScreen(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const touchTargetR = isSmallScreen ? TOUCH_TARGET_R_SMALL : TOUCH_TARGET_R_DEFAULT;

  // Reset state when problem changes (render-time prop comparison; replaces
  // a setState-in-effect block).
  const [lastSyncedUid, setLastSyncedUid] = useState<string>(problem.uid);
  if (lastSyncedUid !== problem.uid) {
    setLastSyncedUid(problem.uid);
    setSelectedStar(null);
    setDrawnLines([]);
    setStatus('idle');
    setSelectedOption(null);
    setDragStartStarId(null);
    setShowHintGuide(false);
  }

  // Reset internal refs and clear pending timers when the problem changes
  // (or on unmount). Refs cannot be touched during render, so this lives
  // in an effect.
  useEffect(() => {
    return () => {
      identifyHandlingRef.current = false;
      if (wrongAnswerTimeoutRef.current) {
        clearTimeout(wrongAnswerTimeoutRef.current);
        wrongAnswerTimeoutRef.current = null;
      }
    };
  }, [problem.uid]);

  // Hints logic
  const handleHintClick = (hintId: string) => {
    if (!spendStars) return;

    if (hintId === 'guide') {
      const cost = 1;
      if (stars < cost) {
        addNotification({ type: 'hint', message: t.shop.notEnoughStars });
        return;
      }
      if (spendStars(cost)) {
        setShowHintGuide(true);
        setTimeout(() => setShowHintGuide(false), 5000); // Show for 5 seconds
      }
    } else if (hintId === 'connect') {
      const cost = 2;
      if (stars < cost) {
        addNotification({ type: 'hint', message: t.shop.notEnoughStars });
        return;
      }
      const requiredLines = problem.constellation.lines;
      const nextLine = requiredLines.find((required) => !lineExists(required, drawnLines));
      if (nextLine && spendStars(cost)) {
        tryAddConnection(nextLine.from, nextLine.to);
      }
    }
  };

  const gameConfig = GAME_CONFIG.star_mapper;

  // Star tap: select first star, deselect same star, or connect two stars (trace/build/expert)
  const handleStarTap = (starId: string) => {
    if (status !== 'idle') return;

    if (!selectedStar) {
      setSelectedStar(starId);
      playSound('tap', soundEnabled);
    } else if (selectedStar === starId) {
      setSelectedStar(null);
      playSound('tap', soundEnabled);
    } else {
      tryAddConnection(selectedStar, starId);
    }
  };

  // Undo last drawn line (trace/build/expert only)
  const handleUndo = useCallback(() => {
    if (status !== 'idle' || drawnLines.length === 0) return;
    setDrawnLines((prev) => prev.slice(0, -1));
    setSelectedStar(null);
    setDragStartStarId(null);
    playSound('tap', soundEnabled);
  }, [status, drawnLines.length, soundEnabled]);

  // Check if constellation is complete or wrong (used by tap and drag-to-connect)
  const checkCompletion = useCallback(
    (lines: ConstellationLine[]) => {
      const requiredLines = problem.constellation.lines;
      const allComplete = requiredLines.every((required) =>
        lines.some(
          (player) =>
            (player.from === required.from && player.to === required.to) ||
            (player.from === required.to && player.to === required.from),
        ),
      );

      if (allComplete) {
        setStatus('correct');
        playSound('success', soundEnabled);
        setTimeout(() => onAnswer(true), 2200);
        return;
      }

      if (lines.length >= requiredLines.length) {
        playSound('error', soundEnabled);
        setTimeout(() => {
          setSelectedStar(null);
          setDrawnLines([]);
          setSelectedOption(null);
          setDragStartStarId(null);
          setStatus('idle');
          onAnswer(false);
        }, 400);
      }
    },
    [problem.constellation.lines, soundEnabled, onAnswer],
  );

  // Single place to add a connection: clears selection, updates lines, plays sound, checks completion. Returns true if added, false if duplicate.
  const tryAddConnection = useCallback(
    (fromId: string, toId: string) => {
      const newLine = { from: fromId, to: toId };
      if (lineExists(newLine, drawnLines)) return false;
      setSelectedStar(null);
      setDragStartStarId(null);
      const newLines = [...drawnLines, newLine];
      setDrawnLines(newLines);
      playSound('connect', soundEnabled);
      checkCompletion(newLines);
      return true;
    },
    [drawnLines, checkCompletion, soundEnabled],
  );

  // Find star at viewBox position (for drag-to-connect release); uses same R as tap target
  const getStarAtPosition = useCallback(
    (x: number, y: number): Star | null => {
      const r2 = touchTargetR * touchTargetR;
      for (const star of problem.constellation.stars) {
        const dx = star.x - x;
        const dy = star.y - y;
        if (dx * dx + dy * dy <= r2) return star;
      }
      return null;
    },
    [problem.constellation.stars, touchTargetR],
  );

  // Convert client coords to viewBox (0–100)
  const clientToViewBox = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } | null => {
      const svg = svgRef.current;
      if (!svg) return null;
      const pt = svg.createSVGPoint();
      pt.x = clientX;
      pt.y = clientY;
      const ctm = svg.getScreenCTM();
      if (!ctm) return null;
      const svgPt = pt.matrixTransform(ctm.inverse());
      return { x: svgPt.x, y: svgPt.y };
    },
    [],
  );

  // Pointer up on star field: complete drag-to-connect if started on a star and released on another
  const handleStarFieldPointerUp = (e: React.PointerEvent) => {
    if (!dragStartStarId || status !== 'idle') {
      setDragStartStarId(null);
      return;
    }
    const pt = clientToViewBox(e.clientX, e.clientY);
    if (!pt) {
      setDragStartStarId(null);
      return;
    }
    const starAt = getStarAtPosition(pt.x, pt.y);
    if (starAt && starAt.id !== dragStartStarId) {
      tryAddConnection(dragStartStarId, starAt.id);
    }
    setDragStartStarId(null);
  };

  // Identify mode: handle option click. One answer per problem; cancel wrong-answer timeout if user then picks correct.
  const handleIdentifyClick = useCallback(
    (constellationId: string) => {
      const correctId = problem.correctAnswer;
      const isCorrect = constellationId === correctId;

      if (status === 'correct') return;

      // Second chance: was wrong, now clicking the correct option
      if (status === 'wrong') {
        if (!isCorrect) return;
        if (wrongAnswerTimeoutRef.current) {
          clearTimeout(wrongAnswerTimeoutRef.current);
          wrongAnswerTimeoutRef.current = null;
        }
        setSelectedOption(constellationId);
        setStatus('correct');
        playSound('success', soundEnabled);
        setTimeout(() => onAnswer(true), 2200);
        return;
      }

      // Idle: first click
      if (status !== 'idle') return;
      if (identifyHandlingRef.current) return;
      identifyHandlingRef.current = true;

      setSelectedOption(constellationId);
      setStatus(isCorrect ? 'correct' : 'wrong');
      if (isCorrect) {
        playSound('success', soundEnabled);
        setTimeout(() => onAnswer(true), 2200);
        return;
      }
      playSound('error', soundEnabled);
      const wrongDelay = 400;
      wrongAnswerTimeoutRef.current = setTimeout(() => {
        wrongAnswerTimeoutRef.current = null;
        identifyHandlingRef.current = false;
        setSelectedStar(null);
        setDrawnLines([]);
        setSelectedOption(null);
        setDragStartStarId(null);
        setStatus('idle');
        onAnswer(false);
      }, wrongDelay);
    },
    [status, problem.correctAnswer, soundEnabled, onAnswer],
  );

  // Visible star radius in viewBox: proportional to magnitude; on small screens enforce minimum so stars stay tappable
  const getStarVisualRadius = useCallback(
    (magnitude: number): number => {
      const base = 8 - magnitude; // magnitude 0 → 8, 6 → 2
      if (isSmallScreen) return Math.max(base * 0.6, MIN_STAR_VISUAL_R_SMALL);
      return base * 0.5; // original sizing on larger screens
    },
    [isSmallScreen],
  );

  // Get star color based on magnitude
  const getStarColor = (magnitude: number, isDistractor = false): string => {
    if (isDistractor) return '#444466';
    if (magnitude <= 1) return '#ffffff';
    if (magnitude <= 3) return '#e8e8ff';
    return '#8888aa';
  };

  // Calculate remaining lines for trace/build modes
  const linesRemaining = problem.constellation.lines.length - drawnLines.length;

  // Create star lookup map for O(1) access (performance optimization)
  const starMap = useMemo(() => {
    const map = new Map<string, Star>();
    problem.constellation.stars.forEach((star) => map.set(star.id, star));
    return map;
  }, [problem.constellation.stars]);

  // Generate ambient stars positions once (stable across re-renders)
  const ambientStars = useMemo(() => {
    // Use problem UID to create stable random seed
    const seed = problem.uid.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const seededRandom = (i: number) => {
      const x = Math.sin(seed + i * 12.9898) * 43758.5453;
      return x - Math.floor(x);
    };

    return Array.from({ length: 30 }, (_, i) => ({
      key: i,
      left: seededRandom(i * 5) * 100,
      top: seededRandom(i * 5 + 1) * 100,
      width: 1 + seededRandom(i * 5 + 2) * 2,
      height: 1 + seededRandom(i * 5 + 3) * 2,
      animationDelay: Math.min(3, seededRandom(i * 5 + 4) * 3), // Clamp max delay to 3s
    }));
  }, [problem.uid]);

  const isConnectMode =
    problem.mode === 'trace' || problem.mode === 'build' || problem.mode === 'expert';

  const isIdentify = problem.mode === 'identify';
  const hideAnswer = isIdentify && status !== 'correct';
  const cid = problem.constellation.id;
  const headerFromT = (
    t.starMapper.constellations as Record<string, { name?: string; folk?: string; desc?: string }>
  )[cid];
  const headerName = headerFromT?.name ?? problem.constellation.nameEt;
  const headerFolk = headerFromT?.folk ?? problem.constellation.folkNameEt;
  const headerDesc = headerFromT?.desc;

  return (
    <div className="w-full flex flex-col items-center px-4 sm:px-6 max-w-4xl mx-auto pt-4 sm:pt-6 animate-in fade-in duration-300">
      {/* Header - same place in all modes; blurred in identify until correct */}
      <div className="w-full max-w-4xl text-center mb-4 sm:mb-6 min-h-[4.5rem] flex flex-col justify-center">
        <div
          className={`transition-all duration-500 select-none ${hideAnswer ? 'blur-lg opacity-50' : 'blur-0 opacity-100'}`}
          aria-hidden={hideAnswer}
        >
          <div className="text-xl sm:text-3xl font-black text-slate-800 mb-1">{headerName}</div>
          {headerFolk && <div className="text-sm sm:text-base text-slate-500">{headerFolk}</div>}
          {headerDesc && <p className="mt-1 text-sm text-slate-600 italic">{headerDesc}</p>}
        </div>
      </div>

      {/* Star Field - fixed aspect ratio; min size only on small screens so touch targets stay usable */}
      <div
        className="relative w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-indigo-900/50"
        style={{
          background: 'radial-gradient(ellipse at center, #1a1a3a 0%, #0a0a1a 70%, #000000 100%)',
          maxWidth: 'min(92vw, 48rem)',
          aspectRatio: '1',
          ...(isSmallScreen ? { minWidth: 280, minHeight: 280 } : {}),
        }}
      >
        {/* Background ambient stars */}
        <div className="absolute inset-0">
          {ambientStars.map((star) => (
            <div
              key={star.key}
              className="absolute rounded-full bg-white opacity-20 animate-twinkle"
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
                width: `${star.width}px`,
                height: `${star.height}px`,
                animationDelay: `${star.animationDelay}s`,
              }}
            />
          ))}
        </div>

        {/* SVG for lines and stars */}
        <svg
          ref={svgRef}
          className="absolute inset-0 w-full h-full touch-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
          style={{ overflow: 'visible' }}
          onPointerUp={problem.mode !== 'identify' ? handleStarFieldPointerUp : undefined}
        >
          <defs>
            <filter
              id="glow"
              filterUnits="userSpaceOnUse"
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feGaussianBlur stdDeviation="1" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Radial gradient for soft star glow */}
            <radialGradient id="starGlow">
              <stop offset="0%" stopColor="#88ddff" stopOpacity="0.9" />
              <stop offset="40%" stopColor="#6eb8ff" stopOpacity="0.4" />
              <stop offset="70%" stopColor="#4a9aff" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#2a7aff" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Constellation shape: identify mode (show shape so it can be recognized) */}
          {problem.mode === 'identify' &&
            problem.constellation.lines.map((line, idx) => {
              const fromStar = starMap.get(line.from);
              const toStar = starMap.get(line.to);
              if (!fromStar || !toStar) return null;
              return (
                <line
                  key={`shape-${idx}`}
                  x1={fromStar.x}
                  y1={fromStar.y}
                  x2={toStar.x}
                  y2={toStar.y}
                  stroke="rgba(150, 200, 255, 0.85)"
                  strokeWidth="0.7"
                />
              );
            })}

          {/* Guide lines (trace mode or hint) */}
          {(problem.showGuide || showHintGuide) &&
            problem.constellation.lines.map((line, idx) => {
              const fromStar = starMap.get(line.from);
              const toStar = starMap.get(line.to);
              if (!fromStar || !toStar) return null;

              return (
                <line
                  key={`guide-${idx}`}
                  x1={fromStar.x}
                  y1={fromStar.y}
                  x2={toStar.x}
                  y2={toStar.y}
                  stroke="rgba(130, 170, 255, 0.4)"
                  strokeWidth="0.6"
                  strokeDasharray="3,2"
                  className="animate-pulse"
                />
              );
            })}

          {/* Player drawn lines */}
          {drawnLines.map((line, idx) => {
            const fromStar = starMap.get(line.from);
            const toStar = starMap.get(line.to);
            if (!fromStar || !toStar) return null;

            return (
              <g key={`drawn-${idx}`}>
                {/* Glow background */}
                <line
                  x1={fromStar.x}
                  y1={fromStar.y}
                  x2={toStar.x}
                  y2={toStar.y}
                  stroke={status === 'correct' ? '#60d0ff' : 'rgba(100, 180, 255, 0.5)'}
                  strokeWidth="1.5"
                  opacity="0.6"
                />
                {/* Main line */}
                <line
                  x1={fromStar.x}
                  y1={fromStar.y}
                  x2={toStar.x}
                  y2={toStar.y}
                  stroke={status === 'correct' ? '#a0e7ff' : '#88c0ff'}
                  strokeWidth="0.8"
                  filter={status === 'correct' ? 'url(#glow)' : undefined}
                  className={status === 'correct' ? 'animate-pulse' : ''}
                />
              </g>
            );
          })}

          {/* Constellation stars: large invisible hit area + visible star */}
          {problem.constellation.stars.map((star) => {
            const isSelected = selectedStar === star.id;
            const visualR = getStarVisualRadius(star.magnitude);
            const color = getStarColor(star.magnitude);

            return (
              <g key={star.id}>
                {/* Invisible touch target (larger on small screens only) */}
                <circle
                  cx={star.x}
                  cy={star.y}
                  r={touchTargetR}
                  fill="transparent"
                  className="cursor-pointer"
                  onClick={() => handleStarTap(star.id)}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    setDragStartStarId(star.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleStarTap(star.id);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`Star ${star.name || star.id}${isSelected ? ' (selected)' : ''}`}
                />
                {/* Visible star (drawn on top so hit area doesn’t show) */}
                <circle
                  cx={star.x}
                  cy={star.y}
                  r={visualR}
                  fill={isSelected ? '#ffffff' : color}
                  className="pointer-events-none transition-colors duration-200"
                />
              </g>
            );
          })}

          {/* Distractor stars (expert mode) - smaller visual, no tap target */}
          {problem.distractorStars.map((star) => {
            const baseR = getStarVisualRadius(star.magnitude);
            const visualR = isSmallScreen ? Math.max(baseR * 0.6, 3) : baseR * 0.4;
            const color = getStarColor(star.magnitude, true);

            return (
              <circle
                key={star.id}
                cx={star.x}
                cy={star.y}
                r={visualR}
                fill={color}
                opacity="0.6"
              />
            );
          })}
        </svg>

        {/* Success animation overlay */}
        {status === 'correct' && (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent animate-pulse pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-radial from-cyan-300/10 via-transparent to-transparent pointer-events-none" />
          </>
        )}
      </div>

      {/* Fixed bar below play area: lines remaining + Undo (no pop-in) */}
      {isConnectMode && (
        <div className="w-full max-w-2xl mt-4 flex items-center justify-between gap-4 px-2">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-semibold text-indigo-600">
              {t.starMapper.linesRemaining.replace('{count}', String(linesRemaining))}
            </span>
            <div className="h-2 w-24 sm:w-32 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 transition-all duration-300"
                style={{
                  width: `${((problem.constellation.lines.length - linesRemaining) / problem.constellation.lines.length) * 100}%`,
                }}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleUndo}
            disabled={drawnLines.length === 0 || status !== 'idle'}
            className="px-4 py-2 text-xs sm:text-sm font-bold rounded-xl border-2 border-indigo-300 bg-gradient-to-br from-white to-indigo-50 text-indigo-700 hover:from-indigo-50 hover:to-indigo-100 hover:scale-105 active:scale-95 transition-all shadow-md disabled:opacity-40 disabled:pointer-events-none disabled:scale-100"
          >
            ↶ {t.starMapper.undo}
          </button>
        </div>
      )}

      {/* Identify mode options - always in same place, no content between game area and options */}
      {problem.mode === 'identify' &&
        problem.options &&
        (() => {
          const allConstellations = getPackItems<typeof problem.constellation>(
            ASTRONOMY_VISIBLE_FROM_ESTONIA_PACK.id,
          );
          return (
            <div className="grid grid-cols-2 gap-4 sm:gap-5 w-full max-w-2xl mt-6">
              {problem.options.map((optionId) => {
                const constellation = getConstellationById(allConstellations, optionId);
                if (!constellation) return null;

                const nameFromT = (
                  t.starMapper.constellations as Record<string, { name?: string }>
                )[optionId]?.name;
                const displayName = nameFromT ?? constellation.nameEt;

                const isSelected = selectedOption === optionId;
                const isCorrect = optionId === problem.correctAnswer;
                const showResult = status !== 'idle';
                const canClick = status === 'idle' || (status === 'wrong' && isCorrect);

                return (
                  <button
                    key={optionId}
                    type="button"
                    disabled={!canClick}
                    onPointerUp={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (e.button !== 0 && e.pointerType !== 'touch') return;
                      // eslint-disable-next-line react-hooks/refs -- called from pointer event, not render
                      handleIdentifyClick(optionId);
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    className={`
                  relative px-5 py-4 rounded-2xl border-b-4
                  text-base sm:text-lg font-bold flex items-center justify-center
                  transition-all duration-200 shadow-xl min-h-[4rem]
                  ${
                    showResult && isCorrect
                      ? 'bg-gradient-to-br from-green-400 to-green-600 border-green-700 text-white scale-105 shadow-green-500/50'
                      : showResult && isSelected && !isCorrect
                        ? 'bg-gradient-to-br from-red-400 to-red-600 border-red-700 text-white scale-95 shadow-red-500/50'
                        : status === 'idle'
                          ? 'bg-gradient-to-br from-white via-indigo-50 to-cyan-50 border-indigo-400 hover:border-cyan-500 hover:from-indigo-50 hover:via-cyan-50 hover:to-indigo-100 hover:scale-105 hover:-translate-y-1 hover:shadow-2xl active:scale-95 active:border-b-2 active:translate-y-1 text-indigo-900'
                          : 'bg-slate-200 border-slate-300 text-slate-400 opacity-40'
                  }
                `}
                  >
                    {/* Shimmer effect on hover - pointer-events-none so tap goes to button */}
                    {status === 'idle' && (
                      <div
                        className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 hover:opacity-100 transition-opacity rounded-2xl"
                        style={{ transform: 'translateX(-100%)', animation: 'shimmer 2s infinite' }}
                      />
                    )}
                    <span className="text-center relative z-10">{displayName}</span>
                  </button>
                );
              })}
            </div>
          );
        })()}

      {/* Paid Hint Buttons (only for connect modes, not identify) */}
      {typeof spendStars === 'function' &&
        status !== 'correct' &&
        isConnectMode &&
        gameConfig?.paidHints && (
          <PaidHintButtons
            hints={gameConfig.paidHints}
            stars={stars}
            onHintClick={handleHintClick}
            disabled={status !== 'idle'}
          />
        )}
    </div>
  );
};
