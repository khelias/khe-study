/**
 * Smart Games Logo Component
 *
 * Logo for the Smart Games educational game platform
 * Rocket mark in ink
 */

import React from 'react';

interface SmartGamesLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export const SmartGamesLogo: React.FC<SmartGamesLogoProps> = ({
  size: _size,
  className = '',
  showText = false,
}) => {
  return (
    <div className={`flex items-center justify-center gap-1.5 ${className}`}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-4 h-4 sm:w-5 sm:h-5 text-ink"
      >
        <path
          d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {showText && (
        <span className="text-sm sm:text-base font-semibold text-ink hidden sm:inline">
          Smart Games
        </span>
      )}
    </div>
  );
};
