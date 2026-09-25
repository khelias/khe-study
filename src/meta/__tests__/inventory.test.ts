import { describe, expect, it } from 'vitest';
import { canApplyTheme, canPurchaseTheme, isThemeOwned, purchaseTheme } from '../inventory';
import type { ThemeDefinition } from '../types';

function theme(overrides: Partial<ThemeDefinition>): ThemeDefinition {
  return {
    id: 'x',
    name: { et: 'X', en: 'X' },
    description: { et: 'X', en: 'X' },
    audience: 'kid',
    tier: 'common',
    cost: 10,
    isDefault: false,
    palette: { background: '#ffffff', accent: '#000000' },
    ...overrides,
  };
}

const catalog: ThemeDefinition[] = [
  theme({ id: 'base', tier: 'default', cost: 0, isDefault: true }),
  theme({ id: 'sea', cost: 30 }),
];

describe('purchaseTheme', () => {
  it('debits stars and grants the theme', () => {
    const result = purchaseTheme({ stars: 50, ownedThemeIds: [] }, 'sea', catalog);
    expect(result).toMatchObject({ ok: true, stars: 20, ownedThemeIds: ['sea'] });
  });

  it('allows spending the exact balance', () => {
    expect(purchaseTheme({ stars: 30, ownedThemeIds: [] }, 'sea', catalog)).toMatchObject({
      ok: true,
      stars: 0,
    });
  });

  it('refuses an unknown theme', () => {
    expect(purchaseTheme({ stars: 99, ownedThemeIds: [] }, 'gone', catalog)).toEqual({
      ok: false,
      reason: 'unknown',
    });
  });

  it('refuses the default theme', () => {
    expect(purchaseTheme({ stars: 99, ownedThemeIds: [] }, 'base', catalog)).toEqual({
      ok: false,
      reason: 'default',
    });
  });

  it('refuses a theme already owned', () => {
    expect(purchaseTheme({ stars: 99, ownedThemeIds: ['sea'] }, 'sea', catalog)).toEqual({
      ok: false,
      reason: 'owned',
    });
  });

  it('refuses when stars are short', () => {
    expect(purchaseTheme({ stars: 29, ownedThemeIds: [] }, 'sea', catalog)).toEqual({
      ok: false,
      reason: 'insufficient_stars',
    });
  });

  it('does not mutate the wallet', () => {
    const owned: string[] = [];
    purchaseTheme({ stars: 50, ownedThemeIds: owned }, 'sea', catalog);
    expect(owned).toEqual([]);
  });
});

describe('ownership checks', () => {
  it('reports purchasability', () => {
    expect(canPurchaseTheme({ stars: 30, ownedThemeIds: [] }, 'sea', catalog)).toBe(true);
    expect(canPurchaseTheme({ stars: 5, ownedThemeIds: [] }, 'sea', catalog)).toBe(false);
  });

  it('treats the default theme as owned', () => {
    expect(isThemeOwned(catalog[0]!, [])).toBe(true);
    expect(isThemeOwned(catalog[1]!, [])).toBe(false);
  });

  it('applies only owned or default themes that exist', () => {
    expect(canApplyTheme('base', [], catalog)).toBe(true);
    expect(canApplyTheme('sea', [], catalog)).toBe(false);
    expect(canApplyTheme('sea', ['sea'], catalog)).toBe(true);
    expect(canApplyTheme('gone', ['gone'], catalog)).toBe(false);
  });
});
