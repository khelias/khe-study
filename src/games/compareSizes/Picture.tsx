import React from 'react';
import { PictureFrame, type MenuPictureProps } from '../PictureFrame';

export const CompareSizesPicture: React.FC<MenuPictureProps> = ({ className }) => (
  <PictureFrame className={className}>
    <g className="fill-ink font-serif" fontSize="15" fontWeight="700" textAnchor="middle">
      <text x="18" y="38">
        12
      </text>
      <text x="62" y="38">
        21
      </text>
    </g>
    <rect
      x="31"
      y="21"
      width="18"
      height="20"
      rx="3"
      className="fill-none stroke-ink-2"
      strokeWidth="1.5"
      strokeDasharray="3 2"
    />
    <text
      x="40"
      y="35.5"
      textAnchor="middle"
      className="fill-muted font-serif"
      fontSize="11"
      fontWeight="700"
    >
      ?
    </text>
  </PictureFrame>
);
