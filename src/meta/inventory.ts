import { getTheme, THEME_CATALOG } from './themeCatalog';
import type { ThemeDefinition } from './types';

export interface ThemeWallet {
  stars: number;
  ownedThemeIds: readonly string[];
}

export type ThemePurchaseFailure = 'unknown' | 'default' | 'owned' | 'insufficient_stars';

export type ThemePurchaseResult =
  | { ok: true; theme: ThemeDefinition; stars: number; ownedThemeIds: string[] }
  | { ok: false; reason: ThemePurchaseFailure };

/** The default theme is owned by everyone without a purchase. */
export function isThemeOwned(theme: ThemeDefinition, ownedThemeIds: readonly string[]): boolean {
  return theme.isDefault || ownedThemeIds.includes(theme.id);
}

export function purchaseTheme(
  wallet: ThemeWallet,
  themeId: string,
  catalog: readonly ThemeDefinition[] = THEME_CATALOG,
): ThemePurchaseResult {
  const theme = getTheme(themeId, catalog);
  if (!theme) return { ok: false, reason: 'unknown' };
  if (theme.isDefault) return { ok: false, reason: 'default' };
  if (wallet.ownedThemeIds.includes(theme.id)) return { ok: false, reason: 'owned' };
  if (wallet.stars < theme.cost) return { ok: false, reason: 'insufficient_stars' };
  return {
    ok: true,
    theme,
    stars: wallet.stars - theme.cost,
    ownedThemeIds: [...wallet.ownedThemeIds, theme.id],
  };
}

export function canPurchaseTheme(
  wallet: ThemeWallet,
  themeId: string,
  catalog: readonly ThemeDefinition[] = THEME_CATALOG,
): boolean {
  return purchaseTheme(wallet, themeId, catalog).ok;
}

export function canApplyTheme(
  themeId: string,
  ownedThemeIds: readonly string[],
  catalog: readonly ThemeDefinition[] = THEME_CATALOG,
): boolean {
  const theme = getTheme(themeId, catalog);
  return theme !== undefined && isThemeOwned(theme, ownedThemeIds);
}
