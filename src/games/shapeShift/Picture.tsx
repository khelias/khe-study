import React from 'react';
import { PictureFrame, type MenuPictureProps } from '../PictureFrame';

export const ShapeShiftPicture: React.FC<MenuPictureProps> = ({ className }) => (
  <PictureFrame className={className}>
    <path
      d="M10 30L24 16L38 30ZM10 30H38V50H10Z"
      className="fill-none stroke-ink-2"
      strokeWidth="1.5"
      strokeLinejoin="round"
      strokeDasharray="3 2"
    />
    <path d="M44 28L58 14L72 28Z" className="fill-ink-2" />
    <rect x="44" y="32" width="28" height="20" className="fill-ink" />
  </PictureFrame>
);
