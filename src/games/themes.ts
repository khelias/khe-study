/**
 * Shared theme palette used by mechanic configs.
 *
 * Extracted from `data.ts` so per-mechanic config files in
 * `src/games/<mechanic>/config.ts` can import a theme without depending
 * on `data.ts` (which composes the central `GAME_CONFIG` map from those
 * configs and would otherwise create a cycle).
 */

import type { Theme } from '../types/game';

export const THEME: Record<string, Theme> = {
  orange: {
    bg: 'bg-orange-50',
    border: 'border-orange-500',
    text: 'text-orange-600',
    iconBg: 'bg-orange-100',
    accent: 'bg-orange-500',
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-500',
    text: 'text-purple-600',
    iconBg: 'bg-purple-100',
    accent: 'bg-purple-500',
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-500',
    text: 'text-green-600',
    iconBg: 'bg-green-100',
    accent: 'bg-green-500',
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-500',
    text: 'text-blue-600',
    iconBg: 'bg-blue-100',
    accent: 'bg-blue-500',
  },
  pink: {
    bg: 'bg-pink-50',
    border: 'border-pink-500',
    text: 'text-pink-600',
    iconBg: 'bg-pink-100',
    accent: 'bg-pink-500',
  },
  teal: {
    bg: 'bg-teal-50',
    border: 'border-teal-500',
    text: 'text-teal-600',
    iconBg: 'bg-teal-100',
    accent: 'bg-teal-500',
  },
  indigo: {
    bg: 'bg-indigo-50',
    border: 'border-indigo-500',
    text: 'text-indigo-600',
    iconBg: 'bg-indigo-100',
    accent: 'bg-indigo-500',
  },
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-500',
    text: 'text-amber-600',
    iconBg: 'bg-amber-100',
    accent: 'bg-amber-500',
  },
};
