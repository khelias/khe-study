import React from 'react';
import { PictureFrame, type MenuPictureProps } from '../PictureFrame';

export const WordCascadePicture: React.FC<MenuPictureProps> = ({ className }) => (
  <PictureFrame className={className}>
    <g className="fill-ink font-serif" fontSize="17" fontWeight="700">
      <text x="14" y="22">
        S
      </text>
      <text x="34" y="36">
        Õ
      </text>
      <text x="54" y="28">
        N
      </text>
    </g>
    <path d="M8 52h64" className="fill-none stroke-bad" strokeWidth="2" strokeDasharray="4 3" />
  </PictureFrame>
);
