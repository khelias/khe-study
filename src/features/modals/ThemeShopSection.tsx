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
          className="fam-pill shrink-0 self-start sm:self-auto"
        >
          <Check size={14} aria-hidden className="text-ok" />
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
          className="fam-btn shrink-0 self-start sm:self-auto"
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
          className="fam-btn gap-1 tabular-nums"
        >
          {formatText(t.shop.buyTheme)}
          <span>{theme.cost}</span>
          <Star size={14} className="fill-star text-star" aria-hidden />
        </button>
        {!affordable && (
          <span className="text-xs text-muted">{formatText(t.shop.notEnoughStars)}</span>
        )}
      </div>
    );
  };

  return (
    <section aria-labelledby="shop-themes-title" className="border-t border-rule-strong pt-5">
      <h3 id="shop-themes-title" className="fam-heading mb-2 flex items-center gap-2">
        <Palette size={20} className="text-muted" aria-hidden />
        {formatText(t.shop.themes)}
      </h3>
      <p className="mb-3 text-sm text-ink-2">{formatText(t.shop.themesDescription)}</p>

      <ul>
        {THEME_CATALOG.map((theme) => {
          const name = theme.name[locale];
          return (
            <li key={theme.id} className="fam-row flex items-start gap-3 px-2 py-3 sm:items-center">
              <div
                aria-hidden
                className="h-14 w-16 shrink-0 rounded-xl border border-rule"
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
                    <span className="font-semibold text-ink">{name}</span>
                    {theme.tier !== 'default' && (
                      <span className="fam-pill">{formatText(tierLabel[theme.tier])}</span>
                    )}
                  </div>
                  <p className="text-sm text-muted">{theme.description[locale]}</p>
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
