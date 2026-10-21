import React from 'react';
import { SiteHeader } from '@khelias/ui/react';
import { roomHref } from '@khelias/ui/rooms';
import { getLocale, setLocale, type SupportedLocale } from '../i18n';
import { useTranslation } from '../i18n/useTranslation';

const LOCALES = [
  { code: 'et', label: 'ET' },
  { code: 'en', label: 'EN' },
] as const satisfies readonly { code: SupportedLocale; label: string }[];

export const StudySiteHeader: React.FC = () => {
  const t = useTranslation();
  const locale = getLocale();

  return (
    <SiteHeader
      brand={{ href: roomHref('home', locale), label: t.siteHeader.homeLabel }}
      rooms={{ current: 'games', locale }}
      context={{ title: t.menu.title }}
      locales={LOCALES}
      activeLocale={locale}
      languageLabel={t.siteHeader.languageLabel}
      attrs={{ brand: { title: t.siteHeader.homeLabel } }}
      onLocaleChange={setLocale}
    />
  );
};
