/**
 * ResourceBadge Component
 *
 * Individual badge for displaying a single resource (Stars or Hearts)
 * Used for side-by-side display in headers
 */

import React from 'react';
import { Heart, Star } from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';

interface ResourceBadgeProps {
  type: 'stars' | 'hearts';
  value: number;
  maxValue?: number; // For hearts
  compact?: boolean;
  onClick?: () => void; // Optional click handler to open shop
}

export const ResourceBadge: React.FC<ResourceBadgeProps> = ({
  type,
  value,
  maxValue = 5,
  compact = false,
  onClick,
}) => {
  const t = useTranslation();
  const textSize = compact ? 'text-sm' : 'text-base';
  const className = onClick
    ? 'fam-btn-quiet shrink-0 cursor-pointer text-ink'
    : 'flex shrink-0 items-center gap-1.5 px-2 text-ink';
  const handleKeyDown = onClick
    ? (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }
    : undefined;

  const isStars = type === 'stars';
  const Icon = isStars ? Star : Heart;
  const shown = isStars ? String(value) : `${value}/${maxValue}`;

  return (
    <div
      onClick={onClick}
      className={className}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={handleKeyDown}
      aria-label={
        onClick
          ? (isStars ? t.shop.starsBadge : t.shop.heartsBadge).replace('{value}', shown)
          : undefined
      }
    >
      <Icon
        size={16}
        aria-hidden
        className={`shrink-0 ${isStars ? 'fill-star text-star' : 'fill-heart text-heart'}`}
      />
      <span className={`${textSize} whitespace-nowrap font-semibold tabular-nums`}>{shown}</span>
    </div>
  );
};
