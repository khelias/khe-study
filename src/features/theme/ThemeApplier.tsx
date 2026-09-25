import { useLayoutEffect } from 'react';
import { themeCssVariables, useAppliedTheme } from './useAppliedTheme';

/**
 * Writes the applied theme onto `<html>`. A layout effect, and persist
 * hydration is synchronous, so the first paint already has the theme.
 */
export function ThemeApplier(): null {
  const theme = useAppliedTheme();
  useLayoutEffect(() => {
    const root = document.documentElement;
    for (const [name, value] of Object.entries(themeCssVariables(theme))) {
      root.style.setProperty(name, value);
    }
  }, [theme]);
  return null;
}
