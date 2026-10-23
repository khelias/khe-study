import React from 'react';
import { PictureFrame, type MenuPictureProps } from '../PictureFrame';

export const MemoryMathPicture: React.FC<MenuPictureProps> = ({ className }) => (
  <PictureFrame className={className}>
    <g className="fill-ink-2">
      <rect x="12" y="8" width="17" height="22" rx="3" />
      <rect x="50" y="8" width="17" height="22" rx="3" />
      <rect x="12" y="34" width="17" height="22" rx="3" />
      <rect x="31" y="34" width="17" height="22" rx="3" />
      <rect x="50" y="34" width="17" height="22" rx="3" />
    </g>
    <rect
      x="31"
      y="8"
      width="17"
      height="22"
      rx="3"
      className="fill-surface stroke-ink-2"
      strokeWidth="1.5"
    />
    <text
      x="39.5"
      y="22"
      textAnchor="middle"
      className="fill-ink font-serif"
      fontSize="8"
      fontWeight="700"
    >
      3+4
    </text>
  </PictureFrame>
);
