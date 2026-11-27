import { createContext, useContext } from 'react';
import type { useThemeOverride } from '@khelias/ui/react';

export type StudyTheme = ReturnType<typeof useThemeOverride>;

// One override state for the header and the game menu, so a toggle in one shows in the other.
export const StudyThemeContext = createContext<StudyTheme | null>(null);

export const useStudyTheme = (): StudyTheme => {
  const theme = useContext(StudyThemeContext);
  if (!theme) throw new Error('useStudyTheme needs a StudyThemeProvider');
  return theme;
};
