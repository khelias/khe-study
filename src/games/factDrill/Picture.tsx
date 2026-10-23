import React from 'react';
import { PictureFrame, type MenuPictureProps } from '../PictureFrame';

export const FactDrillPicture: React.FC<MenuPictureProps> = ({ className }) => (
  <PictureFrame className={className}>
    <g className="fill-ink">
      {[14, 25, 36].flatMap((y) =>
        [22, 34, 46, 58].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="3.5" />),
      )}
    </g>
    <rect x="16" y="47" width="48" height="4" rx="2" className="fill-rule-strong" />
    <rect x="16" y="47" width="30" height="4" rx="2" className="fill-ink-2" />
  </PictureFrame>
);
