/**
 * The raft (board 2A, ADR 0005): a math quiz's piece rides a raft across a
 * river. Each right answer moves it one of the round's marks: the river slides
 * under it, so the piece stays where the child taps, and after the last mark
 * the far bank comes in and its flag waves. A lost life rocks the raft and
 * leaves that buoy red. The buoy line at the top is the round's goal strip.
 */

import React, { useEffect, useRef } from 'react';
import { playMoment } from '../../engine/audio';
import { isTimedRound, ROUND_LIVES } from '../../engine/round';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useProfileText } from '../../hooks/useProfileText';
import { useTranslation } from '../../i18n/useTranslation';
import { useGameStore } from '../../stores/gameStore';
import { usePlaySessionStore } from '../../stores/playSessionStore';

const RIVER = {
  sky: '#e4f2f8',
  skyLine: '#bcdcea',
  water: '#8fc8df',
  wave: '#6aaecb',
  foam: '#ffffff',
  wood: '#b98a5a',
  woodDark: '#8a6440',
  sand: '#ead7a4',
  grass: '#86b36b',
  pole: '#3c4a63',
  flag: '#1b7341',
} as const;

/** How long the raft glides to the next mark; a reached round docks before its end screen. */
const GLIDE_MS = 800;

interface BuoyLineProps {
  progress: number;
  size: number;
  missed: readonly number[];
  label: string;
}

const BuoyLine: React.FC<BuoyLineProps> = ({ progress, size, missed, label }) => (
  <div
    data-testid="round-goal"
    role="img"
    aria-label={label}
    className="flex h-9 items-center justify-between gap-1 pl-3"
    style={{ background: 'rgba(255,255,255,0.55)' }}
  >
    {Array.from({ length: size }, (_, i) => {
      const done = i < progress;
      const current = i === progress;
      const background = done ? (missed.includes(i) ? 'var(--bad)' : 'var(--study)') : '#ffffff';
      const border = done ? 'transparent' : current ? 'var(--ink)' : RIVER.wave;
      return (
        <span
          key={i}
          data-buoy={done ? (missed.includes(i) ? 'missed' : 'passed') : current ? 'next' : 'ahead'}
          className="block shrink-0 rounded-full transition-colors duration-300"
          style={{
            width: current ? 16 : 12,
            height: current ? 16 : 12,
            background,
            border: `${current ? 3 : 2}px solid ${border}`,
          }}
        />
      );
    })}
    <svg viewBox="0 0 24 36" className="h-9 w-6 shrink-0" aria-hidden>
      <rect x="0" y="12" width="24" height="24" fill={RIVER.sand} />
      <path d="M10 26V6" stroke={RIVER.pole} strokeWidth="2" />
      <path d="M11 6h11l-4 5 4 5H11z" fill={RIVER.flag} />
    </svg>
  </div>
);

const FarBank: React.FC<{ docked: boolean }> = ({ docked }) => (
  <svg
    viewBox="0 0 72 120"
    className="absolute bottom-0 right-0 h-32 w-auto"
    preserveAspectRatio="xMaxYMax meet"
    aria-hidden
  >
    <path d="M10 60c14-10 40-14 62-8v68H0V76c4-8 6-12 10-16z" fill={RIVER.sand} />
    <path d="M10 60c14-10 40-14 62-8v8c-22-4-44 0-62 10z" fill={RIVER.grass} />
    <path d="M40 58V14" stroke={RIVER.pole} strokeWidth="3" />
    <path
      className={docked ? 'raft-flag' : undefined}
      d="M42 14h24l-8 9 8 9H42z"
      fill={RIVER.flag}
      style={{ transformOrigin: '42px 23px' }}
    />
  </svg>
);

/** One stretch of river; the last holds the far bank. */
const RiverStretch: React.FC<{ last: boolean; docked: boolean }> = ({ last, docked }) => (
  <div className="relative h-full flex-1">
    <svg
      viewBox="0 0 100 40"
      preserveAspectRatio="none"
      className="absolute inset-x-0 bottom-0 h-12 w-full"
      aria-hidden
    >
      <rect y="6" width="100" height="34" fill={RIVER.water} />
      <path
        d="M0 8c8 3 17-3 25 0s17 3 25 0 17-3 25 0 17 3 25 0"
        stroke={RIVER.wave}
        strokeWidth="2"
        fill="none"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M8 26c5 2 10-2 15 0M52 32c5 2 10-2 15 0M78 22c5 2 10-2 15 0"
        stroke={RIVER.wave}
        strokeWidth="1.5"
        fill="none"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
    {last && <FarBank docked={docked} />}
  </div>
);

const RaftDeck: React.FC = () => (
  <svg
    viewBox="0 0 100 8"
    preserveAspectRatio="none"
    className="relative -mb-1 block h-4 w-[92%]"
    aria-hidden
  >
    <rect width="100" height="8" fill={RIVER.wood} />
    {[12, 24, 36, 48, 60, 72, 84].map((x) => (
      <line
        key={x}
        x1={x}
        y1="0"
        x2={x}
        y2="8"
        stroke={RIVER.woodDark}
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
    ))}
  </svg>
);

/** The river under the raft: a stretch per mark, slid one stretch per right answer. */
const River = React.memo(function River({
  size,
  progress,
  docked,
}: {
  size: number;
  progress: number;
  docked: boolean;
}) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="flex h-full"
        style={{
          width: `${(size + 1) * 100}%`,
          transform: `translateX(-${(progress / (size + 1)) * 100}%)`,
          transition: `transform ${GLIDE_MS}ms ease-in-out`,
        }}
      >
        {Array.from({ length: size + 1 }, (_, i) => (
          <RiverStretch key={i} last={i === size} docked={docked} />
        ))}
      </div>
    </div>
  );
});

const NO_MISSES: readonly number[] = [];

interface RaftStageProps {
  /** The task on the raft; a new one fades in as the raft stops. */
  taskKey: string;
  children: React.ReactNode;
}

export const RaftStage: React.FC<RaftStageProps> = ({ taskKey, children }) => {
  const t = useTranslation();
  const { formatText } = useProfileText();
  const size = usePlaySessionStore((state) =>
    state.round && !isTimedRound(state.round.spec) ? state.round.spec.size : 0,
  );
  const progress = Math.min(
    usePlaySessionStore((state) => state.round?.progress ?? 0),
    size,
  );
  const lives = usePlaySessionStore((state) => state.round?.lives ?? 0);
  const misses = usePlaySessionStore((state) => state.round?.misses ?? NO_MISSES);
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  // The oars when the raft moves on, not when a new round puts it back.
  const shownProgress = useRef(progress);
  useEffect(() => {
    if (progress > shownProgress.current) {
      playMoment('raft', useGameStore.getState().soundEnabled, 0.25);
    }
    shownProgress.current = progress;
  }, [progress]);

  // A lost life rocks the raft; a new round's full lives do not.
  const shownLives = useRef(lives);
  const raftRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const rocked = lives < shownLives.current;
    shownLives.current = lives;
    const raft = raftRef.current;
    if (!rocked || !raft || typeof raft.animate !== 'function' || reducedMotion) return;
    raft.animate(
      [
        { transform: 'rotate(0deg)' },
        { transform: 'rotate(4deg)' },
        { transform: 'rotate(-3deg)' },
        { transform: 'rotate(0deg)' },
      ],
      { duration: 400, easing: 'ease-out' },
    );
  }, [lives, reducedMotion]);

  const docked = size > 0 && progress >= size;
  const label = `${formatText(t.gameScreen.roundLabel)} ${progress}/${size}`;

  return (
    <div
      data-testid="raft-stage"
      data-progress={progress}
      data-task={taskKey}
      className="relative w-full max-w-md overflow-hidden rounded-lg"
      style={{ background: RIVER.sky, border: `2px solid ${RIVER.skyLine}` }}
    >
      {size > 0 && <BuoyLine progress={progress} size={size} missed={misses} label={label} />}
      <div className="relative">
        <River size={size} progress={progress} docked={docked} />
        <div ref={raftRef} className="relative flex flex-col items-center px-3 pb-7 pt-2">
          <div key={taskKey} className="relative w-full animate-in fade-in duration-300">
            {children}
          </div>
          <RaftDeck />
          {progress > 0 && (
            <svg
              key={`wake-${progress}`}
              viewBox="0 0 60 24"
              className="raft-wake absolute bottom-1 left-1 h-6 w-16"
              aria-hidden
            >
              <path
                d="M14 4h40M6 12h50M18 20h30"
                stroke={RIVER.foam}
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          )}
          {lives < ROUND_LIVES && (
            <svg
              key={`splash-${lives}`}
              viewBox="0 0 40 30"
              className="raft-splash absolute bottom-3 right-6 h-8 w-10"
              aria-hidden
            >
              <circle cx="10" cy="22" r="4" fill={RIVER.foam} />
              <circle cx="22" cy="14" r="3" fill={RIVER.foam} />
              <circle cx="32" cy="22" r="3" fill={RIVER.foam} />
              <circle cx="18" cy="5" r="2.5" fill={RIVER.foam} />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
};
