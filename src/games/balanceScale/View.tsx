/**
 * BalanceScaleView Component
 *
 * Game view for balance scale problems. Flat pans, weights on top, red left / blue right (selection).
 */

import React, { useCallback, useState } from 'react';
import { playSound } from '../../engine/audio';
import type { BalanceScaleProblem } from '../../types/game';
import { SvgWeight } from '../../components/shared/SvgWeight';
import { GAME_CONFIG } from '../data';
import { PaidHintButtons } from '../../components/shared';

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
    weightX: 32,
  },
  beam: { x: 50, width: 300, height: 12 },
  pole: { x: 196, y: 78, width: 8, height: 152 },
  base: { cx: 200, cy: 288, rx: 78, ry: 9 },
  panCenterX: { left: 60, right: 340 },
} as const;

interface BalanceScaleViewProps {
  problem: BalanceScaleProblem;
  onAnswer: (isCorrect: boolean) => void;
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
  const baseType = gameType?.replace('_adv', '') ?? 'balance_scale';
  const paidHints = GAME_CONFIG[baseType]?.paidHints ?? [];
  const [disabled, setDisabled] = useState<number[]>([]);
  const [eliminatedIndices, setEliminatedIndices] = useState<number[]>([]);
  const [tilt, setTilt] = useState<number>(-10);

  // Reset state when problem changes (render-time prop comparison).
  const [lastSyncedUid, setLastSyncedUid] = useState<string>(problemUid);
  if (lastSyncedUid !== problemUid) {
    setLastSyncedUid(problemUid);
    setDisabled([]);
    setEliminatedIndices([]);
    setTilt(-10);
  }

  const handlePaidHint = useCallback(
    (hintId: string) => {
      if (hintId !== 'eliminate' || !spendStars) return;
      const wrongIndices = problem.options
        .map((opt, idx) => (opt !== problem.answer ? idx : -1))
        .filter((i) => i >= 0 && !eliminatedIndices.includes(i));
      if (wrongIndices.length === 0) return;
      if (!spendStars(1)) return;
      const pick = wrongIndices[Math.floor(Math.random() * wrongIndices.length)] as number;
      setEliminatedIndices((prev) => [...prev, pick]);
    },
    [problem.options, problem.answer, eliminatedIndices, spendStars],
  );

  const handleChoice = (weight: number): void => {
    playSound('click', soundEnabled);
    const leftSum = problem.display.left.reduce((a, b) => a + b, 0);
    const rightKnown = problem.display.right.reduce((a, b) => a + b, 0);
    const totalRight = rightKnown + weight;

    let newTilt = 0;
    if (leftSum > totalRight) newTilt = -20;
    else if (totalRight > leftSum) newTilt = 20;

    setTilt(newTilt);

    setTimeout(() => {
      if (leftSum === totalRight) {
        onAnswer(true);
      } else {
        setDisabled((prev) => [...prev, weight]);
        setTimeout(() => setTilt(newTilt > 0 ? -15 : newTilt), 300);
        onAnswer(false);
      }
    }, 1000);
  };

  const { left, right } = problem.display;
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
      weights: [
        { num: left[0] ?? 0, color: 'red' },
        { num: left[1] ?? 0, color: 'red' },
      ],
    },
    {
      translateX: SCALE.panCenterX.right,
      fill: 'url(#panBlue)',
      stroke: '#2563eb',
      weights: [
        { num: right[0] ?? 0, color: 'blue' },
        { label: '?', color: 'neutral', dashed: true },
      ],
    },
  ];

  return (
    <div className="w-full flex flex-col items-center px-4 sm:px-6 max-w-2xl mx-auto pt-4 sm:pt-6 animate-in fade-in duration-300">
      <div className="w-full max-w-md rounded-2xl sm:rounded-3xl bg-gradient-to-b from-blue-50 via-white to-slate-50 border-2 border-blue-200 shadow-lg p-4 sm:p-6">
        <div className="relative w-full max-w-lg mx-auto flex justify-center overflow-visible py-2">
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${SCALE.viewBox.w} ${SCALE.viewBox.h}`}
            preserveAspectRatio="xMidYMid meet"
            className="overflow-visible"
            style={{ minHeight: '280px' }}
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
                        x={j === 0 ? -SCALE.pan.weightX : SCALE.pan.weightX}
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
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full max-w-md mt-4 sm:mt-5">
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
          const isDisabled = disabled.includes(opt);
          return (
            <button
              key={idx}
              disabled={isDisabled}
              onClick={() => handleChoice(opt)}
              className={`
                ${slotSize} transition-all duration-200
                ${
                  isDisabled
                    ? 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed opacity-60'
                    : 'bg-gradient-to-br from-white to-blue-50 border-blue-300 text-blue-800 hover:border-blue-500 hover:from-blue-50 hover:to-blue-100 hover:scale-105 active:scale-95 shadow-md'
                }
              `}
            >
              {opt}
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
