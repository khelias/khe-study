import React, { useEffect, useState } from 'react';

export type OwlPose = 'idle' | 'look' | 'point' | 'talk' | 'cheer' | 'sleep';

const BLINK_EVERY_MS = 4200;
const BLINK_MS = 160;

/**
 * The night owl on the treeline (the board's `Owl.dc.html`): a few poses, a
 * blink now and then, and a speech bubble. Tapping it repeats its last line.
 * It lives in this game's play area only (the plan's Decisions).
 */
export const Owl: React.FC<{
  pose: OwlPose;
  line: string | null;
  label: string;
  reducedMotion: boolean;
  onTap: () => void;
  className?: string;
  style?: React.CSSProperties;
}> = ({ pose, line, label, reducedMotion, onTap, className = '', style }) => {
  const [blink, setBlink] = useState(false);
  const canBlink = !reducedMotion && (pose === 'idle' || pose === 'look');

  useEffect(() => {
    if (!canBlink) return;
    let off: ReturnType<typeof setTimeout> | undefined;
    const every = setInterval(() => {
      setBlink(true);
      off = setTimeout(() => setBlink(false), BLINK_MS);
    }, BLINK_EVERY_MS);
    return () => {
      clearInterval(every);
      clearTimeout(off);
      setBlink(false);
    };
  }, [canBlink]);

  const closed = pose === 'sleep' || blink;
  const look = pose === 'look' || pose === 'point' ? 3.5 : 0;
  const tilt = pose === 'look' ? 12 : pose === 'point' ? 8 : pose === 'sleep' ? -8 : 0;
  const talking = pose === 'talk' || pose === 'cheer';
  const pupilY = pose === 'cheer' ? 41 : 43;

  return (
    <div className={`sky-owl absolute ${className}`} style={style} data-pose={pose}>
      <button
        type="button"
        className="block size-[92px] lg:size-[120px]"
        aria-label={label}
        onClick={onTap}
      >
        <svg viewBox="0 0 120 120" className="h-full w-full overflow-visible" aria-hidden>
          <path d="M14 112 C40 106 80 106 108 110" className="sky-owl-branch" />
          {pose === 'cheer' && (
            <>
              <path d="M36 66 C18 54 10 34 14 22 C24 34 32 46 42 54 Z" className="sky-owl-wing" />
              <path
                d="M84 66 C102 54 110 34 106 22 C96 34 88 46 78 54 Z"
                className="sky-owl-wing"
              />
            </>
          )}
          {pose === 'point' && (
            <path d="M84 64 C100 56 112 44 118 30 C104 36 92 44 80 52 Z" className="sky-owl-wing" />
          )}
          <ellipse cx="60" cy="76" rx="30" ry="32" className="sky-owl-body" />
          <ellipse cx="60" cy="86" rx="19" ry="20" className="sky-owl-belly" />
          <path
            d="M50 80 q4 3 8 0 M62 80 q4 3 8 0 M54 90 q4 3 8 0 M60 98 q4 3 8 0"
            className="sky-owl-feathers"
          />
          {pose !== 'cheer' && (
            <path d="M32 66 C26 80 28 96 38 104 C40 90 40 78 38 68 Z" className="sky-owl-wing" />
          )}
          {pose !== 'cheer' && pose !== 'point' && (
            <path d="M88 66 C94 80 92 96 82 104 C80 90 80 78 82 68 Z" className="sky-owl-wing" />
          )}
          <g transform={`rotate(${tilt} 60 44)`}>
            <path d="M36 30 L32 12 L46 24 Z" className="sky-owl-wing" />
            <path d="M84 30 L88 12 L74 24 Z" className="sky-owl-wing" />
            <ellipse cx="60" cy="42" rx="28" ry="24" className="sky-owl-body" />
            <ellipse cx="48" cy="42" rx="13" ry="13" className="sky-owl-face" />
            <ellipse cx="72" cy="42" rx="13" ry="13" className="sky-owl-face" />
            {closed ? (
              <path d="M41 43 q7 5 14 0 M65 43 q7 5 14 0" className="sky-owl-lid" />
            ) : (
              <g data-eyes="open">
                <circle cx="48" cy="42" r="8.5" className="sky-owl-eye" />
                <circle cx="72" cy="42" r="8.5" className="sky-owl-eye" />
                <circle cx={48 + look} cy={pupilY} r="4.4" className="sky-owl-pupil" />
                <circle cx={72 + look} cy={pupilY} r="4.4" className="sky-owl-pupil" />
                <circle cx={46 + look} cy="39.5" r="1.4" className="sky-owl-glint" />
                <circle cx={70 + look} cy="39.5" r="1.4" className="sky-owl-glint" />
              </g>
            )}
            {talking ? (
              <>
                <path d="M55 52 L65 52 L60 58 Z" className="sky-owl-beak" />
                <path d="M56 61 L64 61 L60 65 Z" className="sky-owl-beak-low" />
              </>
            ) : (
              <path d="M55 52 L65 52 L60 60 Z" className="sky-owl-beak" />
            )}
          </g>
          <path d="M50 107 l-3 5 M54 107 l0 6 M66 107 l0 6 M70 107 l3 5" className="sky-owl-feet" />
          {pose === 'sleep' && (
            <>
              <text x="92" y="22" fontSize="13" className="sky-owl-z">
                z
              </text>
              <text x="102" y="10" fontSize="10" className="sky-owl-z-far">
                z
              </text>
            </>
          )}
        </svg>
      </button>
      {line && (
        <p
          role="status"
          className="sky-bubble absolute bottom-[52px] left-[92px] w-max max-w-[min(220px,calc(100vw-112px))] px-3.5 py-2.5 text-[15px] leading-snug lg:bottom-[76px] lg:left-[122px] lg:max-w-[260px] lg:text-base"
        >
          {line}
        </p>
      )}
    </div>
  );
};
