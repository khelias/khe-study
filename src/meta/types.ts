import type { LocaleCode } from '../curriculum/types';
import type { Stats } from '../types/stats';

export type ThemeTier = 'default' | 'common' | 'rare' | 'special';

export type ThemeAudience = 'kid' | 'adult';

export interface ThemePalette {
  background: string;
  /** The ground in the dark theme (ADR 0004). */
  backgroundDark: string;
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

/**
 * A learner's rewards and records (ADR-0001's Meta-progression context,
 * ADR 0005 point 4). The stars earned over time are `stats.collectedStars`,
 * which the star achievements read.
 */
export interface LearnerMeta {
  /** Spendable stars. */
  stars: number;
  stats: Stats;
  /** Unlocked achievement ids. */
  achievements: string[];
  /** Best score per game type. */
  highScores: Record<string, number>;
  /** Ids no longer in the catalog are kept and ignored. */
  ownedThemeIds: string[];
}
