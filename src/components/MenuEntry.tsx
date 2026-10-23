import React from 'react';
import { FadeIn } from './EnhancedAnimations';
import type { MenuPicture } from '../games/PictureFrame';

export type MenuEntryLayout = 'row' | 'tile';

interface MenuEntryProps {
  layout: MenuEntryLayout;
  Picture: MenuPicture | undefined;
  title: string;
  description: string;
  /** Row: the small label over the value on the right; tile: both on one line under the title. */
  metaLabel: string;
  metaValue?: number;
  delay?: number;
  onClick: () => void;
}

/**
 * One game or mechanic in the picker: a row with its picture on phone, a tile on desktop. The
 * picture is decorative; the accessible name carries the title, description and level.
 */
export const MenuEntry: React.FC<MenuEntryProps> = ({
  layout,
  Picture,
  title,
  description,
  metaLabel,
  metaValue,
  delay = 0,
  onClick,
}) => {
  const meta = metaValue === undefined ? metaLabel : `${metaLabel} ${metaValue}`;
  const tile = layout === 'tile';

  return (
    <FadeIn delay={delay}>
      <button
        onClick={onClick}
        aria-label={`${title} - ${description} - ${meta}`}
        className={
          tile
            ? 'group flex w-full flex-col gap-2 rounded-xl text-left'
            : 'group fam-row fam-list-row gap-3.5 sm:px-2'
        }
      >
        {tile ? (
          <>
            <span className="flex h-32 w-full items-center justify-center rounded-xl bg-study/10 transition-colors group-hover:bg-study/15 group-active:bg-study/20">
              {Picture && <Picture className="h-28 w-36" />}
            </span>
            <span className="break-words text-[15px] font-semibold leading-tight text-ink">
              {title}
            </span>
            <span className="-mt-1 text-[13px] text-muted">{meta}</span>
          </>
        ) : (
          <>
            <span className="flex h-16 w-20 shrink-0 items-center justify-center rounded-xl bg-sunken transition-colors group-hover:bg-surface group-active:bg-surface">
              {Picture && <Picture className="h-16 w-20" />}
            </span>
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="line-clamp-2 break-words text-[17px] font-semibold leading-snug text-ink">
                {title}
              </span>
              <span className="truncate text-sm text-muted">{description}</span>
            </span>
            <span className="flex shrink-0 flex-col items-end leading-tight">
              <span className="fam-label">{metaLabel}</span>
              {metaValue !== undefined && (
                <span className="text-lg font-semibold tabular-nums text-ink">{metaValue}</span>
              )}
            </span>
          </>
        )}
      </button>
    </FadeIn>
  );
};
