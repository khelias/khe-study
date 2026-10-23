import React from 'react';
import { PictureFrame, type MenuPictureProps } from '../PictureFrame';

export const LetterMatchPicture: React.FC<MenuPictureProps> = ({ className }) => (
  <PictureFrame className={className}>
    <g className="fill-ink font-serif" fontWeight="700">
      <text x="12" y="42" fontSize="26">
        A
      </text>
      <text x="39" y="40" fontSize="20">
        a
      </text>
    </g>
    <circle cx="45" cy="34" r="11" className="fill-none stroke-ink-2" strokeWidth="2.5" />
    <path d="M53 42l9 9" className="fill-none stroke-ink-2" strokeWidth="3" strokeLinecap="round" />
  </PictureFrame>
);
