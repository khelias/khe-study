/**
 * Internationalization (i18n) system
 *
 * This module provides a simple, type-safe i18n system for the application.
 * It supports multiple languages and is designed to be easily extensible.
 *
 * Usage:
 * ```tsx
 * import { useTranslation } from '../i18n';
 *
 * function MyComponent() {
 *   const t = useTranslation();
 *   return <div>{t.menu.title}</div>;
 * }
 * ```
 */

import { et } from './locales/et';
import { en } from './locales/en';

export type SupportedLocale = 'et' | 'en';

export type Translations = typeof et;

const translations: Record<SupportedLocale, Translations> = {
  et,
  en: en as unknown as Translations,
};

// Default locale
const DEFAULT_LOCALE: SupportedLocale = 'en';
const LOCALE_STORAGE_KEY = 'app_locale';

function normalizeLocale(value: string | null | undefined): SupportedLocale | null {
  return value === 'et' || value === 'en' ? value : null;
}

function getUrlLocale(): SupportedLocale | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return normalizeLocale(params.get('lang')) ?? normalizeLocale(params.get('locale'));
}

function syncDocumentLocale(locale: SupportedLocale): void {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = locale;
  document.title = `${translations[locale].menu.title} | KHE Games`;
}

function syncUrlLocale(locale: SupportedLocale): void {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  url.searchParams.set('lang', locale);
  url.searchParams.delete('locale');
  window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
}

// Get locale from localStorage or browser, fallback to default
function getStoredLocale(): SupportedLocale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;

  const fromUrl = getUrlLocale();
  if (fromUrl) {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, fromUrl);
    return fromUrl;
  }

  const stored = normalizeLocale(window.localStorage.getItem(LOCALE_STORAGE_KEY));
  if (stored) {
    return stored;
  }

  return DEFAULT_LOCALE;
}

// Current locale state
let currentLocale: SupportedLocale = getStoredLocale();

// Locale change listeners
const localeChangeListeners = new Set<() => void>();

/**
 * Get current locale
 */
export function getLocale(): SupportedLocale {
  return currentLocale;
}

/**
 * Set locale
 */
export function setLocale(locale: SupportedLocale): void {
  if (locale !== 'et' && locale !== 'en') {
    console.warn(`Unsupported locale: ${String(locale)}, falling back to default`);
    locale = DEFAULT_LOCALE;
  }

  currentLocale = locale;
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    syncUrlLocale(locale);
  }
  syncDocumentLocale(locale);

  // Notify listeners
  localeChangeListeners.forEach((listener) => listener());
}

/**
 * Get translations for current locale
 */
export function getTranslations(): Translations {
  return translations[currentLocale] ?? translations[DEFAULT_LOCALE];
}

/**
 * React hook for translations
 *
 * @example
 * ```tsx
 * const t = useTranslation();
 * <div>{t.menu.title}</div>
 * ```
 */
export function useTranslation(): Translations {
  // This is a simple implementation - in a real app you might want to use
  // React context or a state management library for reactivity
  // For now, components will need to re-render when locale changes
  // through other means (e.g., state update in parent)
  return getTranslations();
}

/**
 * Subscribe to locale changes
 * Returns unsubscribe function
 */
export function subscribeToLocaleChanges(callback: () => void): () => void {
  localeChangeListeners.add(callback);
  return () => {
    localeChangeListeners.delete(callback);
  };
}

/**
 * Initialize i18n system
 */
export function initI18n(): void {
  currentLocale = getStoredLocale();
  syncDocumentLocale(currentLocale);
}

// Initialize on module load
if (typeof window !== 'undefined') {
  initI18n();
}
