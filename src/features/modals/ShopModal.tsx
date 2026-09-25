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
        icon={<ShoppingBag size={20} className="text-purple-600" aria-hidden />}
        onClose={() => {
          playClick();
          onClose();
        }}
        closeLabel={formatText(t.common.close)}
      />

      <div className="space-y-4 p-5 sm:p-6">
        {/* No Hearts Warning */}
        {openedFromNoHearts && hearts <= 0 && (
          <div className="bg-red-50 border-2 border-red-300 p-4 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Heart size={20} className="text-red-500 fill-red-500" />
              <span className="font-bold text-red-700">{formatText(t.shop.noHeartsToPlay)}</span>
            </div>
            <p className="text-sm text-red-600">{formatText(t.shop.buyHeartsToContinue)}</p>
          </div>
        )}

        {/* Current Resources */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-2xl border-2 border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Star size={20} className="text-yellow-500 fill-yellow-500" />
              <span className="font-bold text-slate-700">{formatText(t.shop.yourStarBalance)}</span>
            </div>
            <span className="text-2xl font-black text-yellow-700">{stars}</span>
          </div>
          <div className="mb-3 text-xs text-slate-600">
            {formatText(t.shop.starBalanceDescription)}
          </div>
          <div className="flex items-center justify-between mb-2 text-sm">
            <span className="font-semibold text-slate-600">{formatText(t.shop.lifetimeStars)}</span>
            <span className="font-black text-slate-700">{lifetimeStars}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart size={20} className="text-red-500 fill-red-500" />
              <span className="font-bold text-slate-700">{formatText(t.shop.yourHearts)}</span>
            </div>
            <span className="text-2xl font-black text-red-700">
              {hearts}/{MAX_HEARTS}
            </span>
          </div>
        </div>

        {!openedFromNoHearts && <ThemeShopSection />}

        {/* Buy Hearts Section */}
        <div className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-200">
          <h3 className="text-lg font-black text-slate-800 mb-3 flex items-center gap-2">
            <Heart size={20} className="text-red-500" />
            {formatText(t.shop.buyHearts)}
          </h3>
          <p className="text-sm text-slate-600 mb-4">{formatText(t.shop.buyHeartsDescription)}</p>

          <div className="space-y-2">
            <button
              onClick={handleBuyHeart}
              disabled={!canBuyHeart}
              className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                canBuyHeart
                  ? 'bg-red-50 border-red-300 hover:bg-red-100 hover:border-red-400 active:scale-95'
                  : 'bg-slate-100 border-slate-300 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-3">
                <Heart size={24} className="text-red-500 fill-red-500" />
                <div className="text-left">
                  <div className="font-bold text-slate-800">{formatText(t.shop.buy1Heart)}</div>
                  <div className="text-sm text-slate-600">
                    {formatText(t.shop.cost)}:{' '}
                    <span className="font-bold text-yellow-700">{HEART_COST_STARS} ⭐</span>
                  </div>
                </div>
              </div>
              {!canBuyHeart && hearts >= MAX_HEARTS && (
                <span className="text-xs text-slate-500">{formatText(t.shop.maxHearts)}</span>
              )}
              {!canBuyHeart && stars < HEART_COST_STARS && (
                <span className="text-xs text-slate-500">{formatText(t.shop.notEnoughStars)}</span>
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
                className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                  canFillHearts
                    ? 'bg-red-50 border-red-300 hover:bg-red-100 hover:border-red-400 active:scale-95'
                    : 'bg-slate-100 border-slate-300 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Heart size={24} className="text-red-500 fill-red-500" />
                  <div className="text-left">
                    <div className="font-bold text-slate-800">
                      {formatText(t.shop.buyHeartsCount).replace('{count}', String(heartsNeeded))}
                    </div>
                    <div className="text-sm text-slate-600">
                      {formatText(t.shop.cost)}:{' '}
                      <span className="font-bold text-yellow-700">
                        {HEART_COST_STARS * heartsNeeded} ⭐
                      </span>
                    </div>
                  </div>
                </div>
                {stars < HEART_COST_STARS * heartsNeeded && (
                  <span className="text-xs text-slate-500">
                    {formatText(t.shop.notEnoughStars)}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {openedFromNoHearts && <ThemeShopSection />}

        <div className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-200">
          <h3 className="text-lg font-black text-slate-800 mb-3 flex items-center gap-2">
            <Star size={20} className="text-yellow-500 fill-yellow-500" />
            {formatText(t.shop.buyStars)}
          </h3>
          <p className="text-sm text-slate-600 mb-4">{formatText(t.shop.buyStarsDescription)}</p>

          <button
            onClick={handleBuyStars}
            className="w-full p-4 rounded-xl border-2 bg-yellow-50 border-yellow-300 hover:bg-yellow-100 hover:border-yellow-400 active:scale-95 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Star size={24} className="text-yellow-500 fill-yellow-500" />
              <div className="text-left">
                <div className="font-bold text-slate-800">
                  {formatText(t.shop.buy50Stars).replace('{count}', String(STAR_PURCHASE_AMOUNT))}
                </div>
                <div className="text-sm text-slate-600">
                  {formatText(t.shop.price)}:{' '}
                  <span className="font-bold text-green-600">{formatText(t.shop.free)}</span>
                </div>
              </div>
            </div>
            <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
              {formatText(t.shop.free)}
            </span>
          </button>
        </div>
      </div>
    </AppModal>
  );
};
