import React from 'react';
import { PictureFrame, type MenuPictureProps } from '../PictureFrame';

export const PicturePairsPicture: React.FC<MenuPictureProps> = ({ className }) => (
  <PictureFrame className={className}>
    <g className="fill-ink-2">
      <rect x="31" y="8" width="17" height="22" rx="3" />
      <rect x="50" y="8" width="17" height="22" rx="3" />
      <rect x="12" y="34" width="17" height="22" rx="3" />
      <rect x="31" y="34" width="17" height="22" rx="3" />
    </g>
    <g className="fill-surface stroke-ink-2" strokeWidth="1.5">
      <rect x="12" y="8" width="17" height="22" rx="3" />
      <rect x="50" y="34" width="17" height="22" rx="3" />
    </g>
    <g className="fill-ink">
      <path d="M15.5 24h10l-5-9z" />
      <path d="M53.5 50h10l-5-9z" />
    </g>
  </PictureFrame>
);
