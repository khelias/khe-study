import { describe, expect, it } from 'vitest';
import {
  buildThemeCatalog,
  getDefaultTheme,
  getTheme,
  parseTheme,
  resolveAppliedTheme,
} from '../themeCatalog';
import type { ThemeDefinition } from '../types';

const validRaw = {
  id: 'sea',
  name: { et: 'Meri', en: 'Sea' },
  description: { et: 'Lained', en: 'Waves' },
  audience: 'kid',
  tier: 'common',
  cost: 30,
  palette: { background: '#e0f2fe', accent: '#0284c7' },
  art: 'background.svg',
};

const artUrls = { 'background.svg': '/assets/sea.svg' };

function errorsFor(raw: unknown, folderId = 'sea', art: Record<string, string> = artUrls) {
  const result = parseTheme(raw, folderId, art);
  if (result.ok) throw new Error('expected parse to fail');
  return result.errors;
}

function theme(overrides: Partial<ThemeDefinition>): ThemeDefinition {
  return {
    id: 'x',
    name: { et: 'X', en: 'X' },
    description: { et: 'X', en: 'X' },
    audience: 'kid',
    tier: 'common',
    cost: 10,
    isDefault: false,
    palette: { background: '#ffffff', accent: '#000000' },
    ...overrides,
  };
}

const catalog: ThemeDefinition[] = [
  theme({ id: 'base', tier: 'default', cost: 0, isDefault: true }),
  theme({ id: 'sea', cost: 30 }),
  theme({ id: 'space', tier: 'special', cost: 100 }),
];

describe('parseTheme', () => {
  it('accepts a valid theme and resolves its art', () => {
    const result = parseTheme(validRaw, 'sea', artUrls);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.theme).toMatchObject({
      id: 'sea',
      tier: 'common',
      cost: 30,
      isDefault: false,
      artUrl: '/assets/sea.svg',
    });
  });

  it('accepts a theme without art', () => {
    const { art: _art, ...noArt } = validRaw;
    const result = parseTheme(noArt, 'sea', {});
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.theme.artUrl).toBeUndefined();
  });

  it('rejects a non-object', () => {
    expect(errorsFor(null)).toEqual(['theme.json must be an object']);
    expect(errorsFor([])).toEqual(['theme.json must be an object']);
  });

  it('requires the id to equal the folder name', () => {
    expect(errorsFor(validRaw, 'ocean')).toEqual([expect.stringContaining('folder name')]);
  });

  it('requires a name and description in both locales', () => {
    expect(errorsFor({ ...validRaw, name: { et: 'Meri' } })).toEqual([
      expect.stringContaining('name.en'),
    ]);
    expect(errorsFor({ ...validRaw, description: 'Waves' })).toEqual([
      expect.stringContaining('description must be an object'),
    ]);
    expect(errorsFor({ ...validRaw, name: { et: ' ', en: 'Sea' } })).toEqual([
      expect.stringContaining('name.et'),
    ]);
  });

  it('requires hex palette colours', () => {
    expect(errorsFor({ ...validRaw, palette: { background: 'blue', accent: '#0284c7' } })).toEqual([
      expect.stringContaining('palette.background'),
    ]);
    expect(errorsFor({ ...validRaw, palette: undefined })).toHaveLength(2);
  });

  it('requires a non-negative integer cost', () => {
    for (const cost of [-1, 2.5, '30', undefined]) {
      expect(errorsFor({ ...validRaw, cost })).toEqual([expect.stringContaining('cost')]);
    }
  });

  it('requires a known tier and audience', () => {
    expect(errorsFor({ ...validRaw, tier: 'legendary' })).toEqual([
      expect.stringContaining('tier'),
    ]);
    expect(errorsFor({ ...validRaw, audience: 'teen' })).toEqual([
      expect.stringContaining('audience'),
    ]);
  });

  it('keeps the default tier and flag together', () => {
    expect(errorsFor({ ...validRaw, tier: 'default', cost: 0 })).toEqual([
      expect.stringContaining('only for the default theme'),
    ]);
    expect(errorsFor({ ...validRaw, default: true })).toEqual([
      expect.stringContaining('tier "default" and cost 0'),
    ]);
    expect(errorsFor({ ...validRaw, default: 'yes' })).toEqual([
      expect.stringContaining('default must be a boolean'),
    ]);
  });

  it('requires the art file to exist in the folder', () => {
    expect(errorsFor(validRaw, 'sea', {})).toEqual([expect.stringContaining('background.svg')]);
    expect(errorsFor({ ...validRaw, art: 3 })).toEqual([expect.stringContaining('art file')]);
    expect(errorsFor({ ...validRaw, art: 'constructor' })).toEqual([
      expect.stringContaining('art file'),
    ]);
  });
});

describe('buildThemeCatalog', () => {
  const classicRaw = {
    ...validRaw,
    id: 'classic',
    tier: 'default',
    cost: 0,
    default: true,
    art: undefined,
  };

  it('groups art by folder, drops invalid themes and sorts by cost', () => {
    const built = buildThemeCatalog(
      {
        './themes/sea/theme.json': validRaw,
        './themes/classic/theme.json': classicRaw,
        './themes/broken/theme.json': { id: 'broken' },
      },
      { './themes/sea/background.svg': '/assets/sea.svg' },
    );
    expect(built.catalog.map((t) => t.id)).toEqual(['classic', 'sea']);
    expect(built.catalog[1]?.artUrl).toBe('/assets/sea.svg');
    expect(Object.keys(built.errors)).toEqual(['broken']);
  });

  it('keeps only the first default theme', () => {
    const built = buildThemeCatalog(
      {
        './themes/classic/theme.json': classicRaw,
        './themes/plain/theme.json': { ...classicRaw, id: 'plain' },
      },
      {},
    );
    expect(built.catalog).toHaveLength(1);
    expect(Object.keys(built.errors)).toHaveLength(1);
  });

  it('ignores paths without a folder', () => {
    const built = buildThemeCatalog({ 'theme.json': validRaw }, { 'art.svg': '/a.svg' });
    expect(built.catalog).toEqual([]);
  });
});

describe('theme lookup and resolution', () => {
  it('finds themes by id', () => {
    expect(getTheme('sea', catalog)?.id).toBe('sea');
    expect(getTheme('nope', catalog)).toBeUndefined();
    expect(getDefaultTheme(catalog).id).toBe('base');
  });

  it('falls back to a built-in default when the catalog has none', () => {
    const fallback = getDefaultTheme([]);
    expect(fallback.isDefault).toBe(true);
    expect(fallback.palette.background).toBe('#f8fafc');
  });

  it('resolves an owned applied theme', () => {
    expect(resolveAppliedTheme('sea', ['sea'], catalog).id).toBe('sea');
  });

  it('falls back to the default for missing, unknown or unowned ids', () => {
    expect(resolveAppliedTheme(undefined, ['sea'], catalog).id).toBe('base');
    expect(resolveAppliedTheme('gone', ['gone'], catalog).id).toBe('base');
    expect(resolveAppliedTheme('space', ['sea'], catalog).id).toBe('base');
  });

  it('resolves the default theme without ownership', () => {
    expect(resolveAppliedTheme('base', [], catalog).id).toBe('base');
  });
});
