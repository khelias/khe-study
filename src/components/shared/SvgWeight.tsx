/**
 * SvgWeight Component
 *
 * Weight tokens for the balance scale. Flat, rounded blocks in the family's ink values.
 */

import React from 'react';

export interface SvgWeightProps {
  x: number;
  y: number;
  num?: number;
  label?: string;
  color: 'blue' | 'red' | 'neutral';
  dashed?: boolean;
  /** sm = compact, scale = on pans (slightly bigger), md = default */
  size?: 'sm' | 'scale' | 'md';
}

const SIZE = {
  sm: { w: 32, h: 32, rx: 8, font: 14, shadowRy: 4 },
  scale: { w: 38, h: 38, rx: 9, font: 16, shadowRy: 5 },
  md: { w: 40, h: 40, rx: 10, font: 20, shadowRy: 5 },
} as const;

// The two pans differ by value (ink, muted), not by a state colour: neither side is right or
// wrong. The unknown weight is the sunken, dashed one.
const PALETTE = {
  red: { body: 'fill-ink stroke-ink', text: 'fill-paper' },
  blue: { body: 'fill-muted stroke-muted', text: 'fill-paper' },
  neutral: { body: 'fill-sunken stroke-rule-strong', text: 'fill-muted' },
} as const;

export const SvgWeight: React.FC<SvgWeightProps> = ({
  x,
  y,
  num,
  label,
  color,
  dashed,
  size: sizeProp = 'md',
}) => {
  const displayText = label ?? String(num ?? '');
  const s = SIZE[sizeProp];
  const fontSize = label ? Math.round(s.font * 0.9) : s.font;

  const palette = PALETTE[color];

  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Shadow on tray, just below the weight base so it reads as cast on the pan */}
      <ellipse
        cx="0"
        cy={s.h / 2 + 4}
        rx={s.w * 0.5}
        ry={s.shadowRy + 2}
        className="fill-ink"
        opacity="0.12"
      />

      {/* Weight body: solid block, slight bevel for a weight look */}
      <rect
        x={-s.w / 2}
        y={-s.h / 2 - 2}
        width={s.w}
        height={s.h}
        rx={s.rx}
        ry={s.rx}
        className={palette.body}
        strokeWidth="2"
        strokeDasharray={dashed ? '6 4' : undefined}
      />
      {/* Bottom edge suggests thickness */}
      <rect
        x={-s.w / 2 + 2}
        y={s.h / 2 - 6}
        width={s.w - 4}
        height="4"
        rx="1"
        fill="rgba(0,0,0,0.15)"
      />
      {/* Top highlight */}
      <rect
        x={-s.w / 2 + 2}
        y={-s.h / 2}
        width={s.w - 4}
        height={Math.round(s.h * 0.26)}
        rx={s.rx - 2}
        fill="rgba(255,255,255,0.3)"
      />

      {/* Number or label, vertically centered in the weight */}
      <text
        x="0"
        y={-2}
        textAnchor="middle"
        fontSize={fontSize}
        fontWeight="800"
        fontFamily="system-ui, sans-serif"
        className={palette.text}
        dominantBaseline="middle"
      >
        {displayText}
      </text>
    </g>
  );
};
