import React from 'react';
import { PictureFrame, type MenuPictureProps } from '../PictureFrame';

export const RoboPathPicture: React.FC<MenuPictureProps> = ({ className }) => (
  <PictureFrame className={className}>
    <path
      d="M12 10h56v42H12zM26 10v42M40 10v42M54 10v42M12 24h56M12 38h56"
      className="fill-none stroke-rule-strong"
      strokeWidth="1"
    />
    <rect x="13.5" y="39.5" width="11" height="11" rx="2" className="fill-ink-2" />
    <g className="fill-surface">
      <circle cx="17" cy="44" r="1.3" />
      <circle cx="21" cy="44" r="1.3" />
    </g>
    <path
      d="M19 37V17h30M46 14l3.5 3-3.5 3"
      className="fill-none stroke-ink"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M58 24V11" className="fill-none stroke-ink" strokeWidth="1.5" />
    <path d="M58 11l7 3-7 3z" className="fill-ok" />
  </PictureFrame>
);
