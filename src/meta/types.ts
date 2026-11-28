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
  /** Today's path, or the last day's until a new day replaces it (ADR 0005 point 6). */
  path: TodayPath | null;
  /** Days in a row with a finished path, counted up to `lastDay`. */
  streak: { days: number; lastDay: string | null };
  /** The path stickers earned, oldest first; achievement stickers follow `achievements`. */
  album: AlbumSticker[];
  /** What a parent set the path to practise, behind the device's PIN. */
  focus: ParentFocus | null;
}

/** One of today's three rounds: its game, and the sticker once it reached its goal. */
export interface PathSlot {
  gameId: string;
  stickerId: string | null;
}

export interface TodayPath {
  /** The learner's local day, `YYYY-MM-DD`. */
  day: string;
  slots: PathSlot[];
}

export interface AlbumSticker {
  stickerId: string;
  /** The game whose path round earned it. */
  gameId: string;
  earnedAt: number;
}

/** A subject of the picker (language, math, logic, memory) or one skill. */
export type ParentFocus = { kind: 'subject'; subject: string } | { kind: 'skill'; skillId: string };

/** The parent's four-digit PIN on this device, kept only as a salted hash. */
export interface ParentPin {
  salt: string;
  hash: string;
}
