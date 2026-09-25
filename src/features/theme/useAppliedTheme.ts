import { useGameStore } from '../../stores/gameStore';
import { resolveAppliedTheme } from '../../meta/themeCatalog';
import type { ThemeDefinition } from '../../meta/types';

export function useAppliedTheme(): ThemeDefinition {
  // `isLearnerProfile` does not check `preferences`, so read it defensively.
  const appliedId = useGameStore((state) => state.activeLearnerProfile.preferences?.theme);
  const ownedThemeIds = useGameStore((state) => state.ownedThemeIds);
  return resolveAppliedTheme(appliedId, ownedThemeIds);
}

/** CSS `background-image` value for a theme's art. */
export function themeArtImage(theme: ThemeDefinition): string {
  // Always quoted: Vite inlines small SVGs as data URIs that contain `'`.
  return theme.artUrl ? `url(${JSON.stringify(theme.artUrl)})` : 'none';
}

/** CSS custom properties that `.app-bg` in `src/index.css` reads. */
export function themeCssVariables(theme: ThemeDefinition): Record<string, string> {
  return {
    '--app-bg': theme.palette.background,
    '--app-bg-image': themeArtImage(theme),
    '--app-accent': theme.palette.accent,
  };
}
