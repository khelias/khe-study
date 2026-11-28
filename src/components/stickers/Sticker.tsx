/**
 * The album's stickers: the path set drawn as small
 * animals, and an achievement's badge in a star rim. Drawn SVG, so no
 * picture file reaches the edge fallback; their colours are content
 * (khe-design-lint.json).
 */

import React from 'react';
import type { PathStickerId } from '../../meta/stickers';

const EYE = '#111315';

interface Drawing {
  ground: string;
  art: React.ReactNode;
}

const DRAWINGS: Record<PathStickerId, Drawing> = {
  fox: {
    ground: '#fde3cf',
    art: (
      <>
        <path d="M12 14l12 12-12 6zM52 14L40 26l12 6z" fill="#c4612a" />
        <path
          d="M12 30c4-8 12-12 20-12s16 4 20 12c-2 12-10 20-20 22-10-2-18-10-20-22z"
          fill="#d9773a"
        />
        <path d="M20 38c4 6 8 10 12 12 4-2 8-6 12-12-4 2-8 3-12 3s-8-1-12-3z" fill="#ffffff" />
        <circle cx="25" cy="33" r="2.2" fill={EYE} />
        <circle cx="39" cy="33" r="2.2" fill={EYE} />
        <circle cx="32" cy="45" r="2.6" fill={EYE} />
      </>
    ),
  },
  hedgehog: {
    ground: '#fbeedd',
    art: (
      <>
        <path d="M8 44c0-16 11-26 26-26s22 10 22 26z" fill="#7a5230" />
        <path
          d="M14 30l-6-6 9 1zM22 22l-3-9 7 6zM33 18l1-10 4 9zM44 21l5-8 0 10zM52 30l8-4-5 8z"
          fill="#7a5230"
        />
        <ellipse cx="48" cy="42" rx="12" ry="9" fill="#e9c9a1" />
        <circle cx="50" cy="39" r="2" fill={EYE} />
        <circle cx="59" cy="43" r="2.4" fill={EYE} />
      </>
    ),
  },
  owl: {
    ground: '#dcebf3',
    art: (
      <>
        <path d="M16 20l6 6M48 20l-6 6" stroke="#4d5f6e" strokeWidth="4" strokeLinecap="round" />
        <path d="M14 34c0-10 8-16 18-16s18 6 18 16-8 20-18 20-18-10-18-20z" fill="#6f8798" />
        <circle cx="25" cy="32" r="7" fill="#ffffff" />
        <circle cx="39" cy="32" r="7" fill="#ffffff" />
        <circle cx="25" cy="32" r="3" fill={EYE} />
        <circle cx="39" cy="32" r="3" fill={EYE} />
        <path d="M29 40l3 4 3-4z" fill="#985600" />
      </>
    ),
  },
  bear: {
    ground: '#efe3d6',
    art: (
      <>
        <circle cx="18" cy="20" r="7" fill="#8a5a36" />
        <circle cx="46" cy="20" r="7" fill="#8a5a36" />
        <circle cx="32" cy="35" r="19" fill="#8a5a36" />
        <ellipse cx="32" cy="42" rx="9" ry="7" fill="#d8b48e" />
        <circle cx="25" cy="31" r="2.2" fill={EYE} />
        <circle cx="39" cy="31" r="2.2" fill={EYE} />
        <ellipse cx="32" cy="39" rx="3" ry="2.2" fill={EYE} />
      </>
    ),
  },
  hare: {
    ground: '#eef0e6',
    art: (
      <>
        <ellipse cx="24" cy="16" rx="5" ry="13" fill="#b7b2a6" />
        <ellipse cx="40" cy="16" rx="5" ry="13" fill="#b7b2a6" />
        <ellipse cx="24" cy="17" rx="2.2" ry="9" fill="#f0c8c8" />
        <ellipse cx="40" cy="17" rx="2.2" ry="9" fill="#f0c8c8" />
        <circle cx="32" cy="38" r="17" fill="#cfcabe" />
        <circle cx="26" cy="35" r="2.2" fill={EYE} />
        <circle cx="38" cy="35" r="2.2" fill={EYE} />
        <path d="M30 41h4l-2 2.4z" fill="#c2566a" />
      </>
    ),
  },
  fish: {
    ground: '#d6ecef',
    art: (
      <>
        <path d="M10 32c6-12 18-16 30-12l14-8-4 20 4 20-14-8c-12 4-24 0-30-12z" fill="#2f8fa0" />
        <path d="M30 22c4 6 4 14 0 20" fill="none" stroke="#1f6b78" strokeWidth="2.5" />
        <circle cx="20" cy="30" r="2.6" fill={EYE} />
      </>
    ),
  },
  frog: {
    ground: '#e3efd5',
    art: (
      <>
        <circle cx="22" cy="22" r="8" fill="#5f9a3c" />
        <circle cx="42" cy="22" r="8" fill="#5f9a3c" />
        <ellipse cx="32" cy="38" rx="20" ry="15" fill="#5f9a3c" />
        <circle cx="22" cy="21" r="4" fill="#ffffff" />
        <circle cx="42" cy="21" r="4" fill="#ffffff" />
        <circle cx="22" cy="21" r="2" fill={EYE} />
        <circle cx="42" cy="21" r="2" fill={EYE} />
        <path d="M22 41c6 5 14 5 20 0" fill="none" stroke="#2f5a1c" strokeWidth="2.5" />
      </>
    ),
  },
  ladybird: {
    ground: '#f8e0dc',
    art: (
      <>
        <circle cx="32" cy="18" r="8" fill={EYE} />
        <circle cx="32" cy="37" r="18" fill="#c8312a" />
        <path d="M32 19v36" stroke={EYE} strokeWidth="2.5" />
        <circle cx="24" cy="31" r="3.4" fill={EYE} />
        <circle cx="40" cy="31" r="3.4" fill={EYE} />
        <circle cx="23" cy="44" r="3" fill={EYE} />
        <circle cx="41" cy="44" r="3" fill={EYE} />
      </>
    ),
  },
  squirrel: {
    ground: '#f6e7cf',
    art: (
      <>
        <path d="M44 54c12-4 16-18 10-30-4-8-14-8-16 0 6 2 10 8 8 16z" fill="#b5652e" />
        <circle cx="26" cy="36" r="14" fill="#c97a3e" />
        <path d="M18 24l2-9 6 7zM30 22l4-8 2 9z" fill="#c97a3e" />
        <ellipse cx="22" cy="41" rx="6" ry="5" fill="#f1d3b0" />
        <circle cx="22" cy="33" r="2.2" fill={EYE} />
        <circle cx="18" cy="40" r="2" fill={EYE} />
      </>
    ),
  },
};

interface StickerProps {
  /** A path sticker's id, or null for an empty place. */
  id: string | null;
  size?: number;
  /** A small tilt, as if stuck on by hand. */
  tilt?: number;
  className?: string;
}

export const Sticker: React.FC<StickerProps> = ({ id, size = 92, tilt = 0, className = '' }) => {
  const drawing = id ? DRAWINGS[id as PathStickerId] : undefined;
  if (!drawing) {
    return (
      <span
        aria-hidden
        className={`inline-block shrink-0 rounded-full border-2 border-dashed border-rule-strong ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center rounded-full border-[3px] border-white ring-1 ring-rule ${className}`}
      style={{ width: size, height: size, background: drawing.ground, rotate: `${tilt}deg` }}
    >
      <svg viewBox="0 0 64 64" width={size * 0.7} height={size * 0.7}>
        {drawing.art}
      </svg>
    </span>
  );
};

/** An achievement's sticker: its badge picture in a star rim. */
export const AchievementSticker: React.FC<{ icon: string; size?: number }> = ({
  icon,
  size = 92,
}) => (
  <span
    aria-hidden
    className="inline-flex shrink-0 items-center justify-center rounded-full border-4 border-star bg-[color-mix(in_srgb,var(--star)_14%,var(--surface))]"
    style={{ width: size, height: size, fontSize: size * 0.42 }}
  >
    {icon}
  </span>
);
