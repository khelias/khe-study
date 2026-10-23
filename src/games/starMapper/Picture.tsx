import React from 'react';
import { PictureFrame, type MenuPictureProps } from '../PictureFrame';

export const StarMapperPicture: React.FC<MenuPictureProps> = ({ className }) => (
  <PictureFrame className={className}>
    <g className="fill-rule-strong">
      <circle cx="8" cy="12" r="1" />
      <circle cx="36" cy="8" r="1" />
      <circle cx="72" cy="10" r="1" />
      <circle cx="28" cy="54" r="1" />
      <circle cx="70" cy="54" r="1" />
    </g>
    <path
      d="M14 40L26 22L40 30L54 16L66 34"
      className="fill-none stroke-ink-2"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="M66 34L50 48"
      className="fill-none stroke-rule-strong"
      strokeWidth="1.5"
      strokeDasharray="3 2"
    />
    <g className="fill-ink">
      {[
        [14, 40],
        [26, 22],
        [40, 30],
        [54, 16],
        [66, 34],
        [50, 48],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="2.5" />
      ))}
    </g>
  </PictureFrame>
);
