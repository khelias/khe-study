# Internationalization (i18n) System

## Overview

This project uses a simple, type-safe i18n system for multi-language support. Currently, Estonian and English are supported.

## Structure

```
i18n/
├── locales/
│   ├── et.ts    # Estonian (the translations' type)
│   └── en.ts    # English
├── index.ts     # Core i18n logic
├── useTranslation.tsx  # React hook
└── README.md    # This file
```

## Usage

### In React Components

```tsx
import { useTranslation } from '../i18n/useTranslation';

function MyComponent() {
  const t = useTranslation();

  return (
    <div>
      <h1>{t.menu.title}</h1>
      <p>{t.menu.selectProfile}</p>
    </div>
  );
}
```

### In Functions (non-React components)

```ts
import { getTranslations } from '../i18n';

function myFunction() {
  const t = getTranslations();
  console.log(t.menu.title);
}
```

### Changing Language

```tsx
import { setLocale, getLocale } from '../i18n';

// Change language
setLocale('en'); // Or 'et'

// Check current language
const currentLocale = getLocale();
```

## Adding a New Language

1. **Create a new translation file** `locales/XX.ts`:

```ts
export const xx = {
  common: {
    yes: 'Jah',
    // ...
  },
  // ...
} as const;
```

2. **Add the language** in `index.ts`:

```ts
export type SupportedLocale = 'et' | 'en' | 'xx';

const translations: Record<SupportedLocale, Translations> = {
  et,
  en,
  xx, // Add new language
};
```

3. **Add language selector** in the UI (if needed)

## Translation Structure

Translations are organized into logical categories:

- `common` - Common strings (Yes, No, OK, etc.)
- `errors` - Error messages
- `feedback` - Feedback messages
- `categories` - Game categories
- `profiles` - Profiles
- `menu` - Menu strings
- `game` - Game strings
- `stats` - Statistics strings
- `achievements` - Achievement strings

## Type Safety

All translations are type-safe. TypeScript ensures that:

- All keys exist
- Types are correct
- There are no undefined references

## LocalStorage

The chosen language is stored in LocalStorage under the key `app_locale`, shared with the games launcher and the other games on the origin. Only a press on the language switcher stores it. A `?lang=` (or legacy `?locale=`) in the address wins for that page but is not stored, since every room link carries one; with neither, the app opens in Estonian ([khe-sites ADR-001](https://github.com/khelias/khe-sites/blob/main/docs/decisions/001-khe-ee-pages-are-one-static-page-per-language.md) point 8).

## Future

- [ ] Add more languages
- [ ] Add translation management system
- [ ] Add translation editing tools
