/**
 * KHE Icon Component
 *
 * Personal logo for Kaido Henrik Elias
 * Professional monogram-style logo
 */

import React from 'react';

interface KHEIconProps {
  size?: number;
  className?: string;
}

export const KHEIcon: React.FC<KHEIconProps> = ({ size: _size, className = '' }) => {
  return (
    <div className={`flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 ${className}`}>
      <span className="text-[9px] sm:text-[11px] font-semibold leading-none tracking-tight text-ink">
        KHE
      </span>
    </div>
  );
};
