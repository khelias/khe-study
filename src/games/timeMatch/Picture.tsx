import React from 'react';
import { PictureFrame, type MenuPictureProps } from '../PictureFrame';

export const TimeMatchPicture: React.FC<MenuPictureProps> = ({ className }) => (
  <PictureFrame className={className}>
    <circle cx="40" cy="32" r="23" className="fill-surface stroke-ink-2" strokeWidth="2.5" />
    <path
      d="M40 12v4M60 32h-4M40 52v-4M20 32h4"
      className="fill-none stroke-ink-2"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M40 32V16M40 32l-9-5"
      className="fill-none stroke-ink"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <circle cx="40" cy="32" r="2.5" className="fill-ink" />
  </PictureFrame>
);
