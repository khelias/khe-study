/**
 * ResourceBadge Component
 *
 * The star balance as a badge in the game bar; a click opens the shop.
 */

import React from 'react';
import { Star } from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';

interface ResourceBadgeProps {
  value: number;
  compact?: boolean;
  onClick?: () => void; // Optional click handler to open shop
}

export const ResourceBadge: React.FC<ResourceBadgeProps> = ({
  value,
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

  const shown = String(value);

  return (
    <div
      data-star-counter
      onClick={onClick}
      className={className}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={handleKeyDown}
      aria-label={onClick ? t.shop.starsBadge.replace('{value}', shown) : undefined}
    >
      <Star size={16} aria-hidden className="shrink-0 fill-star text-star" />
      <span className={`${textSize} whitespace-nowrap font-semibold tabular-nums`}>{shown}</span>
    </div>
  );
};
