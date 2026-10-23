import React from 'react';
import { PictureFrame, type MenuPictureProps } from '../PictureFrame';

export const BattlelearnPicture: React.FC<MenuPictureProps> = ({ className }) => (
  <PictureFrame className={className}>
    <path
      d="M14 12h52v40H14zM27 12v40M40 12v40M53 12v40M14 22h52M14 32h52M14 42h52"
      className="fill-none stroke-rule-strong"
      strokeWidth="1"
    />
    <rect x="28" y="23" width="24" height="8" rx="3" className="fill-ink-2" />
    <path
      d="M55 44l8 6M63 44l-8 6"
      className="fill-none stroke-bad"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </PictureFrame>
);
