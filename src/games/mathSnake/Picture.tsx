import React from 'react';
import { PictureFrame, type MenuPictureProps } from '../PictureFrame';

export const MathSnakePicture: React.FC<MenuPictureProps> = ({ className }) => (
  <PictureFrame className={className}>
    <g className="fill-rule-strong">
      {[
        [16, 16],
        [48, 16],
        [64, 16],
        [16, 32],
        [16, 48],
        [32, 48],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="1.5" />
      ))}
    </g>
    <path
      d="M48 48H64V32H32V16"
      className="fill-none stroke-ink-2"
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="32" cy="16" r="5" className="fill-ok" />
    <text x="44" y="21" className="fill-ink font-serif" fontSize="12" fontWeight="700">
      +7
    </text>
  </PictureFrame>
);
