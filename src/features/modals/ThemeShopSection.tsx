/**
 * Theme cards in the shop: buy a theme with stars, or switch to an owned one.
 */

import React from 'react';
import { Check, Palette, Star } from 'lucide-react';
import { useGameStore } from '../../stores/gameStore';
import { getLocale } from '../../i18n';
import { useTranslation } from '../../i18n/useTranslation';
import { useProfileText } from '../../hooks/useProfileText';
import { useGameAudio } from '../../hooks/useGameAudio';
import { isThemeOwned } from '../../meta/inventory';
import { THEME_CATALOG } from '../../meta/themeCatalog';
import type { ThemeDefinition, ThemeTier } from '../../meta/types';
import { themeArtImage, useAppliedTheme } from '../theme/useAppliedTheme';

const TIER_BADGE_CLASS: Record<Exclude<ThemeTier, 'default'>, string> = {
  common: 'bg-sky-100 text-sky-800',
  rare: 'bg-emerald-100 text-emerald-800',
  special: 'bg-violet-100 text-violet-800',
};

export const ThemeShopSection: React.FC = () => {
  const t = useTranslation();
  const { formatText } = useProfileText();
  const locale = getLocale();
  const stars = useGameStore((state) => state.stars);
  const ownedThemeIds = useGameStore((state) => state.ownedThemeIds);
  const buyTheme = useGameStore((state) => state.buyTheme);
  const applyTheme = useGameStore((state) => state.applyTheme);
  const soundEnabled = useGameStore((state) => state.soundEnabled);
  const { playClick } = useGameAudio(soundEnabled);
  const appliedTheme = useAppliedTheme();

  const tierLabel: Record<Exclude<ThemeTier, 'default'>, string> = {
    common: t.shop.tierCommon,
    rare: t.shop.tierRare,
    special: t.shop.tierSpecial,
  };

  const renderAction = (theme: ThemeDefinition, name: string) => {
    if (theme.id === appliedTheme.id) {
      return (
        <button
          type="button"
          disabled
          aria-label={formatText(t.shop.themeInUseLabel).replace('{name}', name)}
          className="flex shrink-0 items-center gap-1 self-start rounded-lg bg-slate-200 sm:self-auto px-3 py-2 text-sm font-bold text-slate-700"
        >
          <Check size={16} aria-hidden />
          {formatText(t.shop.themeInUse)}
        </button>
      );
    }
    if (isThemeOwned(theme, ownedThemeIds)) {
      return (
        <button
          type="button"
          onClick={() => {
            playClick();
            applyTheme(theme.id);
          }}
          aria-label={formatText(t.shop.useThemeLabel).replace('{name}', name)}
          className="shrink-0 self-start rounded-lg border-2 border-purple-300 sm:self-auto bg-white px-3 py-2 text-sm font-bold text-purple-700 transition-all hover:bg-purple-50 active:scale-95"
        >
          {formatText(t.shop.useTheme)}
        </button>
      );
    }
    const affordable = stars >= theme.cost;
    return (
      <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
        <button
          type="button"
          onClick={() => {
            if (!affordable) return;
            playClick();
            buyTheme(theme.id);
          }}
          disabled={!affordable}
          aria-label={formatText(t.shop.buyThemeLabel)
            .replace('{name}', name)
            .replace('{cost}', String(theme.cost))}
          className={`flex items-center gap-1 rounded-lg border-2 px-3 py-2 text-sm font-bold transition-all ${
            affordable
              ? 'border-yellow-300 bg-yellow-50 text-slate-800 hover:bg-yellow-100 active:scale-95'
              : 'cursor-not-allowed border-slate-300 bg-slate-100 text-slate-600 opacity-60'
          }`}
        >
          {formatText(t.shop.buyTheme)}
          <span className="text-yellow-700">{theme.cost}</span>
          <Star size={14} className="fill-yellow-500 text-yellow-500" aria-hidden />
        </button>
        {!affordable && (
          <span className="text-xs text-slate-500">{formatText(t.shop.notEnoughStars)}</span>
        )}
      </div>
    );
  };

  return (
    <section
      aria-labelledby="shop-themes-title"
      className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-200"
    >
      <h3
        id="shop-themes-title"
        className="text-lg font-black text-slate-800 mb-3 flex items-center gap-2"
      >
        <Palette size={20} className="text-purple-600" aria-hidden />
        {formatText(t.shop.themes)}
      </h3>
      <p className="text-sm text-slate-600 mb-4">{formatText(t.shop.themesDescription)}</p>

      <ul className="space-y-2">
        {THEME_CATALOG.map((theme) => {
          const name = theme.name[locale];
          return (
            <li
              key={theme.id}
              className="flex items-start gap-3 rounded-xl border-2 border-slate-200 bg-white p-3 sm:items-center"
            >
              <div
                aria-hidden
                className="h-14 w-16 shrink-0 rounded-lg border border-slate-200"
                style={{
                  backgroundColor: theme.palette.background,
                  backgroundImage: themeArtImage(theme),
                  backgroundSize: 'cover',
                  backgroundPosition: 'center bottom',
                }}
              />
              <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-800">{name}</span>
                    {theme.tier !== 'default' && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-bold ${TIER_BADGE_CLASS[theme.tier]}`}
                      >
                        {formatText(tierLabel[theme.tier])}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600">{theme.description[locale]}</p>
                </div>
                {renderAction(theme, name)}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
};
