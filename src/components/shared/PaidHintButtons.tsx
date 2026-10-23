/**
 * PaidHintButtons - Global hint system for games with star-based hints
 *
 * Renders hint buttons configured in GameConfig.paidHints
 */

import React from 'react';
import { Star } from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';
import { Z_INDEX } from '../../utils/zIndex';
import type { PaidHint } from '../../types/game';
import { HintIcon } from '../gameIcons';

interface PaidHintButtonsProps {
  hints: PaidHint[];
  stars: number;
  onHintClick: (hintId: string) => void;
  disabled?: boolean;
  placement?: 'fixed' | 'inline';
}

export const PaidHintButtons: React.FC<PaidHintButtonsProps> = ({
  hints,
  stars,
  onHintClick,
  disabled = false,
  placement = 'fixed',
}) => {
  const t = useTranslation();

  if (hints.length === 0) return null;

  // Helper to get nested translation value
  const getNestedValue = (obj: unknown, path: string): string | undefined => {
    const parts = path.split('.');
    let current: unknown = obj;
    for (const part of parts) {
      if (typeof current === 'object' && current !== null && part in current) {
        current = (current as Record<string, unknown>)[part];
      } else {
        return undefined;
      }
    }
    return typeof current === 'string' ? current : undefined;
  };

  const containerClass =
    placement === 'inline'
      ? 'flex flex-wrap justify-center gap-2 sm:gap-3'
      : 'fixed bottom-4 right-4 flex flex-col gap-3';
  const containerStyle = placement === 'fixed' ? { zIndex: Z_INDEX.HINTS } : undefined;

  return (
    <div className={containerClass} style={containerStyle}>
      {hints.map((hint) => {
        const isDisabled = disabled || stars < hint.cost;
        const rawLabel = getNestedValue(t, hint.labelKey);
        const costText = (
          hint.cost === 1 ? t.common.forStars_one : t.common.forStars_other
        ).replace('{count}', String(hint.cost));
        const labelText = rawLabel ? `${rawLabel} (${costText})` : costText;

        return (
          <button
            type="button"
            key={hint.id}
            data-testid={`paid-hint-${hint.id}`}
            onClick={() => !isDisabled && onHintClick(hint.id)}
            disabled={isDisabled}
            className="group relative flex h-11 w-11 items-center justify-center rounded-full border border-rule-strong bg-surface text-ink transition-colors hover:bg-sunken active:bg-sunken disabled:cursor-not-allowed disabled:border-rule disabled:bg-sunken sm:h-14 sm:w-14"
            title={labelText}
            aria-label={labelText}
          >
            <HintIcon id={hint.id} size={20} aria-hidden className="group-disabled:text-muted" />
            <span className="absolute -right-1.5 -top-1.5 inline-flex items-center gap-0.5 rounded-full border border-rule bg-surface px-1.5 py-0.5 text-xs font-semibold leading-none text-ink tabular-nums group-disabled:text-muted">
              {hint.cost}
              <Star size={11} aria-hidden className="fill-star text-star" />
            </span>
          </button>
        );
      })}
    </div>
  );
};
