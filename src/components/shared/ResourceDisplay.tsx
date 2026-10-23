/**
 * ResourceDisplay Component
 *
 * Shared component for displaying game resources (Hearts, Stars, Score)
 * Used in both GameHeader and MenuScreen for consistency
 */

import React from 'react';
import { Heart, Star, Trophy } from 'lucide-react';

interface ResourceDisplayProps {
  hearts: number;
  stars: number;
  score?: number; // Optional - can be hidden to reduce clutter
  showScore?: boolean; // Control score visibility
  compact?: boolean; // Compact mode for smaller screens
  maxHearts?: number;
  heartsAsNumber?: boolean; // Show hearts as "3/5" instead of icons on mobile
}

export const ResourceDisplay: React.FC<ResourceDisplayProps> = ({
  hearts,
  stars,
  score = 0,
  showScore = true,
  compact = false,
  maxHearts = 5,
  heartsAsNumber = false,
}) => {
  const heartSize = compact ? 'w-3.5 h-3.5' : 'w-4 h-4 sm:w-5 sm:h-5';
  const iconSize = compact ? 12 : 14;
  const iconClass = compact ? 'w-3 h-3' : 'w-3.5 h-3.5 sm:w-4 sm:h-4';
  const valueClass = `${compact ? 'text-xs' : 'text-xs sm:text-sm'} font-semibold tabular-nums text-ink`;
  const gap = compact ? 'gap-2' : 'gap-3 sm:gap-4';

  return (
    <div className={`flex items-center ${gap}`}>
      {heartsAsNumber ? (
        <div className="flex items-center gap-1">
          <Heart size={iconSize} aria-hidden className={`fill-heart text-heart ${iconClass}`} />
          <span className={valueClass}>
            {hearts}/{maxHearts}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-0.5">
          {Array.from({ length: maxHearts }, (_, i) => (
            <Heart
              key={i}
              aria-hidden
              className={`${heartSize} transition-colors duration-300 ${
                i < hearts ? 'fill-heart text-heart' : 'text-rule-strong'
              }`}
            />
          ))}
        </div>
      )}

      <div className="flex items-center gap-1">
        <Star size={iconSize} aria-hidden className={`fill-star text-star ${iconClass}`} />
        <span className={valueClass}>{stars}</span>
      </div>

      {showScore && (
        <div className="hidden items-center gap-1 sm:flex">
          <Trophy size={iconSize} aria-hidden className={`text-muted ${iconClass}`} />
          <span className={valueClass}>{score}</span>
        </div>
      )}
    </div>
  );
};
