/**
 * BalanceScaleView Component
 *
 * Game view for balance scale problems, on the raft (board 2A). Flat pans, weights on top; the
 * unknown weights are the dashed ones, on either pan.
 */

import type { GameViewProps } from '../registry';
import React, { useState } from 'react';
import { playSound } from '../../engine/audio';
import type { BalanceScaleProblem } from '../../types/game';
import { SvgWeight } from '../../components/shared/SvgWeight';
import { GAME_CONFIG } from '../data';
import { PaidHintButtons } from '../../components/shared';
import { useAnswerLock } from '../../hooks/useAnswerLock';
import { useAnswerMarks } from '../../hooks/useAnswerMarks';
import { AnswerMarkIcon } from '../../components/shared/AnswerMark';
import { useEliminateWrongOption, wrongOptionIndices } from '../../hooks/useEliminateWrongOption';
import { RaftStage } from '../../components/raft/RaftStage';
import { panSums } from './generator';

/** Scale geometry – single source of truth for SVG layout */
const SCALE = {
  viewBox: { w: 400, h: 300 },
  pivot: { x: 200, y: 80 },
  pan: {
    width: 144,
    height: 18,
    rx: 9,
    topY: 100,
    chainEndY: 98,
    chainSpread: 40,
    weightY: 83,
  },
  beam: { x: 50, width: 300, height: 12 },
  pole: { x: 196, y: 78, width: 8, height: 152 },
  base: { cx: 200, cy: 288, rx: 78, ry: 9 },
  panCenterX: { left: 60, right: 340 },
} as const;

/** Where the weights stand on a pan, by how many there are. */
const WEIGHT_X: Record<number, readonly number[]> = {
  1: [0],
  2: [-32, 32],
  3: [-46, 0, 46],
};

interface BalanceScaleViewProps {
  problem: BalanceScaleProblem;
  onAnswer: GameViewProps['onAnswer'];
  soundEnabled: boolean;
  gameType?: string;
  stars?: number;
  spendStars?: (count: number) => boolean;
}

export const BalanceScaleView: React.FC<BalanceScaleViewProps> = ({
  problem,
  onAnswer,
  soundEnabled,
  gameType,
  stars = 0,
  spendStars,
}) => {
  const problemUid = problem.uid;
  const gameId = gameType ?? 'balance_scale';
  const paidHints = GAME_CONFIG[gameId]?.paidHints ?? [];
  // Before an answer the full pan hangs low.
  const restTilt = problem.display.hidden.side === 'right' ? -10 : 10;
  const [tilt, setTilt] = useState<number>(restTilt);
  // The weight the child picked stands in for the unknowns while the scale settles (2A frame 1).
  const [placed, setPlaced] = useState<number | null>(null);

  // Reset state when problem changes (render-time prop comparison).
  const [lastSyncedUid, setLastSyncedUid] = useState<string>(problemUid);
  if (lastSyncedUid !== problemUid) {
    setLastSyncedUid(problemUid);
    setTilt(restTilt);
    setPlaced(null);
  }

  const { eliminated: eliminatedIndices, eliminate } = useEliminateWrongOption(
    wrongOptionIndices(problem.options, problem.answer),
    [problem.uid],
    spendStars,
  );
  const handlePaidHint = (hintId: string) => {
    if (hintId === 'eliminate') eliminate();
  };

  // Locked from the tap until the scale settles; a wrong weight unlocks it again.
  const { lock, unlock } = useAnswerLock(problemUid);
  const marks = useAnswerMarks<number>(problemUid, problem.answer, soundEnabled);

  const handleChoice = (weight: number): void => {
    if (!lock()) return;
    playSound('click', soundEnabled);
    const sums = panSums(problem, weight);

    let newTilt = 0;
    if (sums.left > sums.right) newTilt = -20;
    else if (sums.right > sums.left) newTilt = 20;

    setTilt(newTilt);
    setPlaced(weight);

    setTimeout(() => {
      if (sums.left === sums.right) {
        onAnswer(true, { revealed: marks.markRight(weight) });
      } else {
        marks.markWrong(weight);
        onAnswer(false);
        // The next pick waits for the scale to settle back, so this reset never lands on it.
        setTimeout(() => {
          setTilt(restTilt);
          setPlaced(null);
          unlock();
        }, 300);
      }
    }, 1000);
  };

  const { left, right, hidden } = problem.display;
  const panWeights = (side: 'left' | 'right', known: number[]) => [
    ...known.map((num) => ({ num, color: side === 'left' ? ('red' as const) : ('blue' as const) })),
    ...Array.from({ length: hidden.side === side ? hidden.count : 0 }, () =>
      placed === null
        ? { label: '?', color: 'neutral' as const, dashed: true }
        : { num: placed, color: 'neutral' as const },
    ),
  ];
  const panConfigs: Array<{
    translateX: number;
    fill: string;
    stroke: string;
    weights: Array<{
      num?: number;
      label?: string;
      color: 'red' | 'blue' | 'neutral';
      dashed?: boolean;
    }>;
  }> = [
    {
      translateX: SCALE.panCenterX.left,
      fill: 'url(#panRed)',
      stroke: '#dc2626',
      weights: panWeights('left', left),
    },
    {
      translateX: SCALE.panCenterX.right,
      fill: 'url(#panBlue)',
      stroke: '#2563eb',
      weights: panWeights('right', right),
    },
  ];

  return (
    <div
      data-qa-answer={import.meta.env.DEV ? problem.answer : undefined}
      className="w-full flex flex-col items-center px-4 sm:px-6 max-w-2xl mx-auto pt-4 sm:pt-6 animate-in fade-in duration-300"
    >
      <RaftStage taskKey={problem.uid}>
        <div className="relative w-full max-w-lg mx-auto flex justify-center overflow-visible">
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${SCALE.viewBox.w} ${SCALE.viewBox.h}`}
            preserveAspectRatio="xMidYMid meet"
            className="overflow-visible"
            style={{ minHeight: '220px' }}
            aria-hidden
          >
            <defs>
              <linearGradient id="bsBeam" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#cbd5e1" />
                <stop offset="40%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#64748b" />
              </linearGradient>
              <linearGradient id="bsBeamTop" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f1f5f9" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
              <linearGradient id="bsBase" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#cbd5e1" />
              </linearGradient>
              <linearGradient id="bsPole" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#475569" />
                <stop offset="100%" stopColor="#64748b" />
              </linearGradient>
              <filter id="bsShadow">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2" />
              </filter>
              <filter id="bsShadowSoft">
                <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.15" />
              </filter>
              <linearGradient id="panRed" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fecaca" />
                <stop offset="25%" stopColor="#fca5a5" />
                <stop offset="100%" stopColor="#fca5a5" />
              </linearGradient>
              <linearGradient id="panBlue" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#e0e7ff" />
                <stop offset="25%" stopColor="#bfdbfe" />
                <stop offset="100%" stopColor="#bfdbfe" />
              </linearGradient>
            </defs>

            <ellipse
              cx={SCALE.base.cx}
              cy={SCALE.base.cy}
              rx={SCALE.base.rx}
              ry={SCALE.base.ry}
              fill="#e2e8f0"
              opacity="0.9"
            />
            <path
              d="M 108 278 Q 108 252 132 232 L 268 232 Q 292 252 292 278 Z"
              fill="url(#bsBase)"
              stroke="#94a3b8"
              strokeWidth="2"
              filter="url(#bsShadow)"
            />
            <rect
              x={SCALE.pole.x}
              y={SCALE.pole.y}
              width={SCALE.pole.width}
              height={SCALE.pole.height}
              rx="4"
              fill="url(#bsPole)"
              filter="url(#bsShadow)"
            />
            <rect
              x={SCALE.pivot.x - 9}
              y={SCALE.pivot.y - 6}
              width="18"
              height="7"
              rx="3.5"
              fill="#64748b"
            />

            <g
              style={{
                transform: `rotate(${tilt}deg)`,
                transformOrigin: `${SCALE.pivot.x}px ${SCALE.pivot.y}px`,
                transition: 'transform 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              <rect
                x={SCALE.beam.x}
                y={SCALE.pivot.y - 6}
                width={SCALE.beam.width}
                height={SCALE.beam.height}
                rx="6"
                fill="url(#bsBeam)"
                stroke="#64748b"
                strokeWidth="1.5"
                filter="url(#bsShadow)"
              />
              <rect
                x={SCALE.beam.x}
                y={SCALE.pivot.y - 6}
                width={SCALE.beam.width}
                height="5"
                rx="6"
                fill="url(#bsBeamTop)"
                opacity="0.9"
              />
              <circle
                cx={SCALE.pivot.x}
                cy={SCALE.pivot.y}
                r="9"
                fill="#3b82f6"
                stroke="#2563eb"
                strokeWidth="2"
                filter="url(#bsShadow)"
              />
              <circle cx={SCALE.pivot.x} cy={SCALE.pivot.y} r="5" fill="#93c5fd" opacity="0.8" />

              {panConfigs.map((pan, i) => (
                <g key={i} transform={`translate(${pan.translateX}, ${SCALE.pivot.y})`}>
                  <g
                    style={{
                      transform: `rotate(${-tilt}deg)`,
                      transformOrigin: '0 0',
                      transition: 'transform 1s',
                    }}
                  >
                    <line
                      x1="0"
                      y1="0"
                      x2={-SCALE.pan.chainSpread}
                      y2={SCALE.pan.chainEndY}
                      stroke="#64748b"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <line
                      x1="0"
                      y1="0"
                      x2={SCALE.pan.chainSpread}
                      y2={SCALE.pan.chainEndY}
                      stroke="#64748b"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <rect
                      x={-SCALE.pan.width / 2}
                      y={SCALE.pan.topY}
                      width={SCALE.pan.width}
                      height={SCALE.pan.height}
                      rx={SCALE.pan.rx}
                      ry={SCALE.pan.rx}
                      fill={pan.fill}
                      stroke={pan.stroke}
                      strokeWidth="2"
                      filter="url(#bsShadowSoft)"
                    />
                    {pan.weights.map((w, j) => (
                      <SvgWeight
                        key={j}
                        x={WEIGHT_X[pan.weights.length]?.[j] ?? 0}
                        y={SCALE.pan.weightY}
                        num={w.num}
                        label={w.label}
                        color={w.color}
                        dashed={w.dashed}
                        size="scale"
                      />
                    ))}
                  </g>
                </g>
              ))}
            </g>
          </svg>
        </div>
      </RaftStage>

      <div
        className={`grid ${problem.options.length === 4 ? 'grid-cols-2' : 'grid-cols-3'} justify-items-center gap-3 sm:gap-4 w-full max-w-md mt-4 sm:mt-5`}
      >
        {problem.options.map((opt, idx) => {
          const isEliminated = eliminatedIndices.includes(idx);
          const slotSize =
            'flex items-center justify-center rounded-2xl sm:rounded-3xl border-2 font-black text-xl sm:text-2xl w-[88px] sm:w-[104px] lg:w-[120px] h-[72px] sm:h-[88px] lg:h-[96px] box-border shrink-0';
          if (isEliminated) {
            return (
              <div
                key={idx}
                className={`${slotSize} border-dashed border-slate-200 bg-slate-100/50`}
                aria-hidden
              />
            );
          }
          const { mark, className, ...markProps } = marks.buttonProps(
            opt,
            'bg-gradient-to-br from-white to-blue-50 border-blue-300 text-blue-800 hover:border-blue-500 hover:from-blue-50 hover:to-blue-100 hover:scale-105 active:scale-95 shadow-md',
            'bg-white border-blue-300',
          );
          return (
            <button
              key={idx}
              {...markProps}
              onClick={() => handleChoice(opt)}
              className={`${slotSize} transition-all duration-200 ${className}`}
            >
              {opt}
              <AnswerMarkIcon mark={mark} />
            </button>
          );
        })}
      </div>

      {paidHints.length > 0 && (
        <div className="mt-4 w-full max-w-md flex justify-center">
          <PaidHintButtons hints={paidHints} stars={stars} onHintClick={handlePaidHint} />
        </div>
      )}
    </div>
  );
};
