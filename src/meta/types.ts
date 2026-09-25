import type { LocaleCode } from '../curriculum/types';

export type ThemeTier = 'default' | 'common' | 'rare' | 'special';

export type ThemeAudience = 'kid' | 'adult';

export interface ThemePalette {
  background: string;
  accent: string;
}

export interface ThemeDefinition {
  id: string;
  name: Record<LocaleCode, string>;
  description: Record<LocaleCode, string>;
  audience: ThemeAudience;
  tier: ThemeTier;
  cost: number;
  isDefault: boolean;
  palette: ThemePalette;
  /** Resolved URL of the decorative background art, if the theme has one. */
  artUrl?: string;
}
