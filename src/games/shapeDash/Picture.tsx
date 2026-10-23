import React from 'react';
import { PictureFrame, type MenuPictureProps } from '../PictureFrame';

export const ShapeDashPicture: React.FC<MenuPictureProps> = ({ className }) => (
  <PictureFrame className={className}>
    <path
      d="M14 46Q30 6 50 30"
      className="fill-none stroke-rule-strong"
      strokeWidth="1.5"
      strokeDasharray="3 2"
    />
    <rect x="25" y="14" width="10" height="10" rx="1.5" className="fill-ink" />
    <g className="fill-ink-2">
      <path d="M34 48l5-9 5 9z" />
      <path d="M54 48l5-9 5 9z" />
    </g>
    <path d="M6 48h68" className="fill-none stroke-ink-2" strokeWidth="2" strokeLinecap="round" />
  </PictureFrame>
);
