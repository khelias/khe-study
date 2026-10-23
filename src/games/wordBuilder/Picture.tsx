import React from 'react';
import { PictureFrame, type MenuPictureProps } from '../PictureFrame';

export const WordBuilderPicture: React.FC<MenuPictureProps> = ({ className }) => (
  <PictureFrame className={className}>
    {['K', 'A', 'S'].map((letter, index) => (
      <g key={letter}>
        <rect
          x={8 + index * 17}
          y="22"
          width="14"
          height="18"
          rx="3"
          className="fill-surface stroke-ink-2"
          strokeWidth="1.5"
        />
        <text
          x={15 + index * 17}
          y="36"
          textAnchor="middle"
          className="fill-ink font-serif"
          fontSize="12"
          fontWeight="700"
        >
          {letter}
        </text>
      </g>
    ))}
    <rect
      x="59"
      y="22"
      width="14"
      height="18"
      rx="3"
      className="fill-none stroke-muted"
      strokeWidth="1.5"
      strokeDasharray="3 2"
    />
    <path d="M8 48h65" className="fill-none stroke-rule-strong" strokeWidth="1.5" />
  </PictureFrame>
);
