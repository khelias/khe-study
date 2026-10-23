/**
 * Confetti Component
 *
 * Animated confetti effect for celebrations.
 */

import React, { useMemo } from 'react';

const PIECE_COLOR_CLASSES = ['bg-star', 'bg-ok', 'bg-heart', 'bg-ink'] as const;

interface ConfettiPieceProps {
  index: number;
  size: number;
  colorClass?: string;
}

/** A flat square or circle in a state colour, picked from the index so a burst mixes both. */
export const ConfettiPiece: React.FC<ConfettiPieceProps> = ({ index, size, colorClass }) => {
  const color = colorClass ?? PIECE_COLOR_CLASSES[index % PIECE_COLOR_CLASSES.length];
  const shape = Math.floor(index / PIECE_COLOR_CLASSES.length) % 2 === 0 ? '' : 'rounded-full';
  return (
    <span
      className={`block ${color} ${shape}`}
      style={{ width: `${size}px`, height: `${size}px` }}
      aria-hidden
    />
  );
};

export const Confetti: React.FC = () => {
  // Generate stable random positions for confetti using index-based seed (memoized to prevent recalculation)
  const confettiItems = useMemo(
    () =>
      Array.from({ length: 30 }).map((_, i) => {
        const seed = i * 12345;
        const left = ((seed * 9301 + 49297) % 233280) / 2332.8;
        const duration = 2 + ((seed * 48271) % 100) / 50;
        const delay = ((seed * 1103515245 + 12345) % 100) / 100;
        return { left, duration, delay };
      }),
    [],
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-[50] overflow-hidden">
      {confettiItems.map(({ left, duration, delay }, i) => (
        <div
          key={i}
          className="absolute animate-confetti"
          style={{
            left: `${left}%`,
            top: `-10%`,
            animationDuration: `${duration}s`,
            animationDelay: `${delay}s`,
          }}
        >
          <ConfettiPiece index={i} size={10} />
        </div>
      ))}
      <style>{`@keyframes confetti { 100% { transform: translateY(110vh) rotate(720deg); opacity: 0; } } .animate-confetti { animation: confetti 3s ease-out forwards; }`}</style>
    </div>
  );
};
