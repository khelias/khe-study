import type { LocaleCode } from '../curriculum/types';
import { isHexColour } from './contrast';
import type { ThemeAudience, ThemeDefinition, ThemeTier } from './types';

const LOCALES: readonly LocaleCode[] = ['et', 'en'];
const TIERS: readonly ThemeTier[] = ['default', 'common', 'rare', 'special'];
const AUDIENCES: readonly ThemeAudience[] = ['kid', 'adult'];

export type ThemeParseResult =
  { ok: true; theme: ThemeDefinition } | { ok: false; errors: string[] };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseLocalized(
  value: unknown,
  field: string,
  errors: string[],
): Record<LocaleCode, string> | null {
  if (!isRecord(value)) {
    errors.push(`${field} must be an object with ${LOCALES.join(' and ')}`);
    return null;
  }
  const out: Partial<Record<LocaleCode, string>> = {};
  for (const locale of LOCALES) {
    const text = value[locale];
    if (typeof text !== 'string' || text.trim() === '') {
      errors.push(`${field}.${locale} must be a non-empty string`);
    } else {
      out[locale] = text;
    }
  }
  return errors.length === 0 ? (out as Record<LocaleCode, string>) : null;
}

/**
 * Validate one `theme.json`. `artUrls` maps file names in the theme's own
 * folder to their bundled URLs.
 */
export function parseTheme(
  raw: unknown,
  folderId: string,
  artUrls: Record<string, string>,
): ThemeParseResult {
  if (!isRecord(raw)) return { ok: false, errors: ['theme.json must be an object'] };
  const errors: string[] = [];

  if (raw.id !== folderId) errors.push(`id must equal the folder name "${folderId}"`);

  const nameErrors: string[] = [];
  const name = parseLocalized(raw.name, 'name', nameErrors);
  const descriptionErrors: string[] = [];
  const description = parseLocalized(raw.description, 'description', descriptionErrors);
  errors.push(...nameErrors, ...descriptionErrors);

  const audience = raw.audience as ThemeAudience;
  if (!AUDIENCES.includes(audience)) errors.push(`audience must be one of ${AUDIENCES.join(', ')}`);

  const tier = raw.tier as ThemeTier;
  if (!TIERS.includes(tier)) errors.push(`tier must be one of ${TIERS.join(', ')}`);

  const cost = raw.cost;
  if (typeof cost !== 'number' || !Number.isInteger(cost) || cost < 0) {
    errors.push('cost must be a non-negative integer');
  }

  const isDefault = raw.default === true;
  if (raw.default !== undefined && typeof raw.default !== 'boolean') {
    errors.push('default must be a boolean');
  }
  if (isDefault && (tier !== 'default' || cost !== 0)) {
    errors.push('the default theme must have tier "default" and cost 0');
  }
  if (!isDefault && tier === 'default') errors.push('tier "default" is only for the default theme');

  const palette = isRecord(raw.palette) ? raw.palette : {};
  if (!isHexColour(palette.background)) errors.push('palette.background must be #rrggbb');
  if (!isHexColour(palette.accent)) errors.push('palette.accent must be #rrggbb');

  let artUrl: string | undefined;
  if (raw.art !== undefined) {
    if (typeof raw.art !== 'string' || !Object.prototype.hasOwnProperty.call(artUrls, raw.art)) {
      errors.push(`art file ${JSON.stringify(raw.art)} is not in the theme folder`);
    } else {
      artUrl = artUrls[raw.art];
    }
  }

  if (errors.length > 0 || !name || !description) return { ok: false, errors };

  return {
    ok: true,
    theme: {
      id: folderId,
      name,
      description,
      audience,
      tier,
      cost: cost as number,
      isDefault,
      palette: {
        background: palette.background as string,
        accent: palette.accent as string,
      },
      ...(artUrl !== undefined ? { artUrl } : {}),
    },
  };
}

function splitThemePath(path: string): { folderId: string; fileName: string } | null {
  const parts = path.split('/');
  if (parts.length < 2) return null;
  return { folderId: parts[parts.length - 2]!, fileName: parts[parts.length - 1]! };
}

export interface ThemeCatalogBuild {
  catalog: ThemeDefinition[];
  errors: Record<string, string[]>;
}

/**
 * Build the catalog from glob results keyed by path (`./themes/<id>/<file>`).
 * Invalid themes are left out and reported in `errors` by folder id.
 */
export function buildThemeCatalog(
  jsonModules: Record<string, unknown>,
  artModules: Record<string, string>,
): ThemeCatalogBuild {
  const artByFolder: Record<string, Record<string, string>> = {};
  for (const [path, url] of Object.entries(artModules)) {
    const split = splitThemePath(path);
    if (!split) continue;
    (artByFolder[split.folderId] ??= {})[split.fileName] = url;
  }

  const catalog: ThemeDefinition[] = [];
  const errors: Record<string, string[]> = {};
  for (const [path, raw] of Object.entries(jsonModules)) {
    const split = splitThemePath(path);
    if (!split) continue;
    const result = parseTheme(raw, split.folderId, artByFolder[split.folderId] ?? {});
    if (result.ok) catalog.push(result.theme);
    else errors[split.folderId] = result.errors;
  }

  const defaults = catalog.filter((theme) => theme.isDefault);
  for (const extra of defaults.slice(1)) {
    errors[extra.id] = ['only one theme may be the default'];
  }
  const kept = catalog.filter((theme) => !theme.isDefault || theme === defaults[0]);
  kept.sort((a, b) => a.cost - b.cost || a.id.localeCompare(b.id));
  return { catalog: kept, errors };
}

const themeJsonModules = import.meta.glob<unknown>('./themes/*/theme.json', {
  eager: true,
  import: 'default',
});
const themeArtModules = import.meta.glob<string>('./themes/*/*.{svg,png,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
});

const built = buildThemeCatalog(themeJsonModules, themeArtModules);
if (import.meta.env.DEV) {
  for (const [id, themeErrors] of Object.entries(built.errors)) {
    console.warn(`Theme "${id}" was left out of the catalog:`, themeErrors);
  }
}

/** Every valid theme, sorted by cost. */
export const THEME_CATALOG: readonly ThemeDefinition[] = built.catalog;

// Only reached if the catalog has no valid default; keeps today's look.
const FALLBACK_DEFAULT_THEME: ThemeDefinition = {
  id: 'classic',
  name: { et: 'Klassikaline', en: 'Classic' },
  description: { et: 'Klassikaline', en: 'Classic' },
  audience: 'kid',
  tier: 'default',
  cost: 0,
  isDefault: true,
  palette: { background: '#f8fafc', accent: '#9333ea' },
};

export function getTheme(
  id: string,
  catalog: readonly ThemeDefinition[] = THEME_CATALOG,
): ThemeDefinition | undefined {
  return catalog.find((theme) => theme.id === id);
}

export function getDefaultTheme(
  catalog: readonly ThemeDefinition[] = THEME_CATALOG,
): ThemeDefinition {
  return catalog.find((theme) => theme.isDefault) ?? FALLBACK_DEFAULT_THEME;
}

/** The theme to show: the applied one if it exists and is owned, else the default. */
export function resolveAppliedTheme(
  appliedId: string | undefined,
  ownedIds: readonly string[],
  catalog: readonly ThemeDefinition[] = THEME_CATALOG,
): ThemeDefinition {
  const fallback = getDefaultTheme(catalog);
  if (!appliedId) return fallback;
  const theme = getTheme(appliedId, catalog);
  if (!theme) return fallback;
  if (theme.isDefault || ownedIds.includes(theme.id)) return theme;
  return fallback;
}
