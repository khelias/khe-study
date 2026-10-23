import React from 'react';
import { PictureFrame, type MenuPictureProps } from '../PictureFrame';

export const SentenceLogicPicture: React.FC<MenuPictureProps> = ({ className }) => (
  <PictureFrame className={className}>
    <g className="fill-rule-strong">
      <rect x="10" y="14" width="46" height="3" rx="1.5" />
      <rect x="10" y="24" width="12" height="3" rx="1.5" />
      <rect x="40" y="24" width="16" height="3" rx="1.5" />
      <rect x="10" y="34" width="30" height="3" rx="1.5" />
    </g>
    <path d="M25 27h12" className="fill-none stroke-ink" strokeWidth="1.5" strokeDasharray="2 2" />
    <circle cx="54" cy="40" r="8" className="fill-none stroke-ink-2" strokeWidth="2.5" />
    <path d="M60 46l8 8" className="fill-none stroke-ink-2" strokeWidth="3" strokeLinecap="round" />
  </PictureFrame>
);
