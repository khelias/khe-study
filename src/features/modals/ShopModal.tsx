/**
 * ShopModal Component
 *
 * Modal for spending earned stars on hearts and themes.
 */

import React from 'react';
import { Heart, Star, ShoppingBag } from 'lucide-react';
import {
  HEART_COST_STARS,
  MAX_HEARTS,
  STAR_PURCHASE_AMOUNT,
  useGameStore,
} from '../../stores/gameStore';
import { useTranslation } from '../../i18n/useTranslation';
import { useProfileText } from '../../hooks/useProfileText';
import { useGameAudio } from '../../hooks/useGameAudio';
import { AppModal, AppModalHeader } from '../../components/shared';
import { ThemeShopSection } from './ThemeShopSection';

const ROW_BUTTON_CLASS =
  'group fam-row flex min-h-11 w-full items-center justify-between gap-3 px-2 py-3 text-left transition-colors enabled:hover:bg-sunken enabled:active:bg-sunken disabled:cursor-not-allowed';
const ROW_NAME_CLASS = 'font-semibold text-ink group-disabled:text-muted';

interface ShopModalProps {
  onClose: () => void;
  openedFromNoHearts?: boolean; // If true, show a message about needing hearts to play
}

export const ShopModal: React.FC<ShopModalProps> = ({ onClose, openedFromNoHearts = false }) => {
  const t = useTranslation();
  const { formatText } = useProfileText();
  const stars = useGameStore((state) => state.stars);
  const lifetimeStars = useGameStore((state) => state.stats.collectedStars);
  const hearts = useGameStore((state) => state.hearts);
  const buyHeartsWithStars = useGameStore((state) => state.buyHeartsWithStars);
  const buyStars = useGameStore((state) => state.buyStars);
  const soundEnabled = useGameStore((state) => state.soundEnabled);
  const { playClick } = useGameAudio(soundEnabled);

  const canBuyHeart = stars >= HEART_COST_STARS && hearts < MAX_HEARTS;
  const heartsNeeded = MAX_HEARTS - hearts;
  const canFillHearts = heartsNeeded > 0 && stars >= HEART_COST_STARS * heartsNeeded;

  const handleBuyHeart = () => {
    if (canBuyHeart) {
      playClick();
      buyHeartsWithStars(1);
    }
  };

  const handleBuyStars = () => {
    playClick();
    buyStars(STAR_PURCHASE_AMOUNT);
  };

  return (
    <AppModal
      labelledBy="shop-modal-title"
      onClose={() => {
        playClick();
        onClose();
      }}
      size="md"
    >
      <AppModalHeader
        title={formatText(t.shop.title)}
        titleId="shop-modal-title"
        icon={<ShoppingBag size={20} aria-hidden />}
        onClose={() => {
          playClick();
          onClose();
        }}
        closeLabel={formatText(t.common.close)}
      />

      <div className="space-y-6 p-5 sm:p-6">
        {openedFromNoHearts && hearts <= 0 && (
          <div className="rounded-lg border border-heart/40 bg-heart/10 p-4">
            <div className="mb-1 flex items-center gap-2">
              <Heart size={20} aria-hidden className="fill-heart text-heart" />
              <span className="font-semibold text-ink">{formatText(t.shop.noHeartsToPlay)}</span>
            </div>
            <p className="text-sm text-ink-2">{formatText(t.shop.buyHeartsToContinue)}</p>
          </div>
        )}

        <div>
          <div className="fam-row px-2 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Star size={20} aria-hidden className="fill-star text-star" />
                <span className="font-semibold text-ink">{formatText(t.shop.yourStarBalance)}</span>
              </div>
              <span className="text-2xl font-semibold tabular-nums text-ink">{stars}</span>
            </div>
            <div className="mt-1 text-sm text-muted">
              {formatText(t.shop.starBalanceDescription)}
            </div>
          </div>
          <div className="fam-row flex items-center justify-between gap-3 px-2 py-3 text-sm">
            <span className="text-muted">{formatText(t.shop.lifetimeStars)}</span>
            <span className="font-semibold tabular-nums text-ink">{lifetimeStars}</span>
          </div>
          <div className="fam-row flex items-center justify-between gap-3 px-2 py-3">
            <div className="flex items-center gap-2">
              <Heart size={20} aria-hidden className="fill-heart text-heart" />
              <span className="font-semibold text-ink">{formatText(t.shop.yourHearts)}</span>
            </div>
            <span className="text-2xl font-semibold tabular-nums text-ink">
              {hearts}/{MAX_HEARTS}
            </span>
          </div>
        </div>

        {!openedFromNoHearts && <ThemeShopSection />}

        <section className="border-t border-rule-strong pt-5">
          <h3 className="fam-heading mb-2 flex items-center gap-2">
            <Heart size={20} aria-hidden className="text-muted" />
            {formatText(t.shop.buyHearts)}
          </h3>
          <p className="mb-3 text-sm text-ink-2">{formatText(t.shop.buyHeartsDescription)}</p>

          <div>
            <button onClick={handleBuyHeart} disabled={!canBuyHeart} className={ROW_BUTTON_CLASS}>
              <div className="flex items-center gap-3">
                <Heart
                  size={24}
                  aria-hidden
                  className={canBuyHeart ? 'fill-heart text-heart' : 'text-muted'}
                />
                <div className="text-left">
                  <div className={ROW_NAME_CLASS}>{formatText(t.shop.buy1Heart)}</div>
                  <div className="flex items-center gap-1 text-sm text-muted">
                    {formatText(t.shop.cost)}:{' '}
                    <span className="font-semibold tabular-nums text-ink">{HEART_COST_STARS}</span>
                    <Star size={14} aria-hidden className="fill-star text-star" />
                  </div>
                </div>
              </div>
              {!canBuyHeart && hearts >= MAX_HEARTS && (
                <span className="text-xs text-muted">{formatText(t.shop.maxHearts)}</span>
              )}
              {!canBuyHeart && stars < HEART_COST_STARS && (
                <span className="text-xs text-muted">{formatText(t.shop.notEnoughStars)}</span>
              )}
            </button>

            {heartsNeeded > 1 && (
              <button
                onClick={() => {
                  if (canFillHearts) {
                    playClick();
                    buyHeartsWithStars(heartsNeeded);
                  }
                }}
                disabled={!canFillHearts}
                className={ROW_BUTTON_CLASS}
              >
                <div className="flex items-center gap-3">
                  <Heart
                    size={24}
                    aria-hidden
                    className={canFillHearts ? 'fill-heart text-heart' : 'text-muted'}
                  />
                  <div className="text-left">
                    <div className={ROW_NAME_CLASS}>
                      {formatText(t.shop.buyHeartsCount).replace('{count}', String(heartsNeeded))}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted">
                      {formatText(t.shop.cost)}:{' '}
                      <span className="font-semibold tabular-nums text-ink">
                        {HEART_COST_STARS * heartsNeeded}
                      </span>
                      <Star size={14} aria-hidden className="fill-star text-star" />
                    </div>
                  </div>
                </div>
                {stars < HEART_COST_STARS * heartsNeeded && (
                  <span className="text-xs text-muted">{formatText(t.shop.notEnoughStars)}</span>
                )}
              </button>
            )}
          </div>
        </section>

        {openedFromNoHearts && <ThemeShopSection />}

        <section className="border-t border-rule-strong pt-5">
          <h3 className="fam-heading mb-2 flex items-center gap-2">
            <Star size={20} aria-hidden className="text-muted" />
            {formatText(t.shop.buyStars)}
          </h3>
          <p className="mb-3 text-sm text-ink-2">{formatText(t.shop.buyStarsDescription)}</p>

          <button onClick={handleBuyStars} className={ROW_BUTTON_CLASS}>
            <div className="flex items-center gap-3">
              <Star size={24} aria-hidden className="fill-star text-star" />
              <div className="text-left">
                <div className={ROW_NAME_CLASS}>
                  {formatText(t.shop.buy50Stars).replace('{count}', String(STAR_PURCHASE_AMOUNT))}
                </div>
                <div className="text-sm text-muted">
                  {formatText(t.shop.price)}:{' '}
                  <span className="font-semibold text-ink">{formatText(t.shop.free)}</span>
                </div>
              </div>
            </div>
            <span className="fam-pill shrink-0">{formatText(t.shop.free)}</span>
          </button>
        </section>
      </div>
    </AppModal>
  );
};
