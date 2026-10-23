import React from 'react';

export interface MenuPictureProps {
  className?: string;
}

export type MenuPicture = React.FC<MenuPictureProps>;

/**
 * The menu picture's canvas: 80 by 64, colours only through token utilities, so it follows the
 * theme. Decorative: the menu button's accessible name carries the game.
 */
export const PictureFrame: React.FC<MenuPictureProps & { children: React.ReactNode }> = ({
  className,
  children,
}) => (
  <svg viewBox="0 0 80 64" aria-hidden="true" focusable="false" className={className}>
    {children}
  </svg>
);
