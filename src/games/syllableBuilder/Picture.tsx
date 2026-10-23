import React from 'react';
import { PictureFrame, type MenuPictureProps } from '../PictureFrame';

export const SyllableBuilderPicture: React.FC<MenuPictureProps> = ({ className }) => (
  <PictureFrame className={className}>
    <rect
      x="8"
      y="24"
      width="28"
      height="20"
      rx="4"
      className="fill-surface stroke-ink-2"
      strokeWidth="1.5"
    />
    <rect
      x="44"
      y="18"
      width="28"
      height="20"
      rx="4"
      className="fill-surface stroke-ink-2"
      strokeWidth="1.5"
    />
    <g className="fill-ink font-serif" fontSize="12" fontWeight="700" textAnchor="middle">
      <text x="22" y="38">
        KA
      </text>
      <text x="58" y="32">
        LA
      </text>
    </g>
  </PictureFrame>
);
