import React from 'react';
import { PictureFrame, type MenuPictureProps } from '../PictureFrame';

export const PatternPicture: React.FC<MenuPictureProps> = ({ className }) => (
  <PictureFrame className={className}>
    <g className="fill-none stroke-ink-2" strokeWidth="1.5" strokeLinejoin="round">
      {[6, 24, 42, 60].map((x) => (
        <rect key={x} x={x} y="24" width="14" height="14" rx="2" />
      ))}
      <path d="M20 34h4M38 34h4M56 34h4" />
    </g>
    <g className="fill-ink-2">
      {[9, 17, 27, 35, 45, 53, 63, 71].map((x) => (
        <circle key={x} cx={x} cy="42" r="2" />
      ))}
    </g>
    <g className="fill-ink">
      <circle cx="13" cy="31" r="3.5" />
      <path d="M27 35h8l-4-7z" />
      <circle cx="49" cy="31" r="3.5" />
    </g>
    <text
      x="67"
      y="35.5"
      textAnchor="middle"
      className="fill-ink font-serif"
      fontSize="11"
      fontWeight="700"
    >
      ?
    </text>
  </PictureFrame>
);
