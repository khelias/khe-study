import { readdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { contrastRatio } from '../contrast';
import { THEME_CATALOG } from '../themeCatalog';

// App text colours that sit directly on the themed background.
const HEADING_TEXT = '#0f172a'; // slate-900
const BODY_TEXT = '#475569'; // slate-600

const themesDir = resolve(process.cwd(), 'src/meta/themes');
const themeFolders = readdirSync(themesDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((name) => existsSync(resolve(themesDir, name, 'theme.json')));

describe('shipped theme catalog', () => {
  it('loads every theme.json without dropping any', () => {
    expect(THEME_CATALOG.map((t) => t.id).sort()).toEqual([...themeFolders].sort());
  });

  it('has exactly one default theme, and it is free', () => {
    const defaults = THEME_CATALOG.filter((t) => t.isDefault);
    expect(defaults).toHaveLength(1);
    expect(defaults[0]?.cost).toBe(0);
  });

  it.each(THEME_CATALOG.map((t) => [t.id, t.palette.background] as const))(
    '%s keeps app text readable on its background',
    (_id, background) => {
      expect(contrastRatio(HEADING_TEXT, background)).toBeGreaterThanOrEqual(7);
      expect(contrastRatio(BODY_TEXT, background)).toBeGreaterThanOrEqual(4.5);
    },
  );
});
