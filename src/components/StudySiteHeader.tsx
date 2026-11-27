import React from 'react';
import { SiteHeader } from '@khelias/ui/react';
import { roomHref } from '@khelias/ui/rooms';
import { getLocale, setLocale, type SupportedLocale } from '../i18n';
import { useTranslation } from '../i18n/useTranslation';
import { PRODUCT_ROOT } from '../theme/productRoot';
import { useStudyTheme } from '../theme/studyTheme';

const LOCALES = [
  { code: 'et', label: 'ET' },
  { code: 'en', label: 'EN' },
] as const satisfies readonly { code: SupportedLocale; label: string }[];

interface StudySiteHeaderProps {
  /** In a game the theme toggle is in the game menu. */
  showThemeToggle?: boolean;
}

export const StudySiteHeader: React.FC<StudySiteHeaderProps> = ({ showThemeToggle = true }) => {
  const t = useTranslation();
  const locale = getLocale();
  const { dark, toggle } = useStudyTheme();

  return (
    <SiteHeader
      brand={{ href: roomHref('home', locale), label: t.siteHeader.homeLabel }}
      rooms={{ current: 'games', locale }}
      context={{ title: t.menu.title }}
      product={{ root: PRODUCT_ROOT }}
      locales={LOCALES}
      activeLocale={locale}
      languageLabel={t.siteHeader.languageLabel}
      themeToggle={
        showThemeToggle ? { label: t.siteHeader.darkTheme, dark, onToggle: toggle } : undefined
      }
      attrs={{ brand: { title: t.siteHeader.homeLabel } }}
      onLocaleChange={setLocale}
    />
  );
};
