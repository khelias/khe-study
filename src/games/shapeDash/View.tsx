import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { playSound } from '../../engine/audio';
import { useTranslation } from '../../i18n/useTranslation';
import { PaidHintButtons } from '../../components/shared/PaidHintButtons';
import { GAME_CONFIG } from '../data';
import { usePlaySessionStore } from '../../stores/playSessionStore';
import type { ShapeDashProblem } from '../../types/game';
import {
  CANVAS_HEIGHT_BASE,
  CANVAS_MAX_WIDTH,
  GROUND_Y,
  PLAYER_SIZE,
  getCanvasHeight,
  getGroundY,
  getPlayerX,
  getResponsiveGateScale,
  type ShapeDashFeedbackCopy,
  type ShapeDashLabels,
} from './layout';
import { renderShapeDashFrame } from './renderer';
import { awardShapeDashPoints, recordShapeDashRun } from './runPoints';
import { createInitialRunState, restartRun, type GameState } from './runState';
import { stepRunFrame } from './simulation';

type AnswerHandler = (answer: boolean) => void;

interface ShapeDashViewProps {
  problem: ShapeDashProblem;
  onAnswer: AnswerHandler;
  soundEnabled: boolean;
  gameType?: string;
  stars?: number;
  spendStars?: (count: number) => boolean;
  /** While the game description sheet is open the run holds still. */
  paused?: boolean;
}

export const ShapeDashView: React.FC<ShapeDashViewProps> = ({
  problem,
  onAnswer,
  soundEnabled,
  stars = 0,
  spendStars,
  paused = false,
}) => {
  const t = useTranslation();
  const shapeDashText = t.games.shape_dash;
  const shapeDashLabels: ShapeDashLabels = useMemo(
    () => ({
      attempt: shapeDashText.attemptLabel,
      score: shapeDashText.scoreLabel,
      shield: shapeDashText.shieldLabel,
      oneMoreWrongWarning: shapeDashText.oneMoreWrongWarning,
      wrongGateNextWarning: shapeDashText.wrongGateNextWarning,
    }),
    [shapeDashText],
  );
  const feedbackCopy: ShapeDashFeedbackCopy = useMemo(
    () => ({
      gateCorrect: shapeDashText.gateCorrect,
      gateWrong: shapeDashText.gateWrong,
      shieldLost: shapeDashText.shieldLost,
    }),
    [shapeDashText],
  );

  const [gameState, setGameState] = useState<'playing' | 'crashed' | 'won'>('playing');
  const [displayScore, setDisplayScore] = useState(0);
  const [displayAttempt, setDisplayAttempt] = useState(1);
  const [displayStarsCollected, setDisplayStarsCollected] = useState(0);
  const [displayTotalStars, setDisplayTotalStars] = useState(0);
  const [displayRating, setDisplayRating] = useState(0);
  const [canvasWidth, setCanvasWidth] = useState(CANVAS_MAX_WIDTH);
  const [canvasHeight, setCanvasHeight] = useState(CANVAS_HEIGHT_BASE);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const problemRef = useRef(problem);
  const onAnswerRef = useRef(onAnswer);
  const soundEnabledRef = useRef(soundEnabled);
  const gameStateRef = useRef(gameState);
  const pausedRef = useRef(paused);
  const labelsRef = useRef(shapeDashLabels);
  const feedbackCopyRef = useRef(feedbackCopy);
  const canvasSizeRef = useRef({ width: CANVAS_MAX_WIDTH, height: CANVAS_HEIGHT_BASE });
  const lastTimeRef = useRef(0);
  const jumpRequestedRef = useRef(false);
  const lastGroundedRef = useRef(false);
  const stateRef = useRef<GameState>(
    createInitialRunState(GROUND_Y - PLAYER_SIZE, problem.stars?.length ?? 0),
  );

  useEffect(() => {
    problemRef.current = problem;
    onAnswerRef.current = onAnswer;
    soundEnabledRef.current = soundEnabled;
    gameStateRef.current = gameState;
    pausedRef.current = paused;
    labelsRef.current = shapeDashLabels;
    feedbackCopyRef.current = feedbackCopy;
  }, [problem, onAnswer, soundEnabled, gameState, paused, shapeDashLabels, feedbackCopy]);

  useEffect(() => {
    canvasSizeRef.current = { width: canvasWidth, height: canvasHeight };
  }, [canvasWidth, canvasHeight]);

  useEffect(() => {
    const state = stateRef.current;
    state.passedGateIds.clear();
    state.collectedStarIds.clear();
    state.passedObstacleIndices.clear();
    state.totalStars = problem.stars?.length ?? 0;
    state.consecutiveWrongGates = 0;
    state.revealedGateId = null;
    state.slowTimeUntil = 0;
    state.feedbackMessage = null;
    state.feedbackType = null;
    state.feedbackUntil = 0;
  }, [problem]);

  const doRetry = useCallback(() => {
    restartRun(
      stateRef.current,
      getGroundY(canvasHeight) - PLAYER_SIZE,
      problemRef.current.stars?.length ?? 0,
    );
    jumpRequestedRef.current = false;
    lastGroundedRef.current = false;
    setGameState('playing');
    playSound('tap', soundEnabledRef.current);
  }, [canvasHeight]);

  const hints = useMemo(() => GAME_CONFIG.shape_dash?.paidHints ?? [], []);

  const handlePaidHint = useCallback(
    (hintId: string) => {
      if (!spendStars) return;
      const hint = hints.find((h) => h.id === hintId);
      if (!hint || !spendStars(hint.cost)) return;

      const state = stateRef.current;
      if (hintId === 'reveal_gate') {
        const shapeGates = problemRef.current.shapeGates ?? [];
        const nextGate = shapeGates.find((g) => !state.passedGateIds.has(g.id));
        if (nextGate) {
          state.revealedGateId = nextGate.id;
          playSound('correct', soundEnabledRef.current);
          setTimeout(() => {
            if (stateRef.current.revealedGateId === nextGate.id) {
              stateRef.current.revealedGateId = null;
            }
          }, 5000);
        }
      } else if (hintId === 'slow_time') {
        state.slowTimeUntil = performance.now() + 3000;
        playSound('tap', soundEnabledRef.current);
      }
    },
    [spendStars, hints],
  );

  const requestJump = useCallback(() => {
    jumpRequestedRef.current = true;
  }, []);

  const triggerAction = useCallback(() => {
    if (gameStateRef.current === 'crashed') {
      doRetry();
      return;
    }
    requestJump();
  }, [doRetry, requestJump]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space' && e.key !== ' ') return;
      // A covering sheet keeps its Space, and no jump waits for the run to resume.
      if (pausedRef.current) return;
      e.preventDefault();
      e.stopPropagation();
      triggerAction();
    };
    window.addEventListener('keydown', handleKey, true);
    return () => window.removeEventListener('keydown', handleKey, true);
  }, [triggerAction]);

  useEffect(() => {
    const state = stateRef.current;
    const groundY = getGroundY(canvasHeight);
    state.scroll = 0;
    state.playerY = groundY - PLAYER_SIZE;
    state.playerVelY = 0;
    state.playerRotation = 0;
    state.isOnGround = true;
    state.canDoubleJump = true;
    state.squashStretch = 1;
    state.screenShake = 0;
    state.score = 0;
    state.particles = [];
    state.trailPoints = [];
    state.attemptCount = 1;
    state.passedGateIds = new Set();
    state.passedObstacleIndices = new Set();
    state.consecutiveWrongGates = 0;
    state.revealedGateId = null;
    state.slowTimeUntil = 0;
    state.feedbackMessage = null;
    state.feedbackType = null;
    state.feedbackUntil = 0;
    jumpRequestedRef.current = false;
    lastGroundedRef.current = false;
    const id = setTimeout(() => {
      setGameState('playing');
    }, 0);
    return () => clearTimeout(id);
  }, [problem.uid, canvasHeight]);

  useEffect(() => {
    containerRef.current?.focus({ preventScroll: true });
  }, []);

  // Keep the runner wide on desktop, but give narrow screens enough height for
  // all three gate lanes above the ground.
  useEffect(() => {
    const updateCanvasSize = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const width = Math.max(1, Math.min(Math.floor(rect.width), CANVAS_MAX_WIDTH));
      const height = getCanvasHeight(width, window.innerHeight);
      setCanvasWidth(width);
      setCanvasHeight(height);
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    window.addEventListener('orientationchange', updateCanvasSize);
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      window.removeEventListener('orientationchange', updateCanvasSize);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    let winTimeoutId: ReturnType<typeof setTimeout> | null = null;

    const recordRun = () => {
      const state = stateRef.current;
      recordShapeDashRun(state.unrecordedPoints);
      state.unrecordedPoints = 0;
    };

    const loop = (time: number) => {
      rafId = requestAnimationFrame(loop);

      if (gameStateRef.current !== 'playing') return;
      if (pausedRef.current) {
        lastTimeRef.current = time;
        return;
      }

      const dt = Math.min(0.032, (time - lastTimeRef.current) / 1000);
      lastTimeRef.current = time;

      const state = stateRef.current;
      const prob = problemRef.current;
      const { width, height } = canvasSizeRef.current;
      const groundY = getGroundY(height);
      const gateScale = getResponsiveGateScale(groundY);
      const playerX = getPlayerX(width);

      const jumpRequested = jumpRequestedRef.current;
      jumpRequestedRef.current = false;

      const step = stepRunFrame({
        state,
        problem: prob,
        dt,
        time,
        canvasWidth: width,
        canvasHeight: height,
        groundY,
        gateScale,
        playerX,
        jumpRequested,
        wasGrounded: lastGroundedRef.current,
        feedbackCopy: feedbackCopyRef.current,
        callbacks: {
          onSound: (sound) => playSound(sound, soundEnabledRef.current),
          onAwardPoints: awardShapeDashPoints,
          getSessionScore: () => usePlaySessionStore.getState().score,
        },
      });
      lastGroundedRef.current = step.isGrounded;

      if (step.outcome === 'crashed') {
        setDisplayScore(state.score);
        setDisplayAttempt(state.attemptCount);
        setGameState('crashed');
        recordRun();
        onAnswerRef.current(false);
        return;
      }

      if (step.outcome === 'won') {
        setDisplayScore(state.score);
        setDisplayAttempt(state.attemptCount);
        setDisplayStarsCollected(state.starsCollected);
        setDisplayTotalStars(state.totalStars);
        setDisplayRating(step.rating ?? 1);
        setGameState('won');
        recordRun();
        winTimeoutId = setTimeout(() => onAnswerRef.current(true), 800);
        return;
      }

      renderShapeDashFrame(ctx, {
        state,
        problem: prob,
        width,
        height,
        groundY,
        gateScale,
        playerX,
        time,
        labels: labelsRef.current,
      });
    };

    lastTimeRef.current = performance.now();
    rafId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafId);
      if (winTimeoutId !== null) clearTimeout(winTimeoutId);
      recordRun();
    };
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      triggerAction();
    },
    [triggerAction],
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      triggerAction();
    },
    [triggerAction],
  );

  const handleJumpButtonClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      triggerAction();
    },
    [triggerAction],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        triggerAction();
      }
    },
    [triggerAction],
  );

  const tapToRetry =
    shapeDashText.tapToRetry ?? (t.game as { retry?: string })?.retry ?? 'Tap to try again';
  const playAreaLabel = shapeDashText.playAreaLabel ?? shapeDashText.title ?? 'Shape Dash';

  return (
    <div className="shape-dash-shell flex flex-col items-center gap-2 w-full max-w-4xl relative sm:gap-3">
      <div
        ref={containerRef}
        className="relative rounded-2xl overflow-hidden border-2 border-emerald-400 shadow-xl bg-slate-900 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 w-full"
        style={{
          aspectRatio: `${canvasWidth} / ${canvasHeight}`,
          maxWidth: '100%',
          boxShadow: '0 0 40px rgba(0, 255, 136, 0.2)',
        }}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label={gameState === 'crashed' ? tapToRetry : playAreaLabel}
      >
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          className="block w-full h-full"
          style={{ display: 'block' }}
        />
        {gameState === 'won' && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none rounded-2xl"
            style={{
              background:
                'radial-gradient(circle, rgba(0, 255, 136, 0.4) 0%, rgba(0, 255, 204, 0.2) 100%)',
            }}
          >
            <span className="text-5xl">🎉</span>
            <span className="text-3xl font-black text-white drop-shadow-lg">
              {shapeDashText.completeLabel}
            </span>
            <div className="text-4xl">{'⭐'.repeat(displayRating)}</div>
            <span className="text-xl font-bold text-white drop-shadow-md">
              {shapeDashText.scoreLabel}: {displayScore}
            </span>
            <span className="text-lg font-semibold text-white/90 drop-shadow-md">
              {shapeDashText.starsLabel}: {displayStarsCollected}/{displayTotalStars}
            </span>
          </div>
        )}
        {gameState === 'crashed' && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl pointer-events-none"
            style={{
              background:
                'radial-gradient(circle, rgba(255, 51, 102, 0.5) 0%, rgba(255, 0, 0, 0.3) 100%)',
            }}
          >
            <span className="text-5xl">💥</span>
            <span className="text-xl font-bold text-white drop-shadow-md text-center px-4">
              {tapToRetry}
            </span>
            <span className="text-lg font-semibold text-white/90 drop-shadow-md">
              {shapeDashText.attemptLabel} {displayAttempt}
            </span>
          </div>
        )}
      </div>

      <button
        type="button"
        data-testid="shape-dash-jump-button"
        className="shape-dash-jump-button flex min-h-[48px] w-full max-w-xs items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-emerald-400 px-5 py-2.5 text-base font-black text-slate-950 shadow-lg shadow-emerald-500/20 transition-transform active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 sm:min-h-[52px] sm:py-3"
        onClick={handleJumpButtonClick}
        aria-label={gameState === 'crashed' ? tapToRetry : shapeDashText.jumpLabel}
      >
        <ArrowUp size={22} strokeWidth={3} aria-hidden="true" />
        <span>{gameState === 'crashed' ? tapToRetry : shapeDashText.jumpLabel}</span>
      </button>

      <div className="hidden text-sm text-slate-400 text-center sm:block">
        <kbd className="px-2 py-1 bg-slate-700 rounded text-xs font-semibold text-slate-200">
          SPACE
        </kbd>{' '}
        {shapeDashText.jumpHint}
      </div>

      <PaidHintButtons
        hints={hints}
        stars={stars}
        onHintClick={handlePaidHint}
        disabled={gameState !== 'playing'}
        placement="inline"
      />
    </div>
  );
};
