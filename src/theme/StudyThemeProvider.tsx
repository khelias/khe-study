import React, { useMemo } from 'react';
import { useThemeOverride } from '@khelias/ui/react';
import { THEME_STORAGE_KEY } from './themeKey';
import { StudyThemeContext } from './studyTheme';

export const StudyThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { dark, toggle } = useThemeOverride(THEME_STORAGE_KEY);
  const theme = useMemo(() => ({ dark, toggle }), [dark, toggle]);
  return <StudyThemeContext.Provider value={theme}>{children}</StudyThemeContext.Provider>;
};
