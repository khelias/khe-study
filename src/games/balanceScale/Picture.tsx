import React from 'react';
import { PictureFrame, type MenuPictureProps } from '../PictureFrame';

export const BalanceScalePicture: React.FC<MenuPictureProps> = ({ className }) => (
  <PictureFrame className={className}>
    <path
      d="M40 18v30M28 52h24M16 22l48-6"
      className="fill-none stroke-ink-2"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M10 34h14l-7-12zM56 30h14l-7-12z"
      className="fill-none stroke-ink-2"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <g className="fill-ink">
      <rect x="11" y="27" width="5" height="6" rx="1" />
      <rect x="18" y="27" width="5" height="6" rx="1" />
      <rect x="60" y="23" width="6" height="6" rx="1" />
    </g>
  </PictureFrame>
);
