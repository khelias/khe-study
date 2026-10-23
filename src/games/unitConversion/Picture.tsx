import React from 'react';
import { PictureFrame, type MenuPictureProps } from '../PictureFrame';

export const UnitConversionPicture: React.FC<MenuPictureProps> = ({ className }) => (
  <PictureFrame className={className}>
    <rect
      x="8"
      y="18"
      width="64"
      height="18"
      rx="2"
      className="fill-surface stroke-ink-2"
      strokeWidth="1.5"
    />
    <path
      d="M14 18v9M22 18v5M30 18v9M38 18v5M46 18v9M54 18v5M62 18v9"
      className="fill-none stroke-ink-2"
      strokeWidth="1.25"
    />
    <text
      x="40"
      y="52"
      textAnchor="middle"
      className="fill-ink font-serif"
      fontSize="12"
      fontWeight="700"
    >
      cm
    </text>
  </PictureFrame>
);
